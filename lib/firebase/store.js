import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { randomUUID } from "node:crypto";
import { validateDraft, normalizeProgress } from "../learning/domain.mjs";
const now = () => new Date().toISOString();
const error = (message) => {
  throw new Error(message);
};
function row(snapshot) {
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
class FirebaseQuery {
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this.filters = [];
    this.sort = null;
    this.operation = "read";
    this.fields = "*";
  }
  select(fields = "*") {
    this.fields = fields;
    return this;
  }
  eq(key, value) {
    this.filters.push([key, "==", value]);
    return this;
  }
  in(key, values) {
    this.filters.push([key, "in", values]);
    return this;
  }
  order(key, { ascending = true } = {}) {
    this.sort = [key, ascending ? "asc" : "desc"];
    return this;
  }
  insert(value) {
    this.operation = "insert";
    this.value = value;
    return this;
  }
  update(value) {
    this.operation = "update";
    this.value = value;
    return this;
  }
  single() {
    this.one = true;
    this.required = true;
    return this;
  }
  maybeSingle() {
    this.one = true;
    return this;
  }
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
  async execute() {
    try {
      const ref = collection(this.db, this.name);
      let rows;
      if (this.operation === "insert") {
        const id = this.value.id || this.value.user_id || randomUUID();
        const data = {
          ...this.value,
          id,
          created_at: now(),
          updated_at: now(),
          ...(this.name === "learning_lessons" ? { revision: 1 } : {}),
        };
        await runTransaction(this.db, async (tx) => {
          const ref = doc(this.db, this.name, id);
          if ((await tx.get(ref)).exists()) error("ALREADY_EXISTS");
          tx.set(ref, data);
        });
        rows = [data];
      } else {
        const constraints = this.filters.map((f) => where(...f));
        if (this.sort) constraints.push(orderBy(...this.sort));
        const idFilter = this.filters.find(([key]) => key === "id"),
          uidFilter =
            this.name === "learning_admins"
              ? this.filters.find(([key]) => key === "user_id")
              : null;
        if (idFilter || uidFilter) {
          const [, op, value] = idFilter || uidFilter;
          const ids = op === "in" ? value : [value];
          rows = (
            await Promise.all(
              ids.map((id) => getDoc(doc(this.db, this.name, id))),
            )
          )
            .map(row)
            .filter(Boolean);
        } else {
          const snapshots = await getDocs(query(ref, ...constraints));
          rows = snapshots.docs.map((s) => ({ id: s.id, ...s.data() }));
        }
        if (this.operation === "update")
          rows = await Promise.all(
            rows.map(async (previous) =>
              runTransaction(this.db, async (tx) => {
                const ref = doc(this.db, this.name, previous.id),
                  snapshot = await tx.get(ref);
                const current = row(snapshot);
                if (
                  !current ||
                  this.filters.some(
                    ([k, op, v]) => op === "==" && current[k] !== v,
                  )
                )
                  error("REVISION_CONFLICT");
                const changed = { ...current, ...this.value };
                tx.update(ref, this.value);
                return changed;
              }),
            ),
          );
      }
      if (this.fields !== "*") {
        const fields = this.fields.split(",");
        rows = rows.map((r) =>
          Object.fromEntries(
            fields.filter((k) => r[k] !== undefined).map((k) => [k, r[k]]),
          ),
        );
      }
      if (this.required && rows.length !== 1) error("NOT_FOUND");
      return { data: this.one ? rows[0] || null : rows, error: null };
    } catch (e) {
      return { data: null, error: { code: e.code, message: e.message } };
    }
  }
}
export class FirebaseStore {
  constructor(db, userId = null) {
    this.firestore = db;
    this.userId = userId;
  }
  from(name) {
    return new FirebaseQuery(this.firestore, name);
  }
  async rpc(name, p) {
    try {
      const db = this.firestore;
      const data = await runTransaction(db, async (tx) => {
        if (name === "learning_save_progress") {
          const valid = normalizeProgress({
            answers: p.p_answers,
            step: p.p_step,
            completed: p.p_completed,
            assessment: p.p_assessment,
          });
          const uid = this.userId;
          if (!uid) error("FORBIDDEN");
          const id = `${uid}_${p.p_release}`,
            ref = doc(db, "learning_progress", id);
          const [currentSnap, releaseSnap] = await Promise.all([
            tx.get(ref),
            tx.get(doc(db, "learning_releases", p.p_release)),
          ]);
          const current = row(currentSnap),
            release = row(releaseSnap);
          if (!release) error("FORBIDDEN");
          if ((current?.revision || 0) !== p.p_revision)
            error("REVISION_CONFLICT");
          const next = {
            id,
            user_id: uid,
            release_id: p.p_release,
            lesson_id: release.lesson_id,
            universe: release.content.universe,
            title: release.content.title,
            version: release.version,
            ...valid,
            revision: (current?.revision || 0) + 1,
            updated_at: now(),
          };
          tx.set(ref, next);
          return next;
        }
        const lessonRef = doc(db, "learning_lessons", p.p_id),
          lesson = row(await tx.get(lessonRef));
        if (!lesson || lesson.revision !== p.p_revision)
          error("REVISION_CONFLICT");
        if (name === "learning_save_draft") {
          const next = {
            ...lesson,
            draft: validateDraft(p.p_draft),
            revision: lesson.revision + 1,
            updated_at: now(),
          };
          tx.set(lessonRef, next);
          return next;
        }
        const catRef = doc(db, "learning_catalog", lesson.id),
          catalog = row(await tx.get(catRef));
        if (name === "learning_unpublish") {
          for (const id of catalog?.materialIds || [])
            tx.set(doc(db, "learning_file_access", id), {
              active: false,
              scope: "member",
              lesson_id: lesson.id,
              owner_uid: this.userId,
            });
          tx.delete(catRef);
          tx.update(lessonRef, {
            revision: lesson.revision + 1,
            updated_at: now(),
          });
          return null;
        }
        if (name !== "learning_publish") error("UNKNOWN_ACTION");
        const draft = validateDraft(lesson.draft, true),
          slugRef = doc(db, "learning_slugs", draft.slug),
          slug = row(await tx.get(slugRef));
        if (lesson.published_slug && lesson.published_slug !== draft.slug)
          error("SLUG_IMMUTABLE");
        if (slug && slug.lesson_id !== lesson.id) error("SLUG_TAKEN");
        const assets = await Promise.all(
          draft.materials.map((m) => tx.get(doc(db, "learning_assets", m.id))),
        );
        if (
          assets.some(
            (s) =>
              !s.exists() ||
              !s.data().ready ||
              s.data().lesson_id !== lesson.id,
          )
        )
          error("ASSET_NOT_READY");
        const version = (lesson.last_version || 0) + 1,
          releaseId = randomUUID(),
          released = now();
        const release = {
          id: releaseId,
          lesson_id: lesson.id,
          version,
          content: draft,
          created_at: released,
        };
        const next = {
          id: lesson.id,
          lesson_id: lesson.id,
          release_id: releaseId,
          slug: draft.slug,
          title: draft.title,
          summary: draft.summary,
          universe: draft.universe,
          age_group: draft.ageGroup,
          access: draft.access,
          version,
          published_at: released,
          materialIds: draft.materials.map((m) => m.id),
        };
        for (const oldId of catalog?.materialIds || [])
          if (!next.materialIds.includes(oldId))
            tx.set(doc(db, "learning_file_access", oldId), {
              active: false,
              scope: draft.access,
              lesson_id: lesson.id,
              owner_uid: this.userId,
            });
        for (const assetId of next.materialIds)
          tx.set(doc(db, "learning_file_access", assetId), {
            active: true,
            scope: draft.access,
            lesson_id: lesson.id,
            owner_uid: this.userId,
          });
        tx.set(doc(db, "learning_releases", releaseId), release);
        tx.set(catRef, next);
        tx.set(slugRef, { lesson_id: lesson.id });
        tx.update(lessonRef, {
          revision: lesson.revision + 1,
          published_slug: draft.slug,
          last_version: version,
          updated_at: released,
        });
        return next;
      });
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { code: e.code, message: e.message } };
    }
  }
}
