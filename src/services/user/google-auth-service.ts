import { firebaseAdminAuth } from "@/lib/firebaseAdmin";
import { UserRepository } from "@/repositories/user.repository";
import { TokenRepository } from "@/repositories/token.repository";
import { generateTokens } from "@/utils/jwt";

export async function GoogleAuthService(idToken: string) {
  const userRepository = new UserRepository();

  try {
    if (!idToken) {
      return {
        code: 400,
        status: "error",
        message: "Firebase ID token is required.",
      };
    }

    if (!firebaseAdminAuth) {
      throw new Error("Firebase Admin Auth is not configured");
    }

    // Verify the Firebase ID token
    const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);


    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email?.trim().toLowerCase();

    if (!firebaseUid || !email) {
      return {
        code: 401,
        status: "error",
        message: "Firebase account information is incomplete.",
      };
    }

    if (decodedToken.email_verified !== true) {
      return {
        code: 403,
        status: "error",
        message: "Your Google email address is not verified.",
      };
    }

    let user = await userRepository.findByGoogleId(firebaseUid);

    // If the Google account is not linked yet,
    // check if the email already belongs to a CareLink account.
    if (!user) {
      user = await userRepository.findByEmail(email);

      if (user) {
        user = await userRepository.linkGoogleAccount(
          user.id,
          firebaseUid,
        );
      }
    }

    // Create a new CareLink account
    // if this Google account does not exist yet.
    if (!user) {
      user = await userRepository.create({
        firstName: decodedToken.name?.split(" ")[0] ?? "",
        lastName:
          decodedToken.name
            ?.split(" ")
            .slice(1)
            .join(" ") ?? "",
        email,
        googleId: firebaseUid,
        emailVerified: true,
        role: "USER",
        onBoarded: false,
      });
    }

    if (!user) {
      return {
        code: 500,
        status: "error",
        message: "Unable to create or retrieve user.",
      };
    }

    // Generate CareLink JWT tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email ?? email,
      role: user.role,
    });

    // Save refresh token
    await new TokenRepository().createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
    });

    return {
      code: 200,
      status: "success",
      message: "Google authentication successful.",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          onBoarded: user.onBoarded,
          emailVerified: user.emailVerified,
          emergencyContact:
            user.nonPatientProfile?.emergencyContact,
          googleId: user.googleId,
          hasPassword: Boolean(user.password),
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  } catch (error) {
    console.error("Google authentication error:", error);

    return {
      code: 401,
      status: "error",
      message: "Unable to authenticate with Google.",
    };
  }
}