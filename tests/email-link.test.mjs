import test from "node:test";
import assert from "node:assert/strict";
import { verificationPath } from "../lib/firebase/email-link.mjs";
const host = "astera-learning-choiyongd.firebaseapp.com",
  app = "https://astera-mu.vercel.app",
  code = "only-a-disposable-test-code";
test("email verification links preserve the code and repair escaped separators or a missing mode", () => {
  for (const query of [
    "mode=verifyEmail&oobCode=",
    "mode=verifyEmail&amp;oobCode=",
    "oobCode=",
  ])
    assert.equal(
      verificationPath(
        "https://" + host + "/__/auth/action?" + query + code,
        host,
        app,
      ),
      "/auth/action?mode=verifyEmail&oobCode=" + code,
    );
});
test("email link entry rejects another project, a different action and malformed codes", () => {
  for (const link of [
    "https://another-project.firebaseapp.com/__/auth/action?oobCode=" + code,
    "https://" + host + "/__/auth/action?mode=resetPassword&oobCode=" + code,
    "https://" + host + "/__/auth/action?mode=verifyEmail",
    "https://" + host + "/__/auth/action?oobCode=bad%20code",
    "http://" + host + "/__/auth/action?oobCode=" + code,
  ])
    assert.throws(() => verificationPath(link, host, app));
});
