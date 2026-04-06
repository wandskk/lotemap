import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

function isNextDynamicUsageError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    (e as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (e) {
    if (isNextDynamicUsageError(e)) {
      throw e;
    }
    console.error("[getSession]", e);
    return null;
  }
}
