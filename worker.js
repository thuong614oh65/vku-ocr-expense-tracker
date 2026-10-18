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
    // 1B. API: REAL-TIME CROSS-DEVICE CLOUD SYNC (Cloudflare KV)
    // ========================================================================
    if (url.pathname === '/api/sync' || url.pathname.startsWith('/api/sync/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      const corsHeaders = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      };

      if (!env.EXPENSE_SYNC_KV) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Dịch vụ lưu trữ đám mây EXPENSE_SYNC_KV chưa được kết nối.'
        }), { status: 503, headers: corsHeaders });
      }

      // GET /api/sync?email=...
      if (url.pathname === '/api/sync' && request.method === 'GET') {
        try {
          const email = (url.searchParams.get('email') || '').trim().toLowerCase();
          if (!email) {
            return new Response(JSON.stringify({ success: false, message: 'Thiếu tham số email' }), { status: 400, headers: corsHeaders });
          }

          const cloudData = await env.EXPENSE_SYNC_KV.get('user:' + email, { type: 'json' });
          if (!cloudData) {
            return new Response(JSON.stringify({
              success: true,
              exists: false,
              message: 'Chưa có bản lưu trên đám mây',
              data: null
            }), { status: 200, headers: corsHeaders });
          }

          return new Response(JSON.stringify({
            success: true,
            exists: true,
            message: 'Đồng bộ từ đám mây thành công',
            data: cloudData
          }), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, message: 'Lỗi tải đám mây: ' + err.message }), { status: 500, headers: corsHeaders });
        }
      }

      // POST /api/sync
      if (url.pathname === '/api/sync' && request.method === 'POST') {
        try {
          const body = await request.json();
          const email = (body.email || '').trim().toLowerCase();
          if (!email) {
            return new Response(JSON.stringify({ success: false, message: 'Thiếu email tài khoản' }), { status: 400, headers: corsHeaders });
          }

          const existing = (await env.EXPENSE_SYNC_KV.get('user:' + email, { type: 'json' })) || {
            monthlyBudget: 3500000,
            categoryBudgets: {},
            budgetUpdatedAt: 0,
            transactions: [],
            updatedAt: 0
          };

          // 1. Merge transactions with conflict resolution
          const txnMap = new Map();
          for (const t of (existing.transactions || [])) {
            if (t && t.id) txnMap.set(t.id, t);
          }

          for (const t of (body.transactions || [])) {
            if (!t || !t.id) continue;
            const ex = txnMap.get(t.id);
            if (!ex) {
              txnMap.set(t.id, { ...t, updatedAt: t.updatedAt || Date.now() });
            } else {
              const incomingTime = t.updatedAt || 0;
              const existingTime = ex.updatedAt || 0;
              if (incomingTime >= existingTime) {
                txnMap.set(t.id, { ...ex, ...t, updatedAt: incomingTime || Date.now() });
              }
            }
          }

          const mergedTransactions = Array.from(txnMap.values())
            .filter(t => !t.isDeleted)
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

          // 2. Merge Budget
          let monthlyBudget = existing.monthlyBudget || 3500000;
          let categoryBudgets = existing.categoryBudgets || {};
          let budgetUpdatedAt = existing.budgetUpdatedAt || 0;

          const incomingBudgetTime = body.budgetUpdatedAt || body.clientUpdatedAt || 0;
          if (typeof body.monthlyBudget === 'number' && body.monthlyBudget > 0) {
            if (incomingBudgetTime >= budgetUpdatedAt || !existing.budgetUpdatedAt) {
              monthlyBudget = body.monthlyBudget;
              budgetUpdatedAt = incomingBudgetTime || Date.now();
            }
          }

          if (body.categoryBudgets && typeof body.categoryBudgets === 'object') {
            categoryBudgets = { ...categoryBudgets, ...body.categoryBudgets };
          }

          const mergedData = {
            email,
            monthlyBudget,
            categoryBudgets,
            budgetUpdatedAt,
            transactions: mergedTransactions,
            updatedAt: Date.now(),
            lastDevice: body.device || 'Thiết bị người dùng'
          };

          await env.EXPENSE_SYNC_KV.put('user:' + email, JSON.stringify(mergedData));

          return new Response(JSON.stringify({
            success: true,
            message: 'Đồng bộ tức thời với đám mây thành công',
            data: mergedData
          }), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, message: 'Lỗi ghi đám mây: ' + err.message }), { status: 500, headers: corsHeaders });
        }
      }

      // POST /api/sync/delete-txn
      if (url.pathname === '/api/sync/delete-txn' && request.method === 'POST') {
        try {
          const body = await request.json();
          const email = (body.email || '').trim().toLowerCase();
          const txnId = body.id || body.transactionId;
          if (!email || !txnId) {
            return new Response(JSON.stringify({ success: false, message: 'Thiếu email hoặc mã giao dịch' }), { status: 400, headers: corsHeaders });
          }

          const existing = await env.EXPENSE_SYNC_KV.get('user:' + email, { type: 'json' });
          if (existing && Array.isArray(existing.transactions)) {
            existing.transactions = existing.transactions.filter(t => t.id !== txnId);
            existing.updatedAt = Date.now();
            await env.EXPENSE_SYNC_KV.put('user:' + email, JSON.stringify(existing));
          }

          return new Response(JSON.stringify({
            success: true,
            message: 'Đã xóa giao dịch đồng bộ trên đám mây'
          }), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, message: 'Lỗi xóa đám mây: ' + err.message }), { status: 500, headers: corsHeaders });
        }
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

    // Cache static OCR models & WebAssembly permanently, but keep app code fresh
    if (url.pathname.includes('/tessdata/') || url.pathname.includes('/tesseract/')) {
      newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
      newHeaders.set('Access-Control-Allow-Origin', '*');
      if (url.pathname.endsWith('.gz')) {
        newHeaders.set('Content-Type', 'application/gzip');
      } else if (url.pathname.endsWith('.wasm')) {
        newHeaders.set('Content-Type', 'application/wasm');
      } else if (url.pathname.endsWith('.js')) {
        newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
      }
    } else if (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('sw.js') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
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
