import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "@/repositories/user.repository";
import { TokenRepository } from "@/repositories/token.repository";
import { generateTokens } from "@/utils/jwt";

const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_WEB_CLIENT_ID);

export async function GoogleAuthService(idToken: string) {
  const userRepository = new UserRepository();

  try {
    if (!GOOGLE_WEB_CLIENT_ID) {
      console.error("GOOGLE_WEB_CLIENT_ID is not configured");

      return {
        code: 500,
        status: "error",
        message: "Google authentication is not configured.",
      };
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return {
        code: 401,
        status: "error",
        message: "Invalid Google account.",
      };
    }

    const googleId = payload.sub;
    const email = payload.email?.trim().toLowerCase();

    if (!googleId || !email) {
      return {
        code: 401,
        status: "error",
        message: "Google account information is incomplete.",
      };
    }

    if (payload.email_verified !== true) {
      return {
        code: 403,
        status: "error",
        message: "Your Google email address is not verified.",
      };
    }

    let user = await userRepository.findByGoogleId(googleId);

    if (!user) {
      user = await userRepository.findByEmail(email);

      if (user) {
        user = await userRepository.linkGoogleAccount(user.id, googleId);
      }
    }

    if (!user) {
      user = await userRepository.create({
        firstName: payload.given_name ?? "",
        lastName: payload.family_name ?? "",
        email,
        googleId,
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

    const tokens = generateTokens({
      id: user.id,
      email: user.email ?? email,
      role: user.role,
    });

    await new TokenRepository().createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      code: 200,
      status: "success",
      message: "Google authentication successful.",
      data: {
        user: {
          id: user?.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          onBoarded: user.onBoarded,
          emailVerified: user.emailVerified,
          emergencyContact: user.nonPatientProfile?.emergencyContact,
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
