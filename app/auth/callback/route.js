import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing_token', request.url));
  }

  try {
    // Exchange the one-time token for real JWT tokens
    // This runs SERVER-SIDE — tokens never exposed to browser JS
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

    // Redirect to dashboard and set HTTP-only cookies server-side
    const dashboardUrl = new URL('/dashboard', request.url);
    const res = NextResponse.redirect(dashboardUrl);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 3 * 60, // 3 minutes in seconds
      path: '/'
    });

    res.cookies.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 5 * 60, // 5 minutes in seconds
      path: '/'
    });

    return res;

  } catch (error) {
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}