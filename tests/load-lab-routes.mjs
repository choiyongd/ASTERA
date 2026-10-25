import { readFile } from "node:fs/promises";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as firestore from "firebase/firestore";
const require = createRequire(import.meta.url),
  root = fileURLToPath(new URL("..", import.meta.url));
export async function loadLabRoute(path, context) {
  const filename = resolve(root, path);
  const transformed = await require("next/dist/build/swc").transform(
    await readFile(filename, "utf8"),
    {
      filename,
      jsc: { parser: { syntax: "ecmascript" } },
      module: { type: "commonjs" },
    },
  );
  const module = new Module(filename);
  module.paths = Module._nodeModulePaths(dirname(filename));
  class LearningError extends Error {
    constructor(message, status = 400) {
      super(message);
      this.status = status;
    }
  }
  module.require = (id) => {
    if (id === "firebase/firestore") return firestore;
    if (id === "@/lib/learning/server")
      return {
        validId: (id) => {
          if (!/^[0-9a-f-]{36}$/i.test(id))
            throw new LearningError("invalid", 404);
          return id;
        },
        LearningError,
        readJson: (request) => request.json(),
        dbCheck: (result) => {
          if (result.error) throw Error(result.error.message);
          return result.data;
        },
        learningAction: async (request, action) => {
          try {
            return Response.json(await action(context));
          } catch (error) {
            return Response.json(
              { error: error.message },
              { status: error.status || 400 },
            );
          }
        },
      };
    if (id.startsWith("@/")) return require(resolve(root, id.slice(2)));
    return require(id);
  };
  module._compile(transformed.code, filename);
  return module.exports;
}
