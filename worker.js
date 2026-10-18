/**
 * Cloudflare Worker for VKU Expense OCR
 * - Serves Static Assets from /web
 * - Injects Security Headers (CSP, Nosniff, Referrer-Policy, Permissions-Policy)
 * - Provides Server-Side Google OAuth ID Token Verification (/api/auth/google-verify)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ========================================================================
    // 1. API: SERVER-SIDE GOOGLE ID TOKEN VERIFICATION (A4)
    // ========================================================================
    if (url.pathname === '/api/auth/google-verify' && request.method === 'POST') {
      try {
        const body = await request.json();
        const idToken = body?.idToken || body?.credential;

        if (!idToken) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Thiếu ID Token xác thực từ Google Identity Services.'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        // Verify with Google's tokeninfo endpoint server-side
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!verifyRes.ok) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Mã xác thực Google không hợp lệ hoặc đã hết hạn.'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }

        const payload = await verifyRes.json();
        const email = (payload.email || '').trim().toLowerCase();

        // Extract user metadata (supports both VKU and personal Google accounts)
        const name = payload.name || email.split('@')[0];
        const isVku = email.endsWith('@vku.udn.vn');
        const studentId = isVku ? email.split('@')[0].toUpperCase() : 'MEM-' + Date.now().toString().slice(-4);
        const role = isVku ? 'Thành viên VKU (Google Verified)' : 'Thành viên SmartSpend (Google Verified)';

        return new Response(JSON.stringify({
          success: true,
          message: 'Xác thực Google ID Token thành công',
          user: {
            id: 'USR-G-' + (payload.sub || Date.now()),
            fullName: name,
            studentId: studentId,
            className: isVku ? 'VKU-Member' : 'Cá nhân',
            email: email,
            avatar: payload.picture || '',
            role: role,
            authProvider: 'GOOGLE_OAUTH2'
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Lỗi máy chủ khi xác thực token: ' + err.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    }

    // ========================================================================
    // 2. SERVE STATIC ASSETS WITH ENFORCED SECURITY HEADERS (A6)
    // ========================================================================
    const response = await env.ASSETS.fetch(request);
    const newHeaders = new Headers(response.headers);

    // Prevent MIME-sniffing
    newHeaders.set('X-Content-Type-Options', 'nosniff');

    // Strict Referrer Policy
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Limit device APIs: camera is allowed for receipt capture, disable mic & geo
    newHeaders.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');

    // Content Security Policy
    newHeaders.set(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' blob: data:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://accounts.google.com https://cdn.jsdelivr.net; " +
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://cdn.jsdelivr.net https://tessdata.projectnaptha.com https://unpkg.com blob: data:; " +
      "img-src 'self' data: blob: https:; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "worker-src 'self' blob: https://cdn.jsdelivr.net; " +
      "child-src 'self' blob: https://cdn.jsdelivr.net; " +
      "frame-src https://accounts.google.com https://vku-room-booking-17t.pages.dev;"
    );

    // Disable caching on HTML, SW, JS, CSS to guarantee instant updates
    if (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('sw.js') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('Expires', '0');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
