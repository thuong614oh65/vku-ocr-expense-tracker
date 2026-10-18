/**
 * VKU OCR Expense Tracker & Receipt Parser
 * Progressive Web Application (PWA) with Client-Side Tesseract.js OCR
 */

const GOOGLE_CLIENT_ID = '1003178768971-qn13952kqgsbbkqcdkebet5jblf748je.apps.googleusercontent.com';

const CATEGORIES = {
  food: { name: 'Ăn Uống', color: '#EF4444', icon: '🍲' },
  study: { name: 'Học Tập', color: '#3B82F6', icon: '📚' },
  travel: { name: 'Di Chuyển', color: '#10B981', icon: '🛵' },
  gear: { name: 'Thiết Bị', color: '#8B5CF6', icon: '💻' },
  entertainment: { name: 'Giải Trí', color: '#F59E0B', icon: '🎮' },
  other: { name: 'Khác', color: '#6B7280', icon: '🧾' },
};

const SAMPLE_RECEIPTS = [
  {
    merchant: 'Siêu Thị WinMart+',
    amount: 87500,
    date: '2026-10-12',
    category: 'food',
    confidence: 0.96,
    rawText: `WINMART+ DA NANG\nSieu Thi VinCommerce - Cua hang WinMart+\nDia chi: 470 Duong Tran Dai Nghia, Ngu Hanh Son, Da Nang\nMST: 0104918404-128\n----------------------------------------\nPHIEU THANH TOAN\nSo HD: HD101226-00412\nNgay: 12/10/2026 11:45\nThu ngan: Nguyen Thi Lan\n\n1. Banh mi cha bong             18,000\n2. Sua chua Vinamilk 100g (x2)  17,000\n3. Nuoc khoang Lavie 500ml      7,500\n4. Ca phe lon Highlands        15,000\n5. Mi ly Omachi Bo Xot         30,000\n----------------------------------------\nCONG TIEN HANG:                  87,500\nVAT (8%):                         7,000\nTONG CONG:                       87,500 VND\nTIEN MAT:                       100,000\nTIEN THUA:                       12,500\n----------------------------------------\nCam on quy khach - Hen gap lai!`
  },
  {
    merchant: 'Highlands Coffee',
    amount: 115000,
    date: '2026-10-11',
    category: 'food',
    confidence: 0.94,
    rawText: `HIGHLANDS COFFEE\nCong ty Co Phan Dich Vu Ca Phe Cao Nguyen\nDia chi: Tran Dai Nghia, Da Nang\nTel: (0236) 3667 888\n----------------------------------------\nHOA DON BAN LE\nBan so: 08\nGio vao: 14:15 - 11/10/2026\n\n1. Phin Sua Da (L)              39,000\n2. Tra Sen Vang Kem Cheese (M)  49,000\n3. Banh Mousse Dao              27,000\n----------------------------------------\nTONG CONG:                     115,000 đ\nChuyen khoan QR:               115,000\n----------------------------------------\nHighlands Coffee xin cam on!`
  },
  {
    merchant: 'Nhà Sách Fahasa Đà Nẵng',
    amount: 245000,
    date: '2026-10-10',
    category: 'study',
    confidence: 0.91,
    rawText: `NHA SACH FAHASA DA NANG\nChi nhanh Cong ty Phat Hanh Sach Fahasa\nDia chi: 300-302 Le Duan, Da Nang\n----------------------------------------\nHOA DON TINH TIEN\nNgay mua: 10/10/2026 09:30\n\n1. Giao trinh Lap trinh Flutter  125,000\n2. Tap vo sinh vien Klong (x3)    60,000\n3. But gel Zebra Sarasa 0.5 (x2)  40,000\n4. Giay note ghi chu              20,000\n----------------------------------------\nTONG TIEN:                      245,000 VND\nThanh toan the VNPay:           245,000\n----------------------------------------\nXin cam on quy khach!`
  },
  {
    merchant: 'Petrolimex Nam Kỳ Khởi Nghĩa',
    amount: 70000,
    date: '2026-10-09',
    category: 'travel',
    confidence: 0.92,
    rawText: `TAP DOAN XANG DAU VIET NAM\nPETROLIMEX CUA HANG SO 18\nDia chi: Nam Ky Khoi Nghia, Hoa Quy, Ngu Hanh Son\n----------------------------------------\nHOA DON DIEN TU\nNgay: 09/10/2026 17:10\nCot bom: 02 - E5 RON 92-II\n\nDon gia: 21,850 VND/Lit\nSo luong: 3.20 Lit\n----------------------------------------\nTONG TIEN THANH TOAN:            70,000 VND\nBang chu: Bay muoi ngan dong chan\n----------------------------------------\nPETROLIMEX - De tien xa hon`
  },
  {
    merchant: 'Thế Giới Di Động',
    amount: 350000,
    date: '2026-10-08',
    category: 'gear',
    confidence: 0.95,
    rawText: `THE GIOI DI DONG\nDia chi: 120 Tran Dai Nghia, Da Nang\n----------------------------------------\nPHIEU XUAT KHO KIEM HOA DON\nNgay lap: 08/10/2026 15:40\n\n1. Chuot khong day Logitech M170 190,000\n2. Cap sac nhanh Type-C Baseus   160,000\n----------------------------------------\nTONG TIEN PHAI TRA:             350,000 đ\nHinh thuc:                      MoMo\n----------------------------------------\nBao hanh 12 thang theo so dien thoai.`
  }
];

/**
 * Generates a realistic synthetic thermal receipt thumbnail image (Base64 JPEG)
 */
function generateReceiptImageBase64(merchant, amount, dateStr, rawText) {
  const c = document.createElement('canvas');
  c.width = 280;
  c.height = 360;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, c.width - 8, c.height - 8);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(merchant.toUpperCase().slice(0, 26), c.width / 2, 28);

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';

  const lines = (rawText || '').split('\n').slice(0, 18);
  let y = 50;
  lines.forEach((line) => {
    ctx.fillText(line.trim().slice(0, 36), 14, y);
    y += 15;
  });

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(`TOTAL: ${Number(amount).toLocaleString('vi-VN')} VND`, 14, c.height - 22);

  return c.toDataURL('image/jpeg', 0.82);
}

const SEED_TRANSACTIONS = [
  {
    id: 'TXN-001',
    merchant: 'Siêu Thị WinMart+',
    amount: 87500,
    date: '2026-10-12',
    category: 'food',
    confidence: 0.96,
    notes: 'Bánh mì chà bông, sữa chua, cà phê',
    rawText: SAMPLE_RECEIPTS[0].rawText
  },
  {
    id: 'TXN-002',
    merchant: 'Highlands Coffee',
    amount: 115000,
    date: '2026-10-11',
    category: 'food',
    confidence: 0.94,
    notes: 'Phin sữa đá, Trà sen vàng, bánh mousse',
    rawText: SAMPLE_RECEIPTS[1].rawText
  },
  {
    id: 'TXN-003',
    merchant: 'Nhà Sách Fahasa',
    amount: 245000,
    date: '2026-10-10',
    category: 'study',
    confidence: 0.91,
    notes: 'Giáo trình & đồ dùng văn phòng phẩm',
    rawText: SAMPLE_RECEIPTS[2].rawText
  },
  {
    id: 'TXN-004',
    merchant: 'Cây Xăng Petrolimex',
    amount: 70000,
    date: '2026-10-09',
    category: 'travel',
    confidence: 0.92,
    notes: 'Đổ xăng xe máy E5 RON 92-II',
    rawText: SAMPLE_RECEIPTS[3].rawText
  },
  {
    id: 'TXN-005',
    merchant: 'Thế Giới Di Động',
    amount: 350000,
    date: '2026-10-08',
    category: 'gear',
    confidence: 0.95,
    notes: 'Chuột không dây & cáp sạc nhanh Type-C',
    rawText: SAMPLE_RECEIPTS[4].rawText
  }
];

/**
 * AuthService (Week 8 Slide 4 "UserProfile, Logged-in user auth" & Slide 24 Route Guard "/login")
 */
class AuthService {
  static USERS_KEY = 'vku_ocr_users_db_v1';
  static SESSION_KEY = 'vku_ocr_auth_session_v1';

  static hashPassword(pwd) {
    let hash = 5381;
    const salted = `vku_salt_2026_${pwd}`;
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) + hash) + salted.charCodeAt(i);
    }
    return 'sha256_' + Math.abs(hash).toString(16);
  }

  static getUsers() {
    const defaultUsers = {
      'demo@example.com': {
        id: 'USR-DEMO',
        fullName: 'Người Dùng Trải Nghiệm',
        studentId: 'GUEST-01',
        className: 'Cá nhân',
        email: 'demo@example.com',
        role: 'Khách Trải Nghiệm',
        passwordHash: this.hashPassword('Demo@2026')
      }
    };
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      return raw ? { ...defaultUsers, ...JSON.parse(raw) } : defaultUsers;
    } catch {
      return defaultUsers;
    }
  }

  static saveUsers(users) {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (_) {}
  }

  static getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (_) {}
  }

  static login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this.getUsers();
    const user = users[cleanEmail];
    if (!user) {
      return { success: false, message: 'Tài khoản chưa tồn tại. Vui lòng chuyển sang tab Đăng ký!' };
    }
    if (user.passwordHash !== this.hashPassword(password)) {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
    }
    this.setCurrentUser(user);
    return { success: true, message: `Chào mừng ${user.fullName}!`, user };
  }

  static register({ fullName, studentId, className, email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this.getUsers();
    if (users[cleanEmail]) {
      return { success: false, message: 'Email này đã được đăng ký. Vui lòng đăng nhập!' };
    }
    const newUser = {
      id: 'USR-' + Date.now(),
      fullName: fullName.trim(),
      studentId: studentId.trim().toUpperCase(),
      className: className.trim().toUpperCase(),
      email: cleanEmail,
      role: 'Thành viên SmartSpend',
      passwordHash: this.hashPassword(password)
    };
    users[cleanEmail] = newUser;
    this.saveUsers(users);
    this.setCurrentUser(newUser);
    return { success: true, message: `Đăng ký thành công tài khoản ${newUser.fullName}!`, user: newUser };
  }

  static logout() {
    this.setCurrentUser(null);
  }
}

class StorageManager {
  static THEME_KEY = 'vku_ocr_theme_mode';

  static getUserKey(userEmail, suffix = 'expenses') {
    if (!userEmail) return `smartspend_${suffix}_guest`;
    const clean = userEmail.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
    return `smartspend_${suffix}_${clean}`;
  }

  static getTransactions(userEmail) {
    try {
      const key = this.getUserKey(userEmail, 'expenses');
      let data = localStorage.getItem(key);

      // Migration fallback from global key for demo user
      if (!data && (!userEmail || userEmail === 'demo@example.com')) {
        data = localStorage.getItem('vku_ocr_expenses_web_v2');
      }

      if (!data) {
        // If guest or demo account, return seed sample transactions for instant exploration
        if (!userEmail || userEmail === 'demo@example.com') {
          return SEED_TRANSACTIONS.map(t => ({
            ...t,
            thumbnail: generateReceiptImageBase64(t.merchant, t.amount, t.date, t.rawText)
          }));
        }
        // New real user starts with a clean slate (0 transactions)
        return [];
      }

      const list = JSON.parse(data);
      if (!Array.isArray(list)) return [];
      return list.map(t => ({
        ...t,
        thumbnail: t.thumbnail || generateReceiptImageBase64(t.merchant, t.amount, t.date, t.rawText)
      }));
    } catch {
      return [];
    }
  }

  static saveTransactions(txns, userEmail) {
    try {
      const key = this.getUserKey(userEmail, 'expenses');
      localStorage.setItem(key, JSON.stringify(txns));
    } catch (e) {
      console.warn('Lỗi lưu localStorage:', e);
    }
  }

  static getMonthlyBudget(userEmail) {
    try {
      const key = this.getUserKey(userEmail, 'budget');
      const val = localStorage.getItem(key);
      return val ? parseInt(val, 10) : 3500000;
    } catch {
      return 3500000;
    }
  }

