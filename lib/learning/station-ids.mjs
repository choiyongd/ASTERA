import { createHash } from "node:crypto";
export function stationUuid(key) {
  const hash = createHash("sha256")
    .update("astera-gyoyang-v02:" + key)
    .digest("hex")
    .slice(0, 32)
    .split("");
  hash[12] = "5";
  hash[16] = "8";
  const s = hash.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
