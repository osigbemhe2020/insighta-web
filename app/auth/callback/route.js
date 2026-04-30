import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://site--hng14-backend--nlrjqkv9zhwn.code.run';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing_token', request.url));
  }

  try {
    // Exchange the one-time token for real JWT tokens
    const response = await fetch(`${BACKEND_URL}/auth/exchange?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error('Token exchange failed:', await response.text());
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    const data = await response.json();
    const { access_token, refresh_token } = data.data;

    // Instead of setting cookies directly, call backend to set them
    // This way cookies are on the backend domain
    const setCookieResponse = await fetch(`${BACKEND_URL}/auth/set-cookies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token, refresh_token })
    });

    if (!setCookieResponse.ok) {
      console.error('Failed to set cookies on backend');
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    // Get the Set-Cookie headers from backend and forward them
    const setCookieHeaders = setCookieResponse.headers.getSetCookie
      ? setCookieResponse.headers.getSetCookie()
      : [];

    const dashboardUrl = new URL('/dashboard', request.url);
    const res = NextResponse.redirect(dashboardUrl);

    // Forward the backend's Set-Cookie headers to the browser
    setCookieHeaders.forEach(cookie => {
      res.headers.append('Set-Cookie', cookie);
    });

    return res;

  } catch (error) {
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