  static getBudgetUpdatedAt(userEmail) {
    try {
      const key = this.getUserKey(userEmail, 'budget_time');
      const val = localStorage.getItem(key);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  static setMonthlyBudget(val, userEmail, timestamp = null) {
    try {
      const key = this.getUserKey(userEmail, 'budget');
      localStorage.setItem(key, String(val));
      const timeKey = this.getUserKey(userEmail, 'budget_time');
      localStorage.setItem(timeKey, String(timestamp || Date.now()));
    } catch (_) {}
  }
}

class CloudSyncService {
  static isSyncing = false;
  static lastSyncTime = null;
  static syncListeners = [];

  static onSyncStatusChange(cb) {
    if (typeof cb === 'function') this.syncListeners.push(cb);
  }

  static notifyStatus(status, text, lastTime = null) {
    if (lastTime) this.lastSyncTime = lastTime;
    for (const cb of this.syncListeners) {
      try { cb({ status, text, lastSyncTime: this.lastSyncTime }); } catch (_) {}
    }
  }

  static async pullFromCloud(userEmail) {
    if (!userEmail || !navigator.onLine) return null;
    try {
      const res = await fetch(`/api/sync?email=${encodeURIComponent(userEmail.trim().toLowerCase())}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.success && json.exists && json.data) {
        return json.data;
      }
      return null;
    } catch (e) {
      console.warn('CloudSyncService pull notice:', e);
      return null;
    }
  }

  static async pushToCloud(userEmail, transactions, monthlyBudget, categoryBudgets = {}) {
    if (!userEmail || !navigator.onLine) return null;
    try {
      this.isSyncing = true;
      this.notifyStatus('syncing', 'Đang đồng bộ...');
      const deviceName = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? 'iPhone'
        : (/Android/i.test(navigator.userAgent) ? 'Android' : 'Máy tính / PC');

      const budgetTime = StorageManager.getBudgetUpdatedAt(userEmail) || Date.now();

      const payload = {
        email: userEmail.trim().toLowerCase(),
        monthlyBudget: monthlyBudget,
        categoryBudgets: categoryBudgets,
        budgetUpdatedAt: budgetTime,
        transactions: (transactions || []).map(t => ({
          ...t,
          updatedAt: t.updatedAt || Date.now()
        })),
        clientUpdatedAt: Date.now(),
        device: `${deviceName} (${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
      };

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.isSyncing = false;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json && json.success && json.data) {
        this.notifyStatus('synced', 'Đã đồng bộ', Date.now());
        return json.data;
      }
      this.notifyStatus('idle', 'Sẵn sàng');
      return null;
    } catch (e) {
      this.isSyncing = false;
      console.warn('CloudSyncService push notice:', e);
      this.notifyStatus('error', 'Lỗi đồng bộ');
      return null;
    }
  }

  static async deleteFromCloud(userEmail, transactionId) {
    if (!userEmail || !navigator.onLine) return;
    try {
      await fetch('/api/sync/delete-txn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, id: transactionId })
      });
    } catch (_) {}
  }
}

class RegexReceiptParser {
  static KNOWN_MERCHANTS = [
    'WinMart+', 'WinMart', 'Circle K', 'Co.opmart', 'Coopmart', 'Highlands Coffee', 'Highlands',
    'Phúc Long Coffee & Tea', 'Phúc Long', 'Căn Tin VKU', 'Nhà Sách Fahasa', 'Fahasa',
    'Thế Giới Di Động', 'Điện Máy Xanh', 'Petrolimex', 'PVOIL', 'Lotteria', 'KFC Vietnam', 'KFC',
    'GrabFood', 'Grab', 'FPT Shop', 'CellphoneS', 'Bách Hóa Xanh', 'GS25', '7-Eleven', 'FamilyMart',
    'Ministop', 'The Coffee House', 'Katinat', 'Mixue', 'Trung Nguyên', 'Starbucks', 'Jollibee',
    'McDonald\'s', 'Pizza Hut', 'Domino\'s Pizza', 'Pharmacity', 'Long Châu', 'An Khang',
    'CGV Cinema', 'Lotte Cinema', 'ShopeeFood', 'Tiki', 'Lazada', 'Viettel Store'
  ];

  static parse(rawText) {
    const startTime = performance.now();
    const cleanText = (rawText || '').trim();
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let confidence = 0.20;

    // 1. Merchant Detection
    let merchant = '';
    const lowerText = cleanText.toLowerCase();

    // Strategy 1A: Check known brands
    for (const b of this.KNOWN_MERCHANTS) {
      if (lowerText.includes(b.toLowerCase())) {
        merchant = b;
        confidence += 0.35;
        break;
      }
    }

    // Strategy 1B: Clean header line if no known brand (skipping receipt type titles)
    if (!merchant && lines.length > 0) {
      const skipKeywords = [
        'hóa đơn', 'hoa don', 'phiếu tính', 'phieu tinh', 'phiếu thanh', 'phieu thanh',
        'receipt', 'gtgt', 'vat', 'mã số thuế', 'mst', 'địa chỉ', 'dia chi',
        'hotline', 'tel:', 'sđt', 'sdt', 'stt', 'cộng hòa', 'cong hoa', 'độc lập', 'doc lap',
        'welcome', 'xin chào', 'xin chao', 'thu ngân', 'thu ngan', 'bàn:', 'ban:'
      ];
      for (let i = 0; i < Math.min(6, lines.length); i++) {
        const l = lines[i];
        const lowerL = l.toLowerCase();
        const hasSkip = skipKeywords.some(k => lowerL.includes(k));
        const cleaned = l.replace(/^[*\-=\s#~_]+|[*\-=\s#~_]+$/g, '').trim();
        if (!hasSkip && cleaned.length >= 3 && /[a-zA-ZÀ-ỹ]/.test(cleaned)) {
          merchant = cleaned.slice(0, 45);
          confidence += 0.20;
          break;
        }
      }
    }

    if (!merchant) {
      merchant = 'Hóa Đơn Mua Sắm';
    }

    // 2. Amount Detection with Multi-Tier Bottom-Up Algorithm
    let amount = 0;

    const excludeKeywords = /(?:phiếu\s*thanh\s*toán|phieu\s*thanh\s*toan|tiền\s*thừa|tiền\s*thối|tiền\s*trả\s*lại|change|tiền\s*khách\s*đưa|khách\s*đưa|khanh\s*dua|khnh\s*dua|số\s*hđ|so\s*hd|mã\s*hđ|ma\s*hd|sdt|hotline|mst|thu\s*ngân|quay|ngày|ngay|giờ|gio)/i;
    const tier1Regex = /(?:tổng\s*cộng|tong\s*cong|t\.cộng|t\.cong|tổng\s*thanh\s*toán|tong\s*thanh\s*toan|tiền\s*thanh\s*toán|tien\s*thanh\s*toan|khách\s*phải\s*trả|khach\s*phai\s*tra|khách\s*cần\s*trả|khach\s*can\s*tra|grand\s*total)/i;
    const tier2Regex = /(?:tổng\s*tiền|tong\s*tien|cộng\s*tiền\s*hàng|cong\s*tien\s*hang|cộng\s*tiền|cong\s*tien|thành\s*tiền|thanh\s*tien|phải\s*trả|phai\s*tra|amount\s*due|\btotal\b)/i;
    const tier3Regex = /(?:tiền\s*mặt|tien\s*mat|thanh\s*toán\s*(?:qr|thẻ)|chuyển\s*khoản)/i;

    const normalizeArtifacts = (str) => {
      if (!str) return '';
      return str
        .replace(/([0-9][.,\s]?)[oODd]{1,4}(?=[.,\sđvnd%]|$)/gi, (m, p) => p + '0'.repeat(m.length - p.length))
        .replace(/([0-9])[oODd]([0-9])/g, '$10$2');
    };

    const extractNumFromStr = (str) => {
      if (!str) return 0;
      const s = normalizeArtifacts(str);
      const matches = s.match(/(?:[0-9]{1,3}(?:[.,\s][0-9]{3})+|[0-9]{4,8})/g);
      if (!matches || matches.length === 0) return 0;
      for (let i = matches.length - 1; i >= 0; i--) {
        const val = this._parseVNNumber(matches[i]);
        if (val >= 1000 && val <= 500000000) return val;
      }
      return 0;
    };

    // Pass 1: Tier 1 Definite Total (Bottom-up)
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i];
      if (excludeKeywords.test(l)) continue;
      if (tier1Regex.test(l)) {
        const val = extractNumFromStr(l);
        if (val > 0) {
          amount = val;
          confidence += 0.50;
          break;
        }
        if (i + 1 < lines.length && !excludeKeywords.test(lines[i + 1])) {
          const nextVal = extractNumFromStr(lines[i + 1]);
          if (nextVal > 0) {
            amount = nextVal;
            confidence += 0.45;
            break;
          }
        }
      }
    }

    // Pass 2: Tier 2 General Total (Bottom-up)
    if (amount === 0) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i];
        if (excludeKeywords.test(l)) continue;
        if (tier2Regex.test(l)) {
          const val = extractNumFromStr(l);
          if (val > 0) {
            amount = val;
            confidence += 0.40;
            break;
          }
          if (i + 1 < lines.length && !excludeKeywords.test(lines[i + 1])) {
            const nextVal = extractNumFromStr(lines[i + 1]);
            if (nextVal > 0) {
              amount = nextVal;
              confidence += 0.35;
              break;
            }
          }
        }
      }
    }

    // Pass 3: Currency-tagged numbers (e.g. 71,000 VND, 71.000 d, 71.000 đ)
    if (amount === 0) {
      const normAll = normalizeArtifacts(cleanText);
      const currencyMatches = normAll.matchAll(/([0-9]{1,3}(?:[.,\s][0-9]{3})+|[0-9]{4,8})\s*(?:đ|vnd|vnđ|d\b)/gi);
      let maxCurrency = 0;
      for (const m of currencyMatches) {
        const val = this._parseVNNumber(m[1]);
        if (val >= 1000 && val <= 500000000 && val > maxCurrency) {
          maxCurrency = val;
        }
      }
      if (maxCurrency > 0) {
        amount = maxCurrency;
        confidence += 0.35;
      }
    }

    // Pass 4: Tier 3 Payment Method (Tien mat, QR...)
    if (amount === 0) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const l = lines[i];
        if (excludeKeywords.test(l)) continue;
        if (tier3Regex.test(l)) {
          const val = extractNumFromStr(l);
          if (val > 0) {
            amount = val;
            confidence += 0.30;
            break;
          }
        }
      }
    }

    // Pass 5: Fallback max valid monetary number in the lower half of receipt
    if (amount === 0) {
      const startIdx = Math.floor(lines.length * 0.4);
      let fallbackMax = 0;
      for (let i = lines.length - 1; i >= startIdx; i--) {
        const l = lines[i];
        if (excludeKeywords.test(l)) continue;
        const val = extractNumFromStr(l);
        if (val >= 1000 && val <= 50000000 && val > fallbackMax) {
          fallbackMax = val;
        }
      }
      if (fallbackMax > 0) {
        amount = fallbackMax;
        confidence += 0.20;
      }
    }

    // 3. Date Detection
    let dateStr = new Date().toISOString().split('T')[0];
    const dateMatch = cleanText.match(/\b([0-3]?[0-9])[/\-.]([0-1]?[0-9])[/\-.](20[2-3][0-9])\b/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      dateStr = `${year}-${month}-${day}`;
      confidence += 0.20;
    } else {
      const isoMatch = cleanText.match(/\b(20[2-3][0-9])[/\-.]([0-1]?[0-9])[/\-.]([0-3]?[0-9])\b/);
      if (isoMatch) {
        const year = isoMatch[1];
        const month = isoMatch[2].padStart(2, '0');
        const day = isoMatch[3].padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
        confidence += 0.20;
      }
    }

    // 4. Category Classification
    let category = 'other';
    const lower = cleanText.toLowerCase();
    if (lower.includes('cà phê') || lower.includes('coffee') || lower.includes('trà') || lower.includes('tea') || lower.includes('bánh') || lower.includes('mì') || lower.includes('cơm') || lower.includes('bún') || lower.includes('phở') || lower.includes('winmart') || lower.includes('highlands') || lower.includes('sữa') || lower.includes('ăn') || lower.includes('circle k') || lower.includes('ministop') || lower.includes('bách hóa') || lower.includes('food')) {
      category = 'food';
    } else if (lower.includes('sách') || lower.includes('vở') || lower.includes('bút') || lower.includes('giáo trình') || lower.includes('fahasa') || lower.includes('vku') || lower.includes('học') || lower.includes('photo') || lower.includes('in ấn')) {
      category = 'study';
    } else if (lower.includes('xăng') || lower.includes('petrolimex') || lower.includes('pvoil') || lower.includes('xe buýt') || lower.includes('grab') || lower.includes('be ') || lower.includes('gửi xe')) {
      category = 'travel';
    } else if (lower.includes('chuột') || lower.includes('cáp') || lower.includes('tai nghe') || lower.includes('di động') || lower.includes('laptop') || lower.includes('thế giới di động') || lower.includes('fpt') || lower.includes('cellphones') || lower.includes('điện thoại')) {
      category = 'gear';
    } else if (lower.includes('vé') || lower.includes('phim') || lower.includes('karaoke') || lower.includes('game') || lower.includes('cgv') || lower.includes('lotte') || lower.includes('giải trí')) {
      category = 'entertainment';
    }

    confidence = Math.min(0.99, Math.max(0.20, confidence));
    const latencyMs = Math.max(10, Math.round(performance.now() - startTime));

    return {
      merchant,
      amount,
      date: dateStr,
      category,
      confidence: Math.round(confidence * 100) / 100,
      latencyMs,
      rawText: cleanText
    };
  }

  static _parseVNNumber(str) {
    if (!str) return 0;
    let clean = str.replace(/\s+/g, '');
    if (clean.includes('.') && !clean.includes(',')) clean = clean.replace(/\./g, '');
    else if (clean.includes(',') && !clean.includes('.')) clean = clean.replace(/,/g, '');
    else if (clean.includes('.') && clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }
}

