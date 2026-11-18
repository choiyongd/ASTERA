import "server-only";
import { firebaseAdminConfigured } from "./firebase/admin";

export function membershipSalesReady() {
  return process.env.MEMBERSHIP_SALES_ENABLED === "true" &&
    firebaseAdminConfigured() &&
    Boolean(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) &&
    Boolean(process.env.TOSS_SECRET_KEY) &&
    !process.env.TOSS_SECRET_KEY.startsWith("YOUR_");
}
