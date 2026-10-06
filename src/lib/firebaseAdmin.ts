import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Render / production
    serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT
    );
} else {
    // Local development
    const serviceAccountPath = path.join(
        process.cwd(),
        "firebase-service-account.json"
    );

    serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf-8")
    );
}

const firebaseApp =
    getApps().length === 0
        ? initializeApp({
            credential: cert(serviceAccount),
        })
        : getApps()[0];

export const firebaseAdminAuth = getAuth(firebaseApp);