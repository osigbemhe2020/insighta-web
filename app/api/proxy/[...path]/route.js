import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://site--hng14-backend--nlrjqkv9zhwn.code.run';

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    
    // Get the path after /api/proxy
    const pathIndex = url.pathname.indexOf('/api/proxy');
    const targetPath = url.pathname.slice(pathIndex + '/api/proxy'.length);
    const targetUrl = `${BACKEND_URL}${targetPath}${url.search}`;

    // Prepare headers to forward
    const headers = new Headers();
    
    // Forward content-type
    const contentType = request.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    
    // Forward API version header
    const apiVersion = request.headers.get('x-api-version');
    if (apiVersion) headers.set('X-API-Version', apiVersion);
    
    // Forward authorization header (for CLI compatibility)
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers.set('Authorization', authHeader);
    
    // Forward cookies from browser
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) headers.set('Cookie', cookieHeader);

    // Build fetch options
    const fetchOptions = {
      method: request.method,
      headers
    };

    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = await request.text();
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    // Build the response
    const nextResponse = NextResponse.json(data, {
      status: response.status
    });

    // Forward Set-Cookie headers from backend
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    }

    return nextResponse;

  } catch (error) {
    console.error('Proxy error:', error.message);
    return NextResponse.json(
      { status: 'error', message: 'Service unavailable' },
      { status: 502 }
    );
  }
}

export async function GET(request) { return handleRequest(request); }
export async function POST(request) { return handleRequest(request); }
export async function PUT(request) { return handleRequest(request); }
export async function DELETE(request) { return handleRequest(request); }
export async function PATCH(request) { return handleRequest(request); }