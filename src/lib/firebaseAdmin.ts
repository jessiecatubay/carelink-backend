import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";

function getFirebaseCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    return cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsed.private_key && parsed.private_key.includes("\\n")) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return cert(parsed);
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e);
    }
  }

  const serviceAccountPath = path.join(
    process.cwd(),
    "firebase-service-account.json"
  );
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      return cert(parsed);
    } catch (e) {
      console.warn("Failed to parse local firebase-service-account.json:", e);
    }
  }

  return null;
}

const credential = getFirebaseCredential();
const firebaseApp =
  getApps().length === 0 && credential
    ? initializeApp({ credential })
    : getApps().length > 0
    ? getApps()[0]
    : null;

export const firebaseAdminAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseAdminMessaging = firebaseApp ? getMessaging(firebaseApp) : null;