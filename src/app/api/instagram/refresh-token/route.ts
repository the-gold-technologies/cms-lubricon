import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Instagram Access Token is required.' },
        { status: 400 }
      );
    }

    const trimmedToken = token.trim();

    // 1. Try Instagram Refresh Access Token Endpoint
    const igRefreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(
      trimmedToken
    )}`;

    const res = await fetch(igRefreshUrl);
    const data = await res.json();

    if (data.access_token) {
      return NextResponse.json({
        success: true,
        access_token: data.access_token,
        expires_in: data.expires_in || 5184000, // ~60 days
      });
    }

    // 2. If the first attempt failed, attempt Facebook Graph API exchange endpoint
    let fbData: any = {};
    if (data.error) {
      const fbRefreshUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&fb_exchange_token=${encodeURIComponent(
        trimmedToken
      )}`;
      const fbRes = await fetch(fbRefreshUrl);
      fbData = await fbRes.json();

      if (fbData.access_token) {
        return NextResponse.json({
          success: true,
          access_token: fbData.access_token,
          expires_in: fbData.expires_in || 5184000,
        });
      }
    }

    const rawError = data.error?.message || fbData.error?.message || '';
    let userFriendlyError = rawError;

    if (rawError.includes('expired') || data.error?.code === 190) {
      userFriendlyError =
        'Token has already expired or is invalid. Tokens can only be refreshed before they expire. Please generate a new token via Meta Developer Portal.';
    } else if (!userFriendlyError) {
      userFriendlyError = 'Failed to refresh token. Please check if the token is valid.';
    }

    return NextResponse.json(
      { success: false, error: userFriendlyError, details: rawError },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error refreshing Instagram token:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
