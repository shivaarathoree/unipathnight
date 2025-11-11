import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

export async function getOptionalUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