class AppController {
  constructor() {
    this.currentUser = AuthService.getCurrentUser();
    this.transactions = StorageManager.getTransactions(this.currentUser?.email);
    this.isLoginMode = true;
    this.obscurePassword = true; // Ephemeral state (Week 8 Slide 4)
    this.currentRoute = this.currentUser ? '/dash' : '/login';
    this.currentPendingResult = null;
    this.editingTxnId = null;
    this.viewingTxnId = null;
    this.selectedFilterCategory = 'all';
    this.selectedDateRange = 'all';
    this.searchQuery = '';
    this.cameraStream = null;
    this.isTorchOn = false;
    this.isDarkMode = localStorage.getItem(StorageManager.THEME_KEY) === 'dark';
    this.isDesktop = !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent));
    this._ocrWorker = null;
    this._ocrWorkerPromise = null;
    this._isOcrWarmed = false;
    this._lastCapturedDataUrl = null;

    this.applyTheme();
    this.initDesktopAdaptation();
    this.initZaloDetector();
    this.initBatteryPlatformChannel();
    this.checkUrlForOAuthCallback();
    this.initAuthUI();
    this.initUI();
    this.initCloudSync();
    this.syncRouteGuard();
    this.prewarmOcrWorker();
  }

  checkUrlForOAuthCallback() {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawAuth = params.get('vku_auth');
      if (rawAuth) {
        const profile = JSON.parse(decodeURIComponent(rawAuth));
        const email = (profile.email || '').trim().toLowerCase();
        const fullName = profile.name || email.split('@')[0];
        const avatar = profile.picture || '';

        const sIdMatch = email.match(/[0-9]{2}[a-z0-9.]+/i);
        const studentId = sIdMatch ? sIdMatch[0].toUpperCase() : 'SV-VKU';

        const googleUser = {
          id: 'USR-G-' + (profile.sub || Date.now()),
          fullName: fullName,
          studentId: studentId,
          className: 'VKU-23ITB',
          email: email,
          avatar: avatar,
          role: 'Sinh viên VKU (Google Verified)'
        };

        const users = AuthService.getUsers();
        users[email] = googleUser;
        AuthService.saveUsers(users);
        AuthService.setCurrentUser(googleUser);

        // Remove OAuth param from URL without reloading
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        this.currentUser = googleUser;
        this.currentRoute = '/dash';
      }
    } catch (err) {
      console.warn('OAuth URL callback parse error:', err);
    }
  }

  initDesktopAdaptation() {
    // Retain clean SVG icons & labels; handle drag-and-drop for desktop
    const ctaCard = document.getElementById('scanner-cta-card');
    if (ctaCard) {
      ctaCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        ctaCard.classList.add('drag-over');
      });
      ctaCard.addEventListener('dragleave', () => {
        ctaCard.classList.remove('drag-over');
      });
      ctaCard.addEventListener('drop', async (e) => {
        e.preventDefault();
        ctaCard.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          await this.processUploadedImageFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  initCloudSync() {
    CloudSyncService.onSyncStatusChange(info => {
      this.updateSyncUI(info);
    });

    const syncBtn = document.getElementById('btn-cloud-sync');
    if (syncBtn) {
      syncBtn.onclick = () => {
        this.syncWithCloud(true, true);
      };
    }

    const profileSyncBtn = document.getElementById('btn-profile-sync-now');
    if (profileSyncBtn) {
      profileSyncBtn.onclick = () => {
        this.syncWithCloud(true, true);
      };
    }

    // Auto sync on visibility change (e.g. user switched back from another tab or app)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.currentUser?.email) {
        this.syncWithCloud(true, false);
      }
    });

    // Auto sync on window focus
    window.addEventListener('focus', () => {
      if (this.currentUser?.email) {
        this.syncWithCloud(true, false);
      }
    });

    // Auto sync on online reconnect
    window.addEventListener('online', () => {
      if (this.currentUser?.email) {
        this.syncWithCloud(false, false);
        this.showSyncToast('Đã kết nối mạng - Đang đồng bộ...');
      }
    });

    window.addEventListener('offline', () => {
      this.updateSyncUI({ status: 'offline', text: 'Ngoại tuyến' });
    });

    // Periodic background sync every 20s if visible
    setInterval(() => {
      if (document.visibilityState === 'visible' && this.currentUser?.email && navigator.onLine) {
        this.syncWithCloud(true, false);
      }
    }, 20000);

    // Initial pull if already logged in
    if (this.currentUser?.email) {
      setTimeout(() => this.syncWithCloud(true, false), 400);
    }
  }

  updateSyncUI(info) {
    const badge = document.getElementById('sync-status-badge');
    const syncBtn = document.getElementById('btn-cloud-sync');
    const profileDesc = document.getElementById('profile-sync-status-desc');

    if (badge) {
      if (info.status === 'syncing') {
        badge.textContent = 'Đang đồng bộ...';
        if (syncBtn) {
          syncBtn.className = 'cloud-sync-btn syncing';
        }
      } else if (info.status === 'offline') {
        badge.textContent = 'Ngoại tuyến';
        if (syncBtn) {
          syncBtn.className = 'cloud-sync-btn offline';
        }
      } else if (info.status === 'error') {
        badge.textContent = 'Chưa đồng bộ';
        if (syncBtn) {
          syncBtn.className = 'cloud-sync-btn offline';
        }
      } else {
        badge.textContent = 'Đã đồng bộ';
        if (syncBtn) {
          syncBtn.className = 'cloud-sync-btn';
        }
      }
    }

    if (profileDesc) {
      if (info.status === 'syncing') {
        profileDesc.textContent = '🔄 Đang đồng bộ hóa dữ liệu với Cloudflare KV...';
      } else if (info.status === 'offline') {
        profileDesc.textContent = '📡 Chế độ Ngoại tuyến (Offline). Dữ liệu lưu an toàn trên máy.';
      } else if (info.lastSyncTime) {
        const timeStr = new Date(info.lastSyncTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        profileDesc.textContent = `☁️ Đã đồng bộ tức thì với Đám Mây (${timeStr}). Tự động cập nhật giữa ĐT & Máy tính.`;
      }
    }
  }

  showSyncToast(msg) {
    const toast = document.getElementById('sync-toast');
    const msgEl = document.getElementById('sync-toast-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._syncToastTimer);
    this._syncToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  async syncWithCloud(isPullFirst = true, userTriggered = false) {
    if (!this.currentUser?.email) return;
    if (!navigator.onLine) {
      this.updateSyncUI({ status: 'offline', text: 'Ngoại tuyến' });
      if (userTriggered) this.showSyncToast('Thiết bị đang ngoại tuyến - dữ liệu lưu an toàn trên máy');
      return;
    }

    try {
      if (isPullFirst) {
        const cloudData = await CloudSyncService.pullFromCloud(this.currentUser.email);
        if (cloudData) {
          let hasChanges = false;
          const localTxns = StorageManager.getTransactions(this.currentUser.email);
          const localBudgetTime = StorageManager.getBudgetUpdatedAt(this.currentUser.email);

          // 1. Sync Budget from cloud if cloud is newer
          if (cloudData.monthlyBudget && (cloudData.budgetUpdatedAt || 0) > localBudgetTime) {
            StorageManager.setMonthlyBudget(cloudData.monthlyBudget, this.currentUser.email, cloudData.budgetUpdatedAt);
            hasChanges = true;
          }

          // 2. Merge transactions by id
          const txnMap = new Map();
          localTxns.forEach(t => txnMap.set(t.id, t));

          for (const ct of (cloudData.transactions || [])) {
            if (!ct || !ct.id) continue;
            if (!txnMap.has(ct.id)) {
              txnMap.set(ct.id, ct);
              hasChanges = true;
            } else {
              const lt = txnMap.get(ct.id);
              if ((ct.updatedAt || 0) > (lt.updatedAt || 0)) {
                txnMap.set(ct.id, { ...lt, ...ct });
                hasChanges = true;
              }
            }
          }

          const merged = Array.from(txnMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          this.transactions = merged;
          StorageManager.saveTransactions(merged, this.currentUser.email);

          if (hasChanges) {
            this.render(false);
          }
        }
      }

      // Push latest state to cloud to keep Cloudflare KV perfectly synchronized
      const curBudget = StorageManager.getMonthlyBudget(this.currentUser.email);
      const pushRes = await CloudSyncService.pushToCloud(this.currentUser.email, this.transactions, curBudget);
      if (pushRes) {
        if (userTriggered) {
          this.showSyncToast('✓ Đã đồng bộ hoàn toàn giữa Điện thoại & Máy tính!');
        }
      }
    } catch (e) {
      console.warn('syncWithCloud notice:', e);
    }
  }

  triggerImagePicker() {
    const fileInput = document.getElementById('file-input-receipt');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  triggerScanOrFilePicker() {
    this.openScannerModal();
  }

  applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    const sunIcon = document.querySelector('.svg-icon-sun');
    const moonIcon = document.querySelector('.svg-icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', !this.isDarkMode);
      moonIcon.classList.toggle('hidden', this.isDarkMode);
    }
  }

  initZaloDetector() {
    const ua = navigator.userAgent || '';
    const isZaloOrInApp = /Zalo|FBAN|FBAV|Instagram|Line/i.test(ua);
    const banner = document.getElementById('zalo-webview-banner');
    if (banner) {
      if (isZaloOrInApp) {
        banner.classList.remove('hidden');
        document.getElementById('btn-open-external-browser').onclick = () => {
          const targetUrl = window.location.href;
          if (/iPhone|iPad|iPod/i.test(ua)) {
            window.location.href = 'x-safari-' + targetUrl;
            setTimeout(() => {
              navigator.clipboard?.writeText(targetUrl);
            }, 400);
          } else {
            window.location.href = `intent://${targetUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
          }
        };
      } else {
        banner.classList.add('hidden');
      }
    }
  }

  async initBatteryPlatformChannel() {
    const pill = document.getElementById('profile-battery-badge');
    const diag = document.getElementById('diag-battery-val');
    const profileText = document.getElementById('profile-battery-text');
    const profileRow = document.getElementById('profile-battery-row');

    if ('getBattery' in navigator) {
      try {
        const bat = await navigator.getBattery();
        const updateBat = () => {
          const lvl = Math.round(bat.level * 100);
          const stateStr = `${lvl}%${bat.charging ? ' (Đang sạc)' : ''}`;
          if (pill) {
            pill.textContent = `🔋 Pin: ${stateStr}`;
            pill.classList.remove('hidden');
          }
          if (diag) diag.textContent = stateStr;
          if (profileText) profileText.textContent = stateStr;
        };
        updateBat();
        bat.addEventListener('levelchange', updateBat);
        bat.addEventListener('chargingchange', updateBat);
        return;
      } catch (_) {}
    }

    // If getBattery not supported, hide battery badge and show neutral status
    if (pill) pill.classList.add('hidden');
    if (diag) diag.textContent = 'Không hỗ trợ trên trình duyệt này';
    if (profileText) profileText.textContent = 'Không hỗ trợ';
    if (profileRow) profileRow.style.display = 'none';
  }

  /**
   * GoRouter Route Guard & ShellRoute synchronization (Week 8 Slides 19-24)
   */
  syncRouteGuard() {
    this.currentUser = AuthService.getCurrentUser();
    const authScreen = document.getElementById('auth-screen');
    const mainShell = document.getElementById('main-app-shell');
    const bottomNav = document.getElementById('bottom-nav-bar');
    const fab = document.getElementById('fab-scan-receipt');

    // Route Guard: Redirect unauthenticated user to /login
    if (!this.currentUser) {
      this.currentRoute = '/login';
      authScreen.classList.remove('hidden');
      mainShell.classList.add('hidden');
      bottomNav.classList.add('hidden');
      fab.classList.add('hidden');
      return;
    }

    // Authenticated: Load user-specific transactions and show ShellRoute
    this.transactions = StorageManager.getTransactions(this.currentUser.email);
    this.syncWithCloud(true, false);
    authScreen.classList.add('hidden');
    mainShell.classList.remove('hidden');
    bottomNav.classList.remove('hidden');
    fab.classList.remove('hidden');

    // Populate UserProfile in /profile Pane and AppBar
    const initials = (this.currentUser.fullName || 'User')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(w => w[0].toUpperCase())
      .join('');

    const profAvatar = document.getElementById('profile-avatar-large');
    if (profAvatar) profAvatar.textContent = initials || 'US';
    const profName = document.getElementById('profile-hero-name');
    if (profName) profName.textContent = this.currentUser.fullName || 'Người Dùng';
    const profMeta = document.getElementById('profile-hero-meta');
    if (profMeta) profMeta.textContent = this.currentUser.studentId ? `Mã: ${this.currentUser.studentId}` : 'Tài khoản cá nhân';
    const profAdvisor = document.getElementById('profile-hero-advisor');
    if (profAdvisor) profAdvisor.textContent = `Email: ${this.currentUser.email}`;

    const dashAvatar = document.getElementById('dash-user-avatar');
    if (dashAvatar) dashAvatar.textContent = initials || 'US';
    const dashName = document.getElementById('dash-user-name');
    if (dashName) dashName.textContent = this.currentUser.fullName || 'Người Dùng';

    const btnDashSwitch = document.getElementById('btn-dash-switch-acc');
    if (btnDashSwitch) btnDashSwitch.onclick = () => this.openAccountModal();

    const topAvatar = document.getElementById('user-avatar-badge');
    if (topAvatar) topAvatar.textContent = initials || 'US';

    if (this.currentRoute === '/login') {
      this.currentRoute = '/dash';
    }
    this.navigateShell(this.currentRoute);
  }

  navigateShell(route) {
    if (route === '/scanner') {
      this.triggerScanOrFilePicker();
      return;
    }
    this.currentRoute = route;
    const viewDash = document.getElementById('view-dash');
    const viewReports = document.getElementById('view-reports');
    const viewProfile = document.getElementById('view-profile');
    const fab = document.getElementById('fab-scan-receipt');
    const mainShell = document.getElementById('main-app-shell');

    if (mainShell) {
      mainShell.classList.toggle('route-profile', route === '/profile');
    }

    if (route === '/profile') {
      if (viewDash) viewDash.classList.add('hidden');
      if (viewReports) viewReports.classList.add('hidden');
      if (viewProfile) viewProfile.classList.remove('hidden');
      if (fab) fab.classList.add('hidden');
    } else if (route === '/reports') {
      if (viewDash) viewDash.classList.add('hidden');
      if (viewReports) viewReports.classList.remove('hidden');
      if (viewProfile) viewProfile.classList.add('hidden');
      if (fab) fab.classList.remove('hidden');
    } else {
      // /dash
      if (viewDash) viewDash.classList.remove('hidden');
      if (viewReports) viewReports.classList.add('hidden');
      if (viewProfile) viewProfile.classList.add('hidden');
      if (fab) fab.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-dest').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === route);
    });

    this.render(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  initAuthUI() {
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    const extraFields = document.getElementById('register-extra-fields');
    const submitBtn = document.getElementById('btn-submit-auth');
    const feedback = document.getElementById('auth-feedback-msg');

    const switchMode = (loginMode) => {
      this.isLoginMode = loginMode;
      tabLogin.classList.toggle('active', loginMode);
      tabRegister.classList.toggle('active', !loginMode);
      extraFields.classList.toggle('hidden', loginMode);
      feedback.classList.add('hidden');
      submitBtn.textContent = loginMode
        ? 'Đăng Nhập Vào Sổ Chi Tiêu'
        : 'Đăng Ký Tài Khoản';
    };

    tabLogin.onclick = () => switchMode(true);
    tabRegister.onclick = () => switchMode(false);

    // Toggle password visibility with SVG icons (Item 22)
    const pwdInput = document.getElementById('auth-password');
    const pwdBtn = document.getElementById('btn-toggle-pwd');
    const svgEye = document.getElementById('svg-eye');
    const svgEyeOff = document.getElementById('svg-eye-off');
    if (pwdBtn && pwdInput) {
      pwdBtn.onclick = () => {
        this.obscurePassword = !this.obscurePassword;
        pwdInput.type = this.obscurePassword ? 'password' : 'text';
        if (svgEye && svgEyeOff) {
          svgEye.classList.toggle('hidden', !this.obscurePassword);
          svgEyeOff.classList.toggle('hidden', this.obscurePassword);
        }
      };
    }

    // Forgot password info prompt (Item 22)
    const btnForgot = document.getElementById('btn-forgot-pwd');
    if (btnForgot) {
      btnForgot.onclick = () => {
        alert('Dữ liệu tài khoản và mật khẩu được lưu bảo mật cục bộ trên thiết bị của bạn. Nếu quên mật khẩu, bạn có thể tạo tài khoản mới hoặc chọn "Vào Thử Ngay (Chế Độ Khách)" để tiếp tục sử dụng.');
      };
    }

    // Real-time validation
    const validateField = (inputId, errId, validatorFn) => {
      const el = document.getElementById(inputId);
      const errEl = document.getElementById(errId);
      if (!el || !errEl) return true;
      const msg = validatorFn(el.value.trim());
      if (msg) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
        return false;
      } else {
        errEl.classList.add('hidden');
        return true;
      }
    };

    ['auth-email', 'auth-password', 'auth-fullname', 'auth-student-id', 'auth-class'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (id === 'auth-email') validateField('auth-email', 'err-email', v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Vui lòng nhập email hợp lệ (VD: user@gmail.com)' : '');
          if (id === 'auth-password') validateField('auth-password', 'err-password', v => v.length < 8 ? 'Mật khẩu phải có tối thiểu 8 ký tự' : '');
          if (id === 'auth-fullname') validateField('auth-fullname', 'err-fullname', v => v.length < 3 ? 'Vui lòng nhập họ và tên' : '');
          if (id === 'auth-student-id') validateField('auth-student-id', 'err-student-id', v => '');
          if (id === 'auth-class') validateField('auth-class', 'err-class', v => '');
        });
      }
    });

    // Submit Form (Login / Register)
    document.getElementById('auth-form').onsubmit = (e) => {
      e.preventDefault();
      const okEmail = validateField('auth-email', 'err-email', v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Vui lòng nhập email hợp lệ (VD: user@gmail.com)' : '');
      const okPwd = validateField('auth-password', 'err-password', v => v.length < 8 ? 'Mật khẩu phải có tối thiểu 8 ký tự' : '');
      let okExtra = true;
      if (!this.isLoginMode) {
        const okName = validateField('auth-fullname', 'err-fullname', v => v.length < 3 ? 'Vui lòng nhập họ và tên' : '');
        okExtra = Boolean(okName);
      }
      if (!okEmail || !okPwd || !okExtra) return;

      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;

      const res = this.isLoginMode
        ? AuthService.login(email, password)
        : AuthService.register({
            fullName: document.getElementById('auth-fullname').value.trim(),
            studentId: document.getElementById('auth-student-id').value.trim() || 'USER-01',
            className: document.getElementById('auth-class').value.trim() || 'Cá nhân',
            email,
            password
          });

      feedback.textContent = res.message;
      feedback.className = `auth-feedback ${res.success ? 'success' : 'error'}`;
      feedback.classList.remove('hidden');

      if (res.success) {
        this.currentRoute = '/dash';
        setTimeout(() => this.syncRouteGuard(), 250);
      }
    };

    // Quick VKU Student 1-Tap Login
    const btnQuickThuong = document.getElementById('btn-quick-fill-thuong');
    if (btnQuickThuong) {
      btnQuickThuong.onclick = () => {
        const u = {
          id: 'USR-VKU-23ITB-THUONG',
          fullName: 'Nguyễn Thị Thương',
          studentId: '23ITB',
          className: '23ITB',
          email: 'thuongnt.23itb@vku.udn.vn',
          role: 'Sinh viên VKU (Google Verified)',
          passwordHash: AuthService.hashPassword('Vku@2026')
        };
        const users = AuthService.getUsers();
        users[u.email] = u;
        AuthService.saveUsers(users);
        AuthService.setCurrentUser(u);
        this.currentUser = u;
        this.currentRoute = '/dash';
        this.syncRouteGuard();
      };
    }

    // Quick Guest / Demo Experience button
    const btnQuickDemo = document.getElementById('btn-quick-fill-demo');
    if (btnQuickDemo) {
      btnQuickDemo.onclick = () => {
        const users = AuthService.getUsers();
        let u = users['demo@example.com'] || {
          id: 'USR-GUEST',
          fullName: 'Khách Trải Nghiệm',
          studentId: 'GUEST-01',
          className: 'Cá nhân',
          email: 'guest@example.com',
          role: 'Người Dùng Khách',
          passwordHash: AuthService.hashPassword('Demo@2026')
        };
        AuthService.setCurrentUser(u);
        this.currentUser = u;
        this.currentRoute = '/dash';
        this.syncRouteGuard();
      };
    }


    // ========================================================================
    // GOOGLE IDENTITY SERVICES OAUTH (A4)
    // Server & Client domain check (@vku.udn.vn)
    // ========================================================================
    const openGoogleBtn = document.getElementById('btn-open-google-login');
    const googleBtnText = document.getElementById('btn-google-text');
    const zaloSecurityBox = document.getElementById('zalo-security-box');
    const btnZaloOpen = document.getElementById('btn-zalo-open-browser');
    const btnZaloCopy = document.getElementById('btn-zalo-copy-link');

    // Detect Zalo / Facebook In-App Browser (RFC 8252)
    const isEmbeddedWebView = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      if (/Zalo|FBAN|FBAV|FB_IAB|FBIOS|Instagram|Line|MicroMessenger|BytedanceWebview|TikTok|\bwv\b|WebView/i.test(ua)) {
        return true;
      }
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isRealIOSBrowser = /Safari\/|CriOS\/|FxiOS\/|EdgiOS\/|OPiOS\//i.test(ua);
      if (isIOS && !isRealIOSBrowser) {
        return true;
      }
      return false;
    };

    // Open external Safari or Chrome
    const openInExternalSystemBrowser = (targetUrl) => {
      if (typeof window === 'undefined') return;
      const fullUrl = targetUrl || window.location.href;
      const ua = navigator.userAgent || '';
      const withoutProtocol = fullUrl.replace(/^https?:\/\//i, '');
      if (/iPhone|iPad|iPod/i.test(ua)) {
        window.location.href = `x-safari-https://${withoutProtocol}`;
        return;
      }
      if (/Android/i.test(ua)) {
        window.location.href = `intent://${withoutProtocol}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(fullUrl)};end`;
        return;
      }
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    };

    if (btnZaloOpen) {
      btnZaloOpen.onclick = () => openInExternalSystemBrowser();
    }
    if (btnZaloCopy) {
      btnZaloCopy.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            btnZaloCopy.textContent = '✅ Đã chép link';
            setTimeout(() => { btnZaloCopy.textContent = '📋 Chép link'; }, 2000);
          });
        }
      };
    }

    const resetGoogleBtnState = () => {
      if (openGoogleBtn) {
        openGoogleBtn.disabled = false;
        openGoogleBtn.style.opacity = '1';
        if (googleBtnText) {
          googleBtnText.textContent = 'Tiếp tục với Google (@vku.udn.vn)';
        }
      }
    };

    const handleGoogleAuthSuccess = (googleUser) => {
      resetGoogleBtnState();
      const users = AuthService.getUsers();
      users[googleUser.email.toLowerCase()] = googleUser;
      AuthService.saveUsers(users);
      AuthService.setCurrentUser(googleUser);
      alert(`🎉 Xin chào, ${googleUser.fullName}!\nĐã xác thực Google thành công (${googleUser.email}).`);
      this.currentRoute = '/dash';
      this.syncRouteGuard();
    };

    // Real Google OAuth Launch via Authorized Origin Bridge (Project 2 Integration)
    const openRealGooglePopupWindow = () => {
      if (isEmbeddedWebView()) {
        if (zaloSecurityBox) zaloSecurityBox.classList.remove('hidden');
        openInExternalSystemBrowser();
        return;
      }

      const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
      const bridgeUrl = `https://vku-room-booking-17t.pages.dev/oauth-bridge?return_to=${returnUrl}`;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // On Mobile (iOS Safari / Chrome), popups get blocked or opened as orphaned tabs.
      // Redirect directly to the bridge; it finishes OAuth and auto-redirects back with ?vku_auth=...
      if (isMobile) {
        if (openGoogleBtn) {
          openGoogleBtn.disabled = true;
          openGoogleBtn.style.opacity = '0.75';
          if (googleBtnText) googleBtnText.textContent = 'Đang chuyển tới Cổng Google VKU...';
        }
        window.location.href = bridgeUrl;
        return;
      }

      if (openGoogleBtn) {
        openGoogleBtn.disabled = true;
        openGoogleBtn.style.opacity = '0.75';
        if (googleBtnText) googleBtnText.textContent = 'Đang mở cửa sổ Google OAuth...';
      }

      const width = 480;
      const height = 620;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        bridgeUrl,
        'VKUGoogleAuthBridge',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = bridgeUrl;
        return;
      }

      const checkClosedTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosedTimer);
          resetGoogleBtnState();
        }
      }, 600);

      const handleMessage = (event) => {
        if (event.data?.type === 'VKU_GOOGLE_AUTH_SUCCESS' && event.data?.profile) {
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosedTimer);

          const profile = event.data.profile;
          const email = (profile.email || '').trim().toLowerCase();
          const fullName = profile.name || email.split('@')[0];
          const avatar = profile.picture || '';

          const sIdMatch = email.match(/[0-9]{2}[a-z0-9.]+/i);
          const studentId = sIdMatch ? sIdMatch[0].toUpperCase() : 'SV-VKU';

          const googleUser = {
            id: 'USR-G-' + (profile.sub || Date.now()),
            fullName: fullName,
            studentId: studentId,
            className: 'VKU-SV',
            email: email,
            avatar: avatar,
            role: 'Sinh viên VKU (Google Verified)'
          };

          handleGoogleAuthSuccess(googleUser);
        }
      };

      window.addEventListener('message', handleMessage);
    };

    if (openGoogleBtn) {
      openGoogleBtn.onclick = () => {
        openRealGooglePopupWindow();
      };
    }
  }

  initUI() {
    // Dark Mode Toggle
    document.getElementById('btn-theme-toggle').onclick = () => {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem(StorageManager.THEME_KEY, this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
      this.render(false);
    };

    // Export CSV
    document.getElementById('btn-export-csv').onclick = () => this.exportCsv();
    const btnRepExport = document.getElementById('btn-reports-export-csv');
    if (btnRepExport) btnRepExport.onclick = () => this.exportCsv();

    // Edit Monthly Budget via dedicated Budget Setting Modal
    const btnEditBudget = document.getElementById('btn-edit-budget');
    if (btnEditBudget) {
      btnEditBudget.onclick = () => this.openBudgetModal();
    }

    // Bottom NavigationBar (ShellRoute: /dash, /scanner, /reports)
    document.querySelectorAll('.nav-dest').forEach(btn => {
      btn.onclick = () => this.navigateShell(btn.dataset.route);
    });

    // FloatingActionButton.extended (Unified openScannerModal viewfinder)
    const fabScan = document.getElementById('fab-scan-receipt');
    if (fabScan) fabScan.onclick = () => this.openScannerModal();

    // Scanner CTA Card & Button (Unified openScannerModal viewfinder)
    const ctaCard = document.getElementById('scanner-cta-card');
    if (ctaCard) {
      ctaCard.onclick = (e) => {
        if (!e.target.closest('#btn-open-scanner') && !e.target.closest('#btn-manual-add')) {
          this.openScannerModal();
        }
      };
      ctaCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        ctaCard.classList.add('drag-over');
      });
      ctaCard.addEventListener('dragleave', () => {
        ctaCard.classList.remove('drag-over');
      });
      ctaCard.addEventListener('drop', (e) => {
        e.preventDefault();
        ctaCard.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.processImageFile(e.dataTransfer.files[0]);
        }
      });
    }
    const btnOpenScan = document.getElementById('btn-open-scanner');
    if (btnOpenScan) btnOpenScan.onclick = () => this.openScannerModal();

    const btnManual = document.getElementById('btn-manual-add');
    if (btnManual) {
      btnManual.onclick = (e) => {
        e.stopPropagation();
        this.openManualEntryModal();
      };
    }

    // Account Switcher and Logout Buttons
    const openAccModal = () => this.openAccountModal();
    const btnHeaderAvatar = document.getElementById('btn-header-avatar');
    if (btnHeaderAvatar) btnHeaderAvatar.onclick = openAccModal;


    // Profile Pane Action Buttons
    const btnProfSwitch = document.getElementById('btn-profile-switch-acc');
    if (btnProfSwitch) btnProfSwitch.onclick = openAccModal;

    const btnProfLogout = document.getElementById('btn-profile-logout');
    if (btnProfLogout) {
      btnProfLogout.onclick = () => {
        AuthService.logout();
        this.syncRouteGuard();
      };
    }

    const btnProfInstall = document.getElementById('btn-profile-install-app');
    if (btnProfInstall) {
      btnProfInstall.onclick = () => {
        document.getElementById('install-modal').classList.remove('hidden');
      };
    }

    const btnProfExport = document.getElementById('btn-profile-export-csv');
    if (btnProfExport) {
      btnProfExport.onclick = () => this.exportCsv();
    }

    const btnProfBackup = document.getElementById('btn-profile-backup-json');
    if (btnProfBackup) {
      btnProfBackup.onclick = () => this.exportJsonBackup();
    }

    // JSON Restore from Backup
    const btnProfRestore = document.getElementById('btn-profile-restore-json');
    const inputRestore = document.getElementById('input-restore-backup');
    if (btnProfRestore && inputRestore) {
      btnProfRestore.onclick = () => inputRestore.click();
      inputRestore.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (Array.isArray(data.transactions)) {
              this.transactions = data.transactions;
              StorageManager.saveTransactions(this.transactions, this.currentUser?.email);
              if (data.monthlyBudget) {
                StorageManager.setMonthlyBudget(data.monthlyBudget, this.currentUser?.email);
              }
              alert(`✅ Đã khôi phục thành công ${this.transactions.length} khoản chi tiêu!`);
              this.render(true);
            } else {
              alert('⚠️ Tệp sao lưu không đúng định dạng JSON hợp lệ.');
            }
          } catch (err) {
            alert('⚠️ Lỗi khi đọc tệp JSON: ' + err.message);
          }
          inputRestore.value = '';
        };
        reader.readAsText(file);
      };
    }

    // Date Range Filter Pills
    document.querySelectorAll('.date-filter-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('.date-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedDateRange = pill.dataset.range || 'all';
        this.render(false);
      };
    });

    const btnCloseAccModal = document.getElementById('btn-close-account-modal');
    if (btnCloseAccModal) {
      btnCloseAccModal.onclick = () => {
        document.getElementById('account-modal').classList.add('hidden');
      };
    }

    const btnModalLogout = document.getElementById('btn-modal-logout-confirm');
    if (btnModalLogout) {
      btnModalLogout.onclick = () => {
        AuthService.logout();
        document.getElementById('account-modal').classList.add('hidden');
        this.syncRouteGuard();
      };
    }

    const btnModalAddAcc = document.getElementById('btn-modal-add-account');
    if (btnModalAddAcc) {
      btnModalAddAcc.onclick = () => {
        AuthService.logout();
        document.getElementById('account-modal').classList.add('hidden');
        this.isLoginMode = false;
        this.syncRouteGuard();
      };
    }

    // Search Input
    document.getElementById('search-txn-input').oninput = (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render(false);
    };

    // Install Modal
    const installModal = document.getElementById('install-modal');
    document.getElementById('btn-install-app').onclick = () => installModal.classList.remove('hidden');
    document.getElementById('btn-close-install').onclick = () => installModal.classList.add('hidden');

    document.querySelectorAll('.install-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.install-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
      };
    });

    // Scanner Modal Close Button
    document.getElementById('btn-close-scanner').onclick = () => this.closeScannerModal();

    // Tap-to-Focus on Camera Viewfinder
    const frameArea = document.getElementById('camera-frame-area');
    frameArea.onclick = (e) => {
      const rect = frameArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const reticle = document.getElementById('focus-reticle');
      reticle.style.left = `${x - 24}px`;
      reticle.style.top = `${y - 24}px`;
      reticle.classList.remove('hidden');
      clearTimeout(this._focusTimer);
      this._focusTimer = setTimeout(() => reticle.classList.add('hidden'), 1100);
    };

    // Flash / Torch Toggle
    document.getElementById('btn-toggle-flash').onclick = async (e) => {
      this.isTorchOn = !this.isTorchOn;
      e.currentTarget.classList.toggle('active', this.isTorchOn);
      if (this.cameraStream) {
        const track = this.cameraStream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          try {
            await track.applyConstraints({ advanced: [{ torch: this.isTorchOn }] });
          } catch (_) {}
        }
      }
    };

    // Quick sample buttons inside scanner
    document.querySelectorAll('.mini-sample-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.closeScannerModal();
        const sample = SAMPLE_RECEIPTS[idx];
        const thumb = generateReceiptImageBase64(sample.merchant, sample.amount, sample.date, sample.rawText);
        this.triggerOcr(sample.rawText, thumb);
      };
    });

    document.getElementById('btn-sample-fast').onclick = () => {
      this.closeScannerModal();
      const sample = SAMPLE_RECEIPTS[0];
      const thumb = generateReceiptImageBase64(sample.merchant, sample.amount, sample.date, sample.rawText);
      this.triggerOcr(sample.rawText, thumb);
    };

    // Instant Skip OCR Button
    const btnSkipOcr = document.getElementById('btn-skip-ocr');
    if (btnSkipOcr) {
      btnSkipOcr.onclick = () => {
        this.closeScannerModal();
        const today = new Date().toISOString().split('T')[0];
        this.currentPendingResult = {
          merchant: 'Hóa Đơn Mới',
          amount: 0,
          date: today,
          category: 'food',
          confidence: 0.50,
          latencyMs: 50,
          thumbnail: this._lastCapturedDataUrl || ''
        };
        document.getElementById('review-modal-title').textContent = 'Kiểm Tra & Lưu Hóa Đơn AI';
        document.getElementById('edit-merchant').value = 'Hóa Đơn Mới';
        document.getElementById('edit-amount').value = '';
        document.getElementById('edit-date').value = today;
        document.getElementById('edit-notes').value = '';
        document.getElementById('raw-ocr-preview').textContent = '(Bỏ qua OCR tự động — Nhập nhanh số tiền theo ảnh chụp)';
        this.renderReviewCategoryChips('food');
        document.getElementById('review-modal').classList.remove('hidden');
        setTimeout(() => {
          const amtInput = document.getElementById('edit-amount');
          if (amtInput) amtInput.focus();
        }, 200);
      };
    }

    // Native Camera input for high-resolution photo on mobile
    const nativeCamInput = document.getElementById('native-camera-input');
    if (nativeCamInput) {
      nativeCamInput.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          await this.processUploadedImageFile(file);
          nativeCamInput.value = '';
        }
      };
    }

    // Shutter Capture: Crop live video frame or fall back to native camera
    document.getElementById('btn-shutter-capture').onclick = async () => {
      const video = document.getElementById('camera-video');
      if (!this.cameraStream || !video || video.readyState < 2 || video.videoWidth === 0) {
        if (nativeCamInput) {
          nativeCamInput.click();
          return;
        }
      }
      await this.captureFromLiveCamera();
    };

    // File input for real receipt image upload
    const fileInput = document.getElementById('file-input-receipt');
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.processUploadedImageFile(file);
        fileInput.value = '';
      }
    };

    // Sample Chips on Dashboard
    document.querySelectorAll('.sample-chip').forEach(chip => {
      chip.onclick = () => {
        const idx = parseInt(chip.dataset.index, 10);
        const sample = SAMPLE_RECEIPTS[idx];
        const thumb = generateReceiptImageBase64(sample.merchant, sample.amount, sample.date, sample.rawText);
        this.triggerOcr(sample.rawText, thumb);
      };
    });

    // Dynamic Route /expense/:id Detail Modal
    const detailModal = document.getElementById('detail-modal');
    document.getElementById('btn-close-detail').onclick = () => {
      this.viewingTxnId = null;
      detailModal.classList.add('hidden');
    };

    document.getElementById('btn-detail-edit').onclick = () => {
      const txn = this.transactions.find(t => t.id === this.viewingTxnId);
      detailModal.classList.add('hidden');
      if (txn) {
        this.triggerOcr(txn.rawText, txn.thumbnail, txn);
      }
    };

    document.getElementById('btn-detail-delete').onclick = () => {
      if (this.viewingTxnId) {
        const idToDelete = this.viewingTxnId;
        detailModal.classList.add('hidden');
        this.deleteTransaction(idToDelete);
      }
    };

    // Review Modal & Real-time Form Validators (Week 8 Slide 28)
    const reviewModal = document.getElementById('review-modal');
    document.getElementById('btn-close-review').onclick = () => {
      this.editingTxnId = null;
      reviewModal.classList.add('hidden');
    };

    document.getElementById('edit-merchant').addEventListener('input', (e) => {
      const err = document.getElementById('err-edit-merchant');
      if (!e.target.value.trim()) {
        err.textContent = 'Vui lòng nhập tên đơn vị bán hàng (Merchant cannot be empty)';
        err.classList.remove('hidden');
      } else {
        err.classList.add('hidden');
      }
    });

    document.getElementById('edit-amount').addEventListener('input', (e) => {
      const err = document.getElementById('err-edit-amount');
      const val = parseFloat(e.target.value);
      if (!val || val <= 0) {
        err.textContent = 'Số tiền phải là số dương hợp lệ (Enter a valid positive number)';
        err.classList.remove('hidden');
      } else {
        err.classList.add('hidden');
      }
    });

    document.getElementById('btn-confirm-save').onclick = () => {
      this.saveEditedTransaction();
    };

    // PWA 3-State Install & Standalone Launcher
    let deferredPrompt = null;
    const headerInstallBtn = document.getElementById('btn-install-app');
    const modalPwaBtn = document.getElementById('btn-trigger-pwa');
    const feedbackBox = document.getElementById('pwa-install-feedback');

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone && headerInstallBtn) {
      headerInstallBtn.textContent = '🟢 Đang Trong App';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (headerInstallBtn) headerInstallBtn.textContent = '📲 Cài App Ngay';
      if (modalPwaBtn) modalPwaBtn.textContent = '📲 Bấm Để Cài Đặt App (Native PWA)';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (headerInstallBtn) headerInstallBtn.textContent = '🟢 Đã Cài App';
      if (modalPwaBtn) modalPwaBtn.textContent = '✅ Đã Cài Đặt Thành Công — Mở App Ngay';
      if (feedbackBox) feedbackBox.classList.remove('hidden');
    });

    modalPwaBtn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          deferredPrompt = null;
          if (headerInstallBtn) headerInstallBtn.textContent = '🟢 Đã Cài App';
          modalPwaBtn.textContent = '✅ Đã Cài Đặt Thành Công!';
        }
        return;
      }
      if (feedbackBox) feedbackBox.classList.remove('hidden');
      modalPwaBtn.textContent = '🚀 Đang Mở Cửa Sổ App Độc Lập...';
      setTimeout(() => {
        window.open(
          window.location.href,
          'VKU_OCR_Expense_App',
          'width=430,height=840,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
        );
        modalPwaBtn.textContent = '🚀 Mở Lại Cửa Sổ App Độc Lập (Standalone)';
      }, 300);
    };
  }

  /**
   * Opens Account Switcher Modal (Đổi Tài Khoản)
   */
  openAccountModal() {
    const modal = document.getElementById('account-modal');
    if (!modal || !this.currentUser) return;
    const nameEl = document.getElementById('acc-modal-active-name');
    const metaEl = document.getElementById('acc-modal-active-meta');
    if (nameEl) nameEl.textContent = this.currentUser.fullName;
    if (metaEl) metaEl.textContent = `${this.currentUser.studentId || ''} • Lớp ${this.currentUser.className || ''} • ${this.currentUser.email}`;

    const list = document.getElementById('saved-accounts-list');
    if (list) {
      list.innerHTML = '';
      const allUsers = AuthService.getUsers();
      const currentEmail = (this.currentUser.email || '').toLowerCase();
      const otherEmails = Object.keys(allUsers).filter(e => e.toLowerCase() !== currentEmail);

      if (otherEmails.length === 0) {
        list.innerHTML = '<div style="font-size:11.5px;color:var(--text-muted);padding:8px 0;">Chưa có tài khoản nào khác được lưu trên thiết bị này.</div>';
      } else {
        otherEmails.forEach(email => {
          const u = allUsers[email];
          const item = document.createElement('div');
          item.className = 'saved-acc-item';
          item.innerHTML = `
            <div class="acc-meta">
              <strong>${u.fullName}</strong>
              <span>${u.studentId || ''} • ${u.email}</span>
            </div>
            <button class="btn-switch-to-acc" type="button">Chuyển sang ➔</button>
          `;
          item.onclick = () => {
            const pwd = prompt(`Nhập mật khẩu xác thực cho tài khoản ${u.email}:`);
            if (pwd === null) return;
            const res = AuthService.login(u.email, pwd);
            if (res.success) {
              modal.classList.add('hidden');
              this.syncRouteGuard();
            } else {
              alert(res.message || 'Mật khẩu xác thực không chính xác.');
            }
          };
          list.appendChild(item);
        });
      }
    }
    modal.classList.remove('hidden');
  }

  /**
   * Opens Dedicated Budget Setting Modal
   */
  openBudgetModal() {
    const modal = document.getElementById('budget-modal');
    if (!modal) return;
    const cur = StorageManager.getMonthlyBudget(this.currentUser?.email);
    const input = document.getElementById('input-budget-amount');
    const err = document.getElementById('err-budget-amount');
    const dailyPreview = document.getElementById('budget-daily-amount');

    const updateDaily = () => {
      const val = parseInt(input.value, 10);
      if (dailyPreview) {
        if (!isNaN(val) && val > 0) {
          const perDay = Math.round(val / 30);
          dailyPreview.textContent = `${this.formatVND(perDay)} / ngày`;
        } else {
          dailyPreview.textContent = '-- ₫ / ngày';
        }
      }
    };

    if (input) {
      input.value = cur;
      input.oninput = updateDaily;
      updateDaily();
    }
    if (err) err.classList.add('hidden');

    const closeBtn = document.getElementById('btn-close-budget');
    const cancelBtn = document.getElementById('btn-cancel-budget');
    const saveBtn = document.getElementById('btn-save-budget');

    const closeModal = () => modal.classList.add('hidden');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    modal.querySelectorAll('.budget-preset-btn').forEach(btn => {
      btn.onclick = () => {
        if (input) {
          input.value = btn.dataset.amount;
          updateDaily();
        }
        if (err) err.classList.add('hidden');
      };
    });

    if (saveBtn) {
      saveBtn.onclick = () => {
        const val = parseInt(input.value, 10);
        if (!isNaN(val) && val > 0) {
          StorageManager.setMonthlyBudget(val, this.currentUser?.email);
          closeModal();
          this.render(false);
          // Sync immediately to cloud across all devices!
          CloudSyncService.pushToCloud(this.currentUser?.email, this.transactions, val);
          this.showSyncToast(`✓ Đã lưu & đồng bộ hạn mức ${this.formatVND(val)} lên Đám Mây!`);
        } else {
          if (err) err.classList.remove('hidden');
        }
      };
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  /**
   * Opens Dynamic Route /expense/:id Detail Modal
   */
  openExpenseDetailModal(txn) {
    this.viewingTxnId = txn.id;
    const cat = CATEGORIES[txn.category] || CATEGORIES.other;
    document.getElementById('detail-cat-icon').textContent = cat.icon;
    document.getElementById('detail-route-badge').textContent = `Mã giao dịch: ${txn.id}`;
    document.getElementById('detail-merchant-title').textContent = txn.merchant;
    document.getElementById('detail-amount-value').textContent = this.formatVND(txn.amount);
    document.getElementById('detail-cat-chip').textContent =
      `${cat.icon} ${cat.name} • Độ tin cậy OCR: ${Math.round((txn.confidence || 0.92) * 100)}%`;

    const thumbImg = document.getElementById('detail-thumb-img');
    const thumbCaption = document.getElementById('detail-thumb-caption');
    if (txn.thumbnail) {
      if (thumbImg) {
        thumbImg.src = txn.thumbnail;
        thumbImg.style.display = 'block';
      }
      if (thumbCaption) thumbCaption.textContent = '🖼️ Ảnh Hóa Đơn Lưu Trữ Cục Bộ';
    } else {
      if (thumbImg) {
        thumbImg.style.display = 'none';
      }
      if (thumbCaption) thumbCaption.textContent = '📝 Khoản Chi Ghi Nhận Thủ Công (Không Kèm Ảnh)';
    }

    document.getElementById('detail-date-text').textContent = `Ngày giao dịch: ${txn.date}`;
    document.getElementById('detail-notes-text').textContent = `Ghi chú: ${txn.notes || 'Không có ghi chú'}`;
    document.getElementById('detail-raw-ocr').textContent = txn.rawText || '(Hóa đơn nhập thủ công)';

    document.getElementById('detail-modal').classList.remove('hidden');
  }

  async openScannerModal() {
    const scannerModal = document.getElementById('scanner-modal');
    scannerModal.classList.remove('hidden');
    const video = document.getElementById('camera-video');
    const hint = document.getElementById('camera-hint-text');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = this.cameraStream;
        video.style.display = 'block';
        if (hint) hint.textContent = 'Đặt hóa đơn vào khung cắt • Chạm màn hình để lấy nét';
      } else {
        video.style.display = 'none';
        if (hint) hint.textContent = 'Chưa mở được camera. Vui lòng bấm "Chọn Ảnh Hóa Đơn" bên dưới để tải ảnh từ máy, hoặc thử mẫu demo.';
      }
    } catch (_) {
      video.style.display = 'none';
      if (hint) hint.textContent = 'Chưa mở được camera. Vui lòng bấm "Chọn Ảnh Hóa Đơn" bên dưới để tải ảnh từ máy, hoặc thử mẫu demo.';
    }

    this.prewarmOcrWorker();
  }

  prewarmOcrWorker() {
    if (this._isOcrWarmed) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    this._isOcrWarmed = true;
    setTimeout(() => {
      this.getOcrWorker().catch(() => {});
    }, 1200);
  }

  async getOcrWorker(statusMsg) {
    if (this._ocrWorker) return this._ocrWorker;
    if (this._ocrWorkerPromise) return this._ocrWorkerPromise;

    this._ocrWorkerPromise = (async () => {
      if (!window.Tesseract) {
        if (statusMsg) statusMsg.textContent = 'Đang nạp bộ máy AI OCR...';
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = '/tesseract/tesseract.min.js';
          script.onload = res;
          script.onerror = rej;
          document.head.appendChild(script);
        });
      }

      if (statusMsg) statusMsg.textContent = 'Đang khởi động AI WebAssembly...';
      const baseOrigin = window.location.origin;
      const createPromise = window.Tesseract.createWorker('vie', 1, {
        langPath: baseOrigin + '/tessdata',
        corePath: baseOrigin + '/tesseract/tesseract-core.wasm.js',
        workerPath: baseOrigin + '/tesseract/worker.min.js',
        logger: (m) => {
          if (!statusMsg || !m) return;
          const pct = Math.round((m.progress || 0) * 100);
          if (m.status === 'loading language traineddata') {
            statusMsg.textContent = `Đang nạp mô hình tiếng Việt (${pct}%)...`;
          } else if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
            statusMsg.textContent = `Đang kích hoạt WebAssembly (${pct}%)...`;
          } else if (m.status === 'recognizing text') {
            statusMsg.textContent = `Đang đọc chữ & số tiền (${pct}%)...`;
          } else if (m.status) {
            statusMsg.textContent = `Đang xử lý (${pct}%)...`;
          }
        }
      });

      const timeoutPromise = new Promise((_, rej) => {
        setTimeout(() => rej(new Error('TESSERACT_WORKER_TIMEOUT')), 10000);
      });

      const worker = await Promise.race([createPromise, timeoutPromise]);
      this._ocrWorker = worker;
      return worker;
    })();

    try {
      const worker = await this._ocrWorkerPromise;
      return worker;
    } catch (e) {
      console.warn('getOcrWorker error:', e);
      this._ocrWorker = null;
      this._ocrWorkerPromise = null;
      throw e;
    }
  }

  closeScannerModal() {
    const scannerModal = document.getElementById('scanner-modal');
    scannerModal.classList.add('hidden');
    document.getElementById('ocr-loading-overlay').classList.add('hidden');
    const hint = document.getElementById('camera-hint-text');
    if (hint) hint.textContent = 'Đặt hóa đơn vào khung cắt • Chạm màn hình để lấy nét';
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
  }

  async captureFromLiveCamera() {
    const video = document.getElementById('camera-video');
    if (this.cameraStream && video.readyState >= 2 && video.videoWidth > 0) {
      const c = document.createElement('canvas');
      c.width = video.videoWidth || 1280;
      c.height = video.videoHeight || 720;
      const ctx = c.getContext('2d');
      ctx.drawImage(video, 0, 0, c.width, c.height);
      const croppedBase64 = c.toDataURL('image/jpeg', 0.92);
      await this.runRealOrFallbackOcr(croppedBase64, 'camera_capture.jpg');
    } else {
      const nativeCam = document.getElementById('native-camera-input');
      if (nativeCam) {
        nativeCam.click();
      } else {
        alert('Không nhận được luồng hình ảnh từ camera. Vui lòng bấm "Chọn Ảnh Hóa Đơn" để tải ảnh.');
        this.closeScannerModal();
      }
    }
  }

  async processUploadedImageFile(file) {
    if (!file) return;

    // D5: Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('Tệp ảnh quá lớn (>20MB). Vui lòng chọn ảnh có dung lượng nhỏ hơn.');
      return;
    }

    // D5: Check HEIC/HEIF
    const nameLower = (file.name || '').toLowerCase();
    if (nameLower.endsWith('.heic') || nameLower.endsWith('.heif') || file.type === 'image/heic') {
      alert('Định dạng ảnh HEIC từ iPhone chưa được hỗ trợ trực tiếp trong trình duyệt. Vui lòng chụp bằng camera gốc hoặc chọn ảnh JPEG/PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      await this.runRealOrFallbackOcr(dataUrl, file.name || '');
    };
    reader.readAsDataURL(file);
  }

  async preprocessImageForOCR(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        try {
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          let totalGray = 0;
          const pixelCount = data.length / 4;
          for (let i = 0; i < data.length; i += 4) {
            totalGray += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          }
          const avgGray = totalGray / pixelCount;

          const contrast = 1.35;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const enhanced = factor * (gray - avgGray) + avgGray;
            const clamped = Math.min(255, Math.max(0, enhanced));
            data[i] = clamped;
            data[i + 1] = clamped;
            data[i + 2] = clamped;
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.90));
        } catch (_) {
          resolve(imageDataUrl);
        }
      };
      img.onerror = () => resolve(imageDataUrl);
      img.src = imageDataUrl;
    });
  }

  async runRealOrFallbackOcr(imageDataUrl, fileName) {
    this._lastCapturedDataUrl = imageDataUrl;
    const loadingEl = document.getElementById('ocr-loading-overlay');
    const statusMsg = document.getElementById('ocr-status-msg');
    const scannerModal = document.getElementById('scanner-modal');

    if (scannerModal && !scannerModal.classList.contains('hidden')) {
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (statusMsg) statusMsg.textContent = 'Đang chuẩn bị nhận dạng văn bản...';
    }

    const startTime = performance.now();
    let extractedText = '';
    let ocrConfidence = 0;

    // Run OCR with local WebAssembly models and active progress reporting
    const ocrProcessingPromise = (async () => {
      if (statusMsg) statusMsg.textContent = 'Đang tối ưu độ tương phản ảnh...';
      const processedImage = await this.preprocessImageForOCR(imageDataUrl);

      if (statusMsg) statusMsg.textContent = 'Đang kích hoạt AI WebAssembly...';
      const worker = await Promise.race([
        this.getOcrWorker(statusMsg),
        new Promise((_, rej) => setTimeout(() => rej(new Error('WORKER_TIMEOUT')), 10000))
      ]);

      if (statusMsg) statusMsg.textContent = 'Đang đọc chữ & số tiền trên hóa đơn...';
      const res = await Promise.race([
        worker.recognize(processedImage),
        new Promise((_, rej) => setTimeout(() => rej(new Error('RECOGNIZE_TIMEOUT')), 12000))
      ]);

      return res;
    })();

    const masterTimeoutPromise = new Promise((_, rej) => 
      setTimeout(() => rej(new Error('GLOBAL_OCR_TIMEOUT')), 18000)
    );

    try {
      const res = await Promise.race([ocrProcessingPromise, masterTimeoutPromise]);
      if (res && res.data && res.data.text) {
        extractedText = res.data.text.trim();
        ocrConfidence = (typeof res.data.confidence === 'number')
          ? Math.max(0, Math.min(100, Math.round(res.data.confidence)))
          : 85;
      }
    } catch (err) {
      console.warn('AI OCR engine notice:', err.message);
      this._ocrWorker = null;
      this._ocrWorkerPromise = null;
    }

    const latencyMs = Math.round(performance.now() - startTime);

    // ALWAYS hide loading and close modal immediately
    if (loadingEl) loadingEl.classList.add('hidden');
    this.closeScannerModal();

    // Parse extracted text with multi-stage regex heuristics
    const parsed = RegexReceiptParser.parse(extractedText);
    const finalConfidence = ocrConfidence > 0 ? (ocrConfidence / 100) : (extractedText ? parsed.confidence : 0.35);

    this.currentPendingResult = {
      ...parsed,
      confidence: finalConfidence,
      latencyMs: latencyMs,
      thumbnail: imageDataUrl
    };
    this.editingTxnId = null;

    // Fill Review Modal — Populate with REAL recognized data from the photo!
    document.getElementById('review-modal-title').textContent = 'Kiểm Tra & Lưu Hóa Đơn AI';
    document.getElementById('edit-merchant').value = parsed.merchant || 'Hóa Đơn Mới';
    document.getElementById('edit-amount').value = parsed.amount > 0 ? parsed.amount : '';
    document.getElementById('edit-date').value = parsed.date;
    document.getElementById('edit-notes').value = '';
    document.getElementById('raw-ocr-preview').textContent = extractedText || '(Chưa nhận diện rõ ký tự do góc chụp mờ hoặc thiếu sáng - Vui lòng kiểm tra và nhập số tiền bên dưới)';

    const confScore = Math.round(finalConfidence * 100);
    const confScoreText = document.getElementById('conf-score-text');
    const confLatencyText = document.getElementById('conf-latency-text');
    if (confScoreText) {
      confScoreText.textContent = finalConfidence >= 0.7
        ? `Độ tin cậy OCR: ${confScore}% (Chính xác cao)`
        : `Độ tin cậy OCR: ${confScore}% (Vui lòng kiểm tra lại)`;
    }
    if (confLatencyText) {
      confLatencyText.textContent = `Thời gian nhận dạng: ${latencyMs} ms (${ocrConfidence > 0 ? 'AI WebAssembly' : 'On-Device'})`;
    }

    const diagOcr = document.getElementById('diag-ocr-latency');
    if (diagOcr) diagOcr.textContent = `${latencyMs} ms (Client-Side)`;

    const thumbWrap = document.getElementById('receipt-thumb-wrap');
    if (thumbWrap) thumbWrap.style.display = '';
    const confBanner = document.getElementById('review-confidence-banner');
    if (confBanner) confBanner.style.display = '';

    const thumbImg = document.getElementById('receipt-thumb-img');
    if (thumbImg) thumbImg.src = imageDataUrl;

    this.renderReviewCategoryChips(parsed.category);
    document.getElementById('review-modal').classList.remove('hidden');

    // Auto-focus amount if confidence is low or amount is empty so user can quickly type
    if (finalConfidence < 0.7 || !parsed.amount) {
      setTimeout(() => {
        const amtInput = document.getElementById('edit-amount');
        if (amtInput) amtInput.focus();
      }, 250);
    }
  }

  triggerOcr(rawText, thumbnailDataUrl = null, existingTxn = null) {
    const result = existingTxn ? {
      merchant: existingTxn.merchant,
      amount: existingTxn.amount,
      date: existingTxn.date,
      category: existingTxn.category,
      confidence: existingTxn.confidence || 0.95,
      latencyMs: 15,
      rawText: existingTxn.rawText || ''
    } : RegexReceiptParser.parse(rawText);

    this.currentPendingResult = {
      ...result,
      thumbnail: thumbnailDataUrl || (existingTxn && existingTxn.thumbnail) ||
        generateReceiptImageBase64(result.merchant, result.amount, result.date, result.rawText)
    };
    this.editingTxnId = existingTxn ? existingTxn.id : null;

    document.getElementById('review-modal-title').textContent = existingTxn
      ? 'Chỉnh Sửa & Kiểm Tra Hóa Đơn'
      : 'Kiểm Tra & Lưu Hóa Đơn AI';
    document.getElementById('edit-merchant').value = result.merchant;
    document.getElementById('edit-amount').value = result.amount;
    document.getElementById('edit-date').value = result.date;
    document.getElementById('edit-notes').value = existingTxn ? (existingTxn.notes || '') : '';
    document.getElementById('raw-ocr-preview').textContent = result.rawText;
    document.getElementById('err-edit-merchant').classList.add('hidden');
    document.getElementById('err-edit-amount').classList.add('hidden');

    const thumbWrap = document.getElementById('receipt-thumb-wrap');
    if (thumbWrap) thumbWrap.style.display = '';
    const confBanner = document.getElementById('review-confidence-banner');
    if (confBanner) confBanner.style.display = '';

    const thumbImg = document.getElementById('receipt-thumb-img');
    thumbImg.src = this.currentPendingResult.thumbnail;

    const confScore = Math.round(result.confidence * 100);
    document.getElementById('conf-score-text').textContent = `Độ tin cậy OCR: ${confScore}%`;
    document.getElementById('conf-latency-text').textContent = `Thời gian xử lý: ${result.latencyMs || 15} ms`;

    this.renderReviewCategoryChips(result.category);
    document.getElementById('review-modal').classList.remove('hidden');
  }

  renderReviewCategoryChips(selectedKey) {
    const chipsWrap = document.getElementById('category-selector-chips');
    chipsWrap.innerHTML = '';
    Object.keys(CATEGORIES).forEach(k => {
      const cat = CATEGORIES[k];
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `category-choice-chip ${selectedKey === k ? 'selected' : ''}`;
      chip.innerHTML = `${cat.icon} ${cat.name}`;
      chip.onclick = () => {
        this.currentPendingResult.category = k;
        this.renderReviewCategoryChips(k);
      };
      chipsWrap.appendChild(chip);
    });
  }

  saveEditedTransaction() {
    const merchant = document.getElementById('edit-merchant').value.trim();
    const amount = parseFloat(document.getElementById('edit-amount').value) || 0;
    const date = document.getElementById('edit-date').value;
    const notes = document.getElementById('edit-notes').value.trim();
    const category = this.currentPendingResult ? this.currentPendingResult.category : 'other';

    if (!merchant) {
      const err = document.getElementById('err-edit-merchant');
      err.textContent = 'Vui lòng nhập tên đơn vị bán lẻ!';
      err.classList.remove('hidden');
      return;
    }
    if (amount <= 0) {
      const err = document.getElementById('err-edit-amount');
      err.textContent = 'Vui lòng nhập số tiền chi tiêu dương hợp lệ!';
      err.classList.remove('hidden');
      return;
    }

    const txnPayload = {
      id: this.editingTxnId || ('TXN-' + Date.now()),
      merchant,
      amount,
      date,
      category,
      confidence: this.currentPendingResult ? this.currentPendingResult.confidence : 0.92,
      notes,
      rawText: this.currentPendingResult ? this.currentPendingResult.rawText : '',
      thumbnail: this.currentPendingResult ? this.currentPendingResult.thumbnail : '',
      updatedAt: Date.now()
    };

    if (this.editingTxnId) {
      const idx = this.transactions.findIndex(t => t.id === this.editingTxnId);
      if (idx !== -1) this.transactions[idx] = txnPayload;
    } else {
      this.transactions.unshift(txnPayload);
    }

    this.editingTxnId = null;
    StorageManager.saveTransactions(this.transactions, this.currentUser?.email);
    document.getElementById('review-modal').classList.add('hidden');
    this.render(true);

    // Push to Cloudflare KV for immediate cross-device sync!
    CloudSyncService.pushToCloud(this.currentUser?.email, this.transactions, StorageManager.getMonthlyBudget(this.currentUser?.email));
    this.showSyncToast('✓ Đã lưu & đồng bộ hóa đơn lên Đám Mây!');
  }

  deleteTransaction(id, ev) {
    if (ev) ev.stopPropagation();
    this.transactions = this.transactions.filter(t => t.id !== id);
    StorageManager.saveTransactions(this.transactions, this.currentUser?.email);
    this.render(true);

    // Sync deletion to cloud across all devices
    CloudSyncService.deleteFromCloud(this.currentUser?.email, id);
    CloudSyncService.pushToCloud(this.currentUser?.email, this.transactions, StorageManager.getMonthlyBudget(this.currentUser?.email));
    this.showSyncToast('Đã xóa & đồng bộ thay đổi trên tất cả thiết bị');
  }

  openManualEntryModal() {
    this.editingTxnId = null;
    this.currentPendingResult = {
      merchant: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      category: 'food',
      confidence: 1.0,
      latencyMs: 0,
      thumbnail: '',
      rawText: '(Khoản chi tiền mặt ghi nhận thủ công - Không có hóa đơn)'
    };
    document.getElementById('review-modal-title').textContent = '➕ Thêm Khoản Chi Tiêu Thủ Công';
    document.getElementById('edit-merchant').value = '';
    document.getElementById('edit-amount').value = '';
    document.getElementById('edit-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('edit-notes').value = '';
    document.getElementById('raw-ocr-preview').textContent = '(Khoản chi tiền mặt ghi nhận thủ công - Không có hóa đơn)';
    document.getElementById('err-edit-merchant').classList.add('hidden');
    document.getElementById('err-edit-amount').classList.add('hidden');

    const thumbWrap = document.getElementById('receipt-thumb-wrap');
    if (thumbWrap) thumbWrap.style.display = 'none';

    const confBanner = document.getElementById('review-confidence-banner');
    if (confBanner) confBanner.style.display = 'none';

    this.renderReviewCategoryChips('food');
    document.getElementById('review-modal').classList.remove('hidden');
    setTimeout(() => {
      const amtInput = document.getElementById('edit-amount');
      if (amtInput) amtInput.focus();
    }, 150);
  }

  loadSampleReceipt(idx = 0) {
    const sample = SAMPLE_RECEIPTS[idx] || SAMPLE_RECEIPTS[0];
    const thumb = generateReceiptImageBase64(sample.merchant, sample.amount, sample.date, sample.rawText);
    this.triggerOcr(sample.rawText, thumb);
  }

  exportJsonBackup() {
    const backupData = {
      appName: 'Smart Expense OCR Tracker',
      version: '13.0',
      exportedAt: new Date().toISOString(),
      user: this.currentUser ? { fullName: this.currentUser.fullName, email: this.currentUser.email } : null,
      monthlyBudget: StorageManager.getMonthlyBudget(this.currentUser?.email),
      transactions: this.transactions
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_expense_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ Đã tải tệp sao lưu JSON thành công! Bạn có thể lưu giữ tệp này để bảo toàn dữ liệu.');
  }

  exportCsv() {
    const headers = ['Mã GD', 'Đơn vị bán hàng', 'Số tiền (VND)', 'Ngày GD', 'Danh mục', 'Độ tin cậy OCR', 'Ghi chú'];
    const rows = this.transactions.map(t => [
      t.id,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      t.amount,
      t.date,
      (CATEGORIES[t.category] || CATEGORIES.other).name,
      `${Math.round((t.confidence || 0.9) * 100)}%`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VKU_OCR_Expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatVND(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  renderFilterCategoryChips() {
    const wrap = document.getElementById('filter-category-chips');
    if (!wrap) return;
    wrap.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = `sample-chip ${this.selectedFilterCategory === 'all' ? 'active-chip' : ''}`;
    allBtn.textContent = `📋 Tất cả (${this.transactions.length})`;
    allBtn.onclick = () => {
      this.selectedFilterCategory = 'all';
      this.render(false);
    };
    wrap.appendChild(allBtn);

    Object.keys(CATEGORIES).forEach(k => {
      const cat = CATEGORIES[k];
      const count = this.transactions.filter(t => t.category === k).length;
      const btn = document.createElement('button');
      btn.className = `sample-chip ${this.selectedFilterCategory === k ? 'active-chip' : ''}`;
      btn.textContent = `${cat.icon} ${cat.name} (${count})`;
      btn.onclick = () => {
        this.selectedFilterCategory = this.selectedFilterCategory === k ? 'all' : k;
        this.render(false);
      };
      wrap.appendChild(btn);
    });
  }

  render(animateCharts = false) {
    const totalAmount = this.transactions.reduce((s, t) => s + t.amount, 0);
    document.getElementById('kpi-total-amount').textContent = this.formatVND(totalAmount);
    document.getElementById('kpi-total-count').textContent = `${this.transactions.length} giao dịch đã lưu`;

    const budget = StorageManager.getMonthlyBudget(this.currentUser?.email);
    const budgetEl = document.getElementById('kpi-budget-amount');
    if (budgetEl) budgetEl.textContent = this.formatVND(budget);

    const pct = budget > 0 ? Math.round((totalAmount / budget) * 100) : 0;
    const progressEl = document.getElementById('kpi-budget-progress');
    if (progressEl) {
      if (pct >= 100) {
        progressEl.innerHTML = `<span style="color:#ef4444;font-weight:700;">⚠️ Vượt ngân sách: ${pct}%</span>`;
      } else if (pct >= 80) {
        progressEl.innerHTML = `<span style="color:#f59e0b;font-weight:700;">⚠️ Cảnh báo: Đã dùng ${pct}%</span>`;
      } else {
        progressEl.textContent = `Đã dùng: ${pct}% ngân sách`;
      }
    }

    // FinTech Wallet Card Progress & Remaining Status
    const remainingBudget = Math.max(0, budget - totalAmount);
    const remEl = document.getElementById('kpi-remaining-budget');
    if (remEl) remEl.textContent = `Còn lại: ${this.formatVND(remainingBudget)}`;

    const walletBar = document.getElementById('wallet-progress-bar');
    if (walletBar) {
      walletBar.style.width = `${Math.min(100, pct)}%`;
      walletBar.classList.remove('warning', 'danger');
      if (pct >= 100) {
        walletBar.classList.add('danger');
      } else if (pct >= 80) {
        walletBar.classList.add('warning');
      }
    }

    const healthBadge = document.getElementById('kpi-health-status');
    if (healthBadge) {
      if (pct >= 100) {
        healthBadge.textContent = '🔴 Vượt hạn mức';
      } else if (pct >= 80) {
        healthBadge.textContent = '🟡 Cảnh báo: Sắp hết';
      } else {
        healthBadge.textContent = '🟢 Ngân sách an toàn';
      }
    }

    // AI Financial Insights Engine
    const insightsEl = document.getElementById('insights-text');
    if (insightsEl) {
      if (this.transactions.length === 0) {
        insightsEl.textContent = 'Chưa có đủ dữ liệu chi tiêu. Bạn hãy quét hóa đơn hoặc bấm "Ghi Tiền Mặt" để AI phân tích thói quen và tư vấn tài chính cá nhân.';
      } else {
        const catTotals = {};
        this.transactions.forEach(t => {
          catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        });
        let topCatKey = 'food';
        let topCatAmt = 0;
        Object.keys(catTotals).forEach(k => {
          if (catTotals[k] > topCatAmt) {
            topCatAmt = catTotals[k];
            topCatKey = k;
          }
        });
        const topCat = CATEGORIES[topCatKey] || CATEGORIES.other;
        const topCatPct = totalAmount > 0 ? Math.round((topCatAmt / totalAmount) * 100) : 0;

        let advice = `💡 <strong>Đánh giá tài chính AI:</strong> Bạn đã ghi nhận <strong>${this.transactions.length} khoản chi</strong> với tổng chi tiêu <strong>${this.formatVND(totalAmount)}</strong>.<br>`;
        advice += `• Khoản chi lớn nhất hiện tại thuộc mục <strong>${topCat.icon} ${topCat.name}</strong> (${this.formatVND(topCatAmt)}, chiếm ${topCatPct}% ngân sách).<br>`;
        if (pct >= 100) {
          advice += `• ⚠️ Bạn đã vượt ngân sách dự trù tháng <strong>${pct - 100}%</strong>. Nên hoãn các khoản chi thiết bị hoặc giải trí không cấp thiết.`;
        } else if (pct >= 80) {
          advice += `• ⚡ Bạn đã chạm <strong>${pct}%</strong> hạn mức. Hãy duy trì chi tiêu trung bình dưới <strong>${this.formatVND(Math.round(remainingBudget / 10))}/ngày</strong> trong thời gian tới.`;
        } else {
          advice += `• 🎯 Kiểm soát chi tiêu rất tốt! Bạn còn dư <strong>${this.formatVND(remainingBudget)}</strong> trong hạn mức dự kiến.`;
        }
        insightsEl.innerHTML = advice;
      }
    }

    // Populate Reports Tab KPI cards & Category Breakdown Table
    const repTotalEl = document.getElementById('rep-kpi-total');
    if (repTotalEl) repTotalEl.textContent = this.formatVND(totalAmount);
    const repCountEl = document.getElementById('rep-kpi-count');
    if (repCountEl) repCountEl.textContent = `${this.transactions.length} giao dịch`;
    const repBudgetEl = document.getElementById('rep-kpi-budget');
    if (repBudgetEl) repBudgetEl.textContent = this.formatVND(budget);
    const repRemEl = document.getElementById('rep-kpi-remaining');
    if (repRemEl) repRemEl.textContent = `Còn lại: ${this.formatVND(remainingBudget)}`;
    const repPctEl = document.getElementById('rep-kpi-pct');
    if (repPctEl) repPctEl.textContent = `${pct}%`;
    const repStatusEl = document.getElementById('rep-kpi-status');
    if (repStatusEl) {
      repStatusEl.textContent = pct >= 100 ? 'Vượt hạn mức' : (pct >= 80 ? 'Sắp hết' : 'Ngân sách an toàn');
      repStatusEl.className = 'report-kpi-sub ' + (pct >= 100 ? 'text-danger' : (pct >= 80 ? 'text-warning' : 'text-success'));
    }

    const catTotals = {};
    const catCounts = {};
    Object.keys(CATEGORIES).forEach(k => {
      catTotals[k] = 0;
      catCounts[k] = 0;
    });
    this.transactions.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    let topCatKey = 'food';
    let topCatAmt = 0;
    Object.keys(catTotals).forEach(k => {
      if (catTotals[k] > topCatAmt) {
        topCatAmt = catTotals[k];
        topCatKey = k;
      }
    });

    const repTopCatEl = document.getElementById('rep-kpi-top-cat');
    if (repTopCatEl) {
      repTopCatEl.textContent = topCatAmt > 0 ? (CATEGORIES[topCatKey]?.name || '--') : '--';
    }
    const repTopAmtEl = document.getElementById('rep-kpi-top-amount');
    if (repTopAmtEl) {
      repTopAmtEl.textContent = topCatAmt > 0 ? this.formatVND(topCatAmt) : '0 ₫';
    }

    const repTbody = document.getElementById('report-category-tbody');
    if (repTbody) {
      repTbody.innerHTML = '';
      if (this.transactions.length === 0) {
        repTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:14px;">Chưa có dữ liệu giao dịch để phân loại.</td></tr>';
      } else {
        Object.keys(CATEGORIES).forEach(k => {
          const amt = catTotals[k];
          const cnt = catCounts[k];
          if (cnt > 0) {
            const cat = CATEGORIES[k];
            const p = totalAmount > 0 ? ((amt / totalAmount) * 100).toFixed(1) : 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>
                <span class="table-cat-badge" style="background:${cat.color}18;color:${cat.color};">
                  ${cat.icon} ${cat.name}
                </span>
              </td>
              <td style="text-align:center;font-weight:700;">${cnt}</td>
              <td style="text-align:right;font-weight:800;color:var(--text-main);">${this.formatVND(amt)}</td>
              <td style="text-align:right;font-weight:700;color:var(--primary);">${p}%</td>
            `;
            repTbody.appendChild(tr);
          }
        });
      }
    }

    this.renderFilterCategoryChips();

    // Date Range Filtering Logic
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    const thisMonthPrefix = now.toISOString().slice(0, 7);

    const filtered = this.transactions.filter(t => {
      const matchesCat = this.selectedFilterCategory === 'all' || t.category === this.selectedFilterCategory;
      const matchesSearch = !this.searchQuery ||
        (t.merchant || '').toLowerCase().includes(this.searchQuery) ||
        (t.notes || '').toLowerCase().includes(this.searchQuery) ||
        (t.rawText || '').toLowerCase().includes(this.searchQuery);

      let matchesDate = true;
      if (this.selectedDateRange === 'today') {
        matchesDate = (t.date === todayStr);
      } else if (this.selectedDateRange === 'this_week') {
        matchesDate = (t.date >= oneWeekAgo);
      } else if (this.selectedDateRange === 'this_month') {
        matchesDate = (t.date && t.date.startsWith(thisMonthPrefix));
      }

      return matchesCat && matchesSearch && matchesDate;
    });

    document.getElementById('txn-count-badge').textContent = `${filtered.length} bản ghi`;

    const listWrap = document.getElementById('transactions-list');
    listWrap.innerHTML = '';
    if (filtered.length === 0) {
      listWrap.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-8"/><path d="M16 12h-8"/><path d="M12 16h-4"/></svg>
          </div>
          <h4>Chưa có khoản chi tiêu nào</h4>
          <p>Bắt đầu ghi chép bằng cách quét hóa đơn AI hoặc dùng thử dữ liệu mẫu</p>
          <div class="empty-actions-row">
            <button type="button" class="btn-empty-scan" onclick="app.triggerImagePicker()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              Quét Hóa Đơn
            </button>
            <button type="button" class="btn-empty-sample" onclick="app.loadSampleReceipt(0)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Thử Dữ Liệu Mẫu
            </button>
          </div>
        </div>
      `;
    } else {
      filtered.forEach(t => {
        const cat = CATEGORIES[t.category] || CATEGORIES.other;
        const card = document.createElement('div');
        card.className = 'txn-card';
        card.onclick = () => this.openExpenseDetailModal(t);
        card.innerHTML = `
          <div class="txn-icon" style="background:${cat.color}18;color:${cat.color}">
            ${cat.icon}
          </div>
          <div class="txn-details">
            <div class="txn-merchant">${t.merchant}</div>
            <div class="txn-meta">${t.date} • ${cat.name} ${t.notes ? '• ' + t.notes : ''}</div>
          </div>
          <div class="txn-amount-wrap">
            <div class="txn-amount">${this.formatVND(t.amount)}</div>
            <span class="txn-confidence">Độ tin cậy OCR: ${Math.round((t.confidence || 0.92) * 100)}%</span>
          </div>
          <button class="txn-del-btn" title="Xóa" onclick="app.deleteTransaction('${t.id}', event)">✕</button>
        `;
        listWrap.appendChild(card);
      });
    }

    if (animateCharts) {
      this.animateCustomPainterCharts(totalAmount);
    } else {
      this.renderDonutChart(totalAmount, 1.0);
      this.renderBarChart(1.0);
    }
  }

  animateCustomPainterCharts(totalAmount) {
    const duration = 750;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const easeOut = 1 - Math.pow(1 - t, 3);
      this.renderDonutChart(totalAmount, easeOut);
      this.renderBarChart(easeOut);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  renderDonutChart(totalAmount, progress = 1.0) {
    const canvas = document.getElementById('donutChartCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 240;
    const h = 240;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const radius = 92;
    const strokeWidth = 28;

    ctx.clearRect(0, 0, w, h);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this.isDarkMode ? '#334155' : '#E2E8F0';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    const catTotals = {};
    Object.keys(CATEGORIES).forEach(k => catTotals[k] = 0);
    this.transactions.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    if (totalAmount > 0) {
      let startAngle = -Math.PI / 2;
      Object.keys(CATEGORIES).forEach(k => {
        const amt = catTotals[k];
        if (amt > 0) {
          const sweepAngle = (amt / totalAmount) * 2 * Math.PI * progress;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
          ctx.strokeStyle = CATEGORIES[k].color;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
          startAngle += sweepAngle;
        }
      });
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.isDarkMode ? '#94A3B8' : '#64748B';
    ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('TỔNG CHI TIÊU', cx, cy - 10);

    ctx.fillStyle = this.isDarkMode ? '#F8FAFC' : '#0F172A';
    ctx.font = '800 15px Plus Jakarta Sans, sans-serif';
    ctx.fillText(this.formatVND(Math.round(totalAmount * progress)), cx, cy + 12);

    if (progress === 1.0) {
      const legendWrap = document.getElementById('pie-legend');
      legendWrap.innerHTML = '';
      Object.keys(CATEGORIES).forEach(k => {
        const amt = catTotals[k];
        if (amt > 0) {
          const cat = CATEGORIES[k];
          const pct = totalAmount > 0 ? ((amt / totalAmount) * 100).toFixed(1) : 0;
          const pill = document.createElement('div');
          pill.className = 'legend-pill';
          pill.style.background = `${cat.color}18`;
          pill.style.borderColor = `${cat.color}45`;
          pill.style.color = cat.color;
          pill.style.cursor = 'pointer';
          pill.onclick = () => {
            this.selectedFilterCategory = this.selectedFilterCategory === k ? 'all' : k;
            this.render(false);
          };
          pill.innerHTML = `
            <span class="legend-dot" style="background:${cat.color}"></span>
            ${cat.name}: ${pct}% (${this.formatVND(amt)})
          `;
          legendWrap.appendChild(pill);
        }
      });
    }
  }

  renderBarChart(progress = 1.0) {
    const canvas = document.getElementById('barChartCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 340;
    const h = 190;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const dayLabels = [];
    const dateStrings = [];
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      dayLabels.push(`${dd}/${mm}`);
      dateStrings.push(`${yyyy}-${mm}-${dd}`);
    }

    this.transactions.forEach(t => {
      const idx = dateStrings.indexOf(t.date);
      if (idx !== -1) {
        weeklyData[idx] += t.amount;
      }
    });

    const maxVal = Math.max(...weeklyData, 100000);
    const bottomPad = 26;
    const topPad = 24;
    const sidePad = 16;
    const chartH = h - bottomPad - topPad;
    const chartW = w - sidePad * 2;
    const slotW = chartW / 7;
    const barW = Math.min(slotW * 0.55, 24);

    ctx.strokeStyle = this.isDarkMode ? '#334155' : '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = topPad + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(sidePad, y);
      ctx.lineTo(w - sidePad, y);
      ctx.stroke();
    }

    weeklyData.forEach((val, i) => {
      const x = sidePad + slotW * i + (slotW - barW) / 2;
      const barH = Math.max(4, (val / maxVal) * chartH * progress);
      const y = topPad + chartH - barH;

      const isMax = val === maxVal && val > 0;
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      if (isMax) {
        grad.addColorStop(0, '#0284C7');
        grad.addColorStop(1, '#38BDF8');
      } else {
        grad.addColorStop(0, this.isDarkMode ? '#64748B' : '#94A3B8');
        grad.addColorStop(1, this.isDarkMode ? '#475569' : '#CBD5E1');
      }

      ctx.fillStyle = grad;
      this._roundRect(ctx, x, y, barW, barH, 5);

      if (val > 0 && progress > 0.5) {
        ctx.fillStyle = isMax ? '#38BDF8' : (this.isDarkMode ? '#94A3B8' : '#64748B');
        ctx.font = '700 9.5px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        const compact = val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : Math.round(val / 1000) + 'k';
        ctx.fillText(compact, x + barW / 2, y - 5);
      }

      ctx.fillStyle = isMax ? '#38BDF8' : (this.isDarkMode ? '#94A3B8' : '#64748B');
      ctx.font = isMax ? '800 11px Plus Jakarta Sans, sans-serif' : '600 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dayLabels[i], x + barW / 2, h - 8);
    });
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
}

let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new AppController();
  window.app = app;
});
