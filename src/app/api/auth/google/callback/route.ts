import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const stateStr = url.searchParams.get("state");

  let returnUrl = "/";
  if (stateStr) {
    try {
      const parsed = JSON.parse(Buffer.from(stateStr, "base64url").toString("utf-8"));
      if (parsed.returnUrl && typeof parsed.returnUrl === "string" && parsed.returnUrl.startsWith("/")) {
        returnUrl = parsed.returnUrl;
      }
    } catch {
      // Ignore parse error
    }
  }

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthFailed`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleConfigMissing`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=GoogleTokenExchangeFailed`);
    }

    const tokenData = await tokenResponse.json();

    // 2. Fetch User Profile
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=GoogleUserInfoFailed`);
    }

    const googleUser = await userInfoResponse.json();

    // 3. Chuyển hướng kèm dữ liệu OAuth để client-side AuthContext tự động lưu session
    const oauthPayload = Buffer.from(
      JSON.stringify({
        name: googleUser.name || "Thành viên Google",
        email: googleUser.email,
        avatar: googleUser.picture || "🎓",
        provider: "google",
      })
    ).toString("base64url");

    return NextResponse.redirect(`${baseUrl}/login?oauth_success=${oauthPayload}&returnTo=${encodeURIComponent(returnUrl)}`);
  } catch (err: unknown) {
    console.error("[Google OAuth Callback Error]:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthServerError`);
  }
}
