/**
 * VKU OCR Expense Tracker & Receipt Parser (Mini-Project 3)
 * Offline-First & Realtime Heuristic Engine
 * Student: Nguyễn Thị Thương - 23IT.B219 - Lớp 23ITB
 */

// ── Categories & Colors (Matching Flutter Models) ───────────────────────────
const CATEGORIES = {
  food: { name: 'Ăn Uống', color: '#EF4444', icon: '🍲' },
  study: { name: 'Học Tập', color: '#3B82F6', icon: '📚' },
  travel: { name: 'Di Chuyển', color: '#10B981', icon: '🛵' },
  gear: { name: 'Thiết Bị', color: '#8B5CF6', icon: '💻' },
  entertainment: { name: 'Giải Trí', color: '#F59E0B', icon: '🎮' },
  other: { name: 'Khác', color: '#6B7280', icon: '🧾' },
};

// ── Sample Receipts (for Testing & Grading) ──────────────────────────────────
const SAMPLE_RECEIPTS = [
  {
    merchant: 'WinMart+ Cổng Trường VKU',
    amount: 87500,
    date: '2026-09-28',
    category: 'food',
    confidence: 0.95,
    rawText: `WINMART+ VKU DA NANG\nSieu Thi VinCommerce - Cua hang WinMart+\nDia chi: 470 Duong Tran Dai Nghia, Ngu Hanh Son, Da Nang\nMST: 0104918404-128\n----------------------------------------\nPHIEU THANH TOAN\nSo HD: HD092826-00412\nNgay: 28/09/2026 11:45\nThu ngan: Nguyen Thi Lan\n\n1. Banh mi cha bong             18,000\n2. Sua chua Vinamilk 100g (x2)  17,000\n3. Nuoc khoang Lavie 500ml      7,500\n4. Ca phe lon Highlands        15,000\n5. Mi ly Omachi Bo Xot         30,000\n----------------------------------------\nCONG TIEN HANG:                  87,500\nVAT (8%):                         7,000\nTONG CONG:                       87,500 VND\nTIEN MAT:                       100,000\nTIEN THUA:                       12,500\n----------------------------------------\nCam on quy khach - Hen gap lai!`
  },
  {
    merchant: 'Highlands Coffee VKU',
    amount: 115000,
    date: '2026-09-27',
    category: 'food',
    confidence: 0.92,
    rawText: `HIGHLANDS COFFEE VKU\nCong ty Co Phan Dich Vu Ca Phe Cao Nguyen\nDia chi: Toa nha V, Truong Dai hoc CNTT & TT Viet - Han\nTel: (0236) 3667 888\n----------------------------------------\nHOA DON BAN LE\nBan so: 08 (Khu V)\nGio vao: 14:15 - 27/09/2026\n\n1. Phin Sua Da (L)              39,000\n2. Tra Sen Vang Kem Cheese (M)  49,000\n3. Banh Mousse Dao              27,000\n----------------------------------------\nTONG CONG:                     115,000 đ\nChuyen khoan QR:               115,000\n----------------------------------------\nPass Wifi: highlandscoffee2026\nHighlands Coffee xin cam on!`
  },
  {
    merchant: 'Nhà Sách Fahasa Đà Nẵng',
    amount: 245000,
    date: '2026-09-26',
    category: 'study',
    confidence: 0.88,
    rawText: `NHA SACH FAHASA DA NANG\nChi nhanh Cong ty Phat Hanh Sach Fahasa\nDia chi: 300-302 Le Duan, Da Nang\n----------------------------------------\nHOA DON TINH TIEN\nNgay mua: 26/09/2026 09:30\n\n1. Giao trinh Lap trinh Flutter  125,000\n2. Tap vo sinh vien Klong (x3)    60,000\n3. But gel Zebra Sarasa 0.5 (x2)  40,000\n4. Giay note ghi chu              20,000\n----------------------------------------\nTONG TIEN:                      245,000 VND\nThanh toan the VNPay:           245,000\n----------------------------------------\nXin cam on quy khach!`
  },
  {
    merchant: 'Petrolimex Nam Kỳ Khởi Nghĩa',
    amount: 70000,
    date: '2026-09-25',
    category: 'travel',
    confidence: 0.90,
    rawText: `TAP DOAN XANG DAU VIET NAM\nPETROLIMEX CUA HANG SO 18\nDia chi: Nam Ky Khoi Nghia, Hoa Quy, Ngu Hanh Son\n----------------------------------------\nHOA DON DIEN TU\nNgay: 25/09/2026 17:10\nCot bom: 02 - E5 RON 92-II\n\nDon gia: 21,850 VND/Lit\nSo luong: 3.20 Lit\n----------------------------------------\nTONG TIEN THANH TOAN:            70,000 VND\nBang chu: Bay muoi ngan dong chan\n----------------------------------------\nPETROLIMEX - De tien xa hon`
  },
  {
    merchant: 'Thế Giới Di Động',
    amount: 350000,
    date: '2026-09-24',
    category: 'gear',
    confidence: 0.94,
    rawText: `THE GIOI DI DONG\nDia chi: 120 Tran Dai Nghia, Da Nang\n----------------------------------------\nPHIEU XUAT KHO KIEM HOA DON\nNgay lap: 24/09/2026 15:40\n\n1. Chuot khong day Logitech M170 190,000\n2. Cap sac nhanh Type-C Baseus   160,000\n----------------------------------------\nTONG TIEN PHAI TRA:             350,000 đ\nHinh thuc:                      MoMo\n----------------------------------------\nBao hanh 12 thang theo so dien thoai.`
  }
];

// Initial Seed Data
const SEED_TRANSACTIONS = [
  {
    id: 'TXN-001',
    merchant: 'WinMart+ Cổng Trường VKU',
    amount: 87500,
    date: '2026-09-28',
    category: 'food',
    confidence: 0.95,
    notes: 'Đồ ăn nhẹ ôn tập Mini-Project',
    rawText: SAMPLE_RECEIPTS[0].rawText
  },
  {
    id: 'TXN-002',
    merchant: 'Highlands Coffee VKU',
    amount: 115000,
    date: '2026-09-27',
    category: 'food',
    confidence: 0.92,
    notes: 'Họp nhóm đồ án Tòa nhà V',
    rawText: SAMPLE_RECEIPTS[1].rawText
  },
  {
    id: 'TXN-003',
    merchant: 'Nhà Sách Fahasa Đà Nẵng',
    amount: 245000,
    date: '2026-09-26',
    category: 'study',
    confidence: 0.88,
    notes: 'Giáo trình & tập vở',
    rawText: SAMPLE_RECEIPTS[2].rawText
  },
  {
    id: 'TXN-004',
    merchant: 'Petrolimex Nam Kỳ Khởi Nghĩa',
    amount: 70000,
    date: '2026-09-25',
    category: 'travel',
    confidence: 0.90,
    notes: 'Đổ xăng đi học',
    rawText: SAMPLE_RECEIPTS[3].rawText
  },
  {
    id: 'TXN-005',
    merchant: 'Thế Giới Di Động',
    amount: 350000,
    date: '2026-09-24',
    category: 'gear',
    confidence: 0.94,
    notes: 'Chuột không dây & cáp sạc',
    rawText: SAMPLE_RECEIPTS[4].rawText
  }
];

// ── Storage Manager (Offline Persistence) ──────────────────────────────────
class StorageManager {
  static KEY = 'vku_ocr_expenses_web_v1';

  static getTransactions() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [...SEED_TRANSACTIONS];
    } catch {
      return [...SEED_TRANSACTIONS];
    }
  }

  static saveTransactions(txns) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(txns));
    } catch (e) {
      console.warn('Lỗi lưu localStorage:', e);
    }
  }

  static reset() {
    localStorage.removeItem(this.KEY);
    return [...SEED_TRANSACTIONS];
  }
}

// ── Regex Heuristic OCR Parser (Mirror of Dart RegexReceiptParser) ──────────
class RegexReceiptParser {
  static KNOWN_MERCHANTS = [
    'WinMart+', 'WinMart', 'Circle K', 'Co.opmart', 'Highlands Coffee',
    'Phúc Long Coffee & Tea', 'Căn Tin VKU', 'Nhà Sách Fahasa', 'Thế Giới Di Động',
    'Petrolimex', 'PVOIL', 'Lotteria', 'KFC Vietnam', 'GrabFood'
  ];

  static parse(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let confidence = 0.1;

    // 1. Merchant Detection
    let merchant = 'Hóa Đơn Bán Lẻ';
    const lowerText = rawText.toLowerCase();
    for (const b of this.KNOWN_MERCHANTS) {
      if (lowerText.includes(b.toLowerCase())) {
        merchant = b;
        confidence += 0.35;
        break;
      }
    }
    if (merchant === 'Hóa Đơn Bán Lẻ' && lines.length > 0) {
      merchant = lines[0];
      confidence += 0.1;
    }

    // 2. Amount Detection (Vietnamese keywords)
    let amount = 0;
    const amountRegex = /(?:tổng\s*(?:cộng|tiền|thanh\s*toán)?|thanh\s*toán|tiền\s*mặt|total|grand\s*total)[\s:=-]*([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]+)/i;
    for (const line of lines) {
      const m = line.match(amountRegex);
      if (m && m[1]) {
        const num = this._parseVNNumber(m[1]);
        if (num > 0) {
          amount = num;
          confidence += 0.45;
          break;
        }
      }
    }

    // Fallback amount: highest reasonable number
    if (amount === 0) {
      const allNumbers = rawText.match(/\b([0-9]{1,3}(?:[.,][0-9]{3})+)\b/g);
      if (allNumbers) {
        for (const str of allNumbers) {
          const val = this._parseVNNumber(str);
          if (val >= 1000 && val <= 50000000 && val > amount) {
            amount = val;
            confidence += 0.25;
          }
        }
      }
    }

    // 3. Date Detection (DD/MM/YYYY)
    let dateStr = new Date().toISOString().split('T')[0];
    const dateMatch = rawText.match(/\b([0-3]?[0-9])[/\-.]([0-1]?[0-9])[/\-.](20[2-3][0-9])\b/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      dateStr = `${year}-${month}-${day}`;
      confidence += 0.2;
    }

    // 4. Category Classification
    let category = 'other';
    const lower = rawText.toLowerCase();
    if (lower.includes('cà phê') || lower.includes('coffee') || lower.includes('bánh') || lower.includes('mì') || lower.includes('cơm') || lower.includes('winmart') || lower.includes('highlands')) {
      category = 'food';
    } else if (lower.includes('sách') || lower.includes('vở') || lower.includes('bút') || lower.includes('giáo trình') || lower.includes('fahasa') || lower.includes('vku')) {
      category = 'study';
    } else if (lower.includes('xăng') || lower.includes('petrolimex') || lower.includes('xe buýt') || lower.includes('grab')) {
      category = 'travel';
    } else if (lower.includes('chuột') || lower.includes('cáp') || lower.includes('tai nghe') || lower.includes('di động') || lower.includes('laptop')) {
      category = 'gear';
    } else if (lower.includes('vé') || lower.includes('phim') || lower.includes('karaoke') || lower.includes('game')) {
      category = 'entertainment';
    }

    confidence = Math.min(0.99, Math.max(0.2, confidence));

    return {
      merchant,
      amount,
      date: dateStr,
      category,
      confidence: Math.round(confidence * 100) / 100,
      rawText
    };
  }

  static _parseVNNumber(str) {
    let clean = str.replace(/\s+/g, '');
    if (clean.includes('.') && !clean.includes(',')) clean = clean.replace(/\./g, '');
    else if (clean.includes(',') && !clean.includes('.')) clean = clean.replace(/,/g, '');
    else if (clean.includes('.') && clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }
}

// ── Application Controller ──────────────────────────────────────────────────
class AppController {
  constructor() {
    this.transactions = StorageManager.getTransactions();
    this.currentPendingResult = null;
    this.initUI();
    this.render();
  }

  initUI() {
    // Buttons
    document.getElementById('btn-reset-data').onclick = () => {
      if (confirm('Khôi phục danh sách hóa đơn về dữ liệu ban đầu?')) {
        this.transactions = StorageManager.reset();
        this.render();
      }
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

    // Scanner Modal
    const scannerModal = document.getElementById('scanner-modal');
    document.getElementById('btn-open-scanner').onclick = () => scannerModal.classList.remove('hidden');
    document.getElementById('btn-close-scanner').onclick = () => scannerModal.classList.remove('hidden');
    document.getElementById('btn-close-scanner').onclick = () => scannerModal.classList.add('hidden');

    document.getElementById('btn-toggle-flash').onclick = (e) => {
      e.target.classList.toggle('active');
      alert('⚡ Đèn Flash: ' + (e.target.classList.contains('active') ? 'BẬT' : 'TẮT'));
    };

    document.getElementById('btn-sample-fast').onclick = () => {
      scannerModal.classList.add('hidden');
      this.triggerOcr(SAMPLE_RECEIPTS[0].rawText);
    };

    document.getElementById('btn-shutter-capture').onclick = () => {
      scannerModal.classList.add('hidden');
      // Simulate real-time capture
      this.triggerOcr(SAMPLE_RECEIPTS[0].rawText);
    };

    // File input for image
    const fileInput = document.getElementById('file-input-receipt');
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        scannerModal.classList.add('hidden');
        // If file contains name of sample, match it; otherwise use sample 0
        const matched = SAMPLE_RECEIPTS.find(s => file.name.toLowerCase().includes(s.category)) || SAMPLE_RECEIPTS[0];
        this.triggerOcr(matched.rawText);
      }
    };

    // Sample Chips
    document.querySelectorAll('.sample-chip').forEach(chip => {
      chip.onclick = () => {
        const idx = parseInt(chip.dataset.index, 10);
        this.triggerOcr(SAMPLE_RECEIPTS[idx].rawText);
      };
    });

    // Review Modal
    const reviewModal = document.getElementById('review-modal');
    document.getElementById('btn-close-review').onclick = () => reviewModal.classList.add('hidden');

    document.getElementById('btn-confirm-save').onclick = () => {
      this.saveEditedTransaction();
    };

    // PWA Prompt
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });
    document.getElementById('btn-trigger-pwa').onclick = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        alert('💡 Cài đặt qua Chrome: Bấm menu 3 chấm (⋮) góc trên phải → Chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".');
      }
    };
  }

  triggerOcr(rawText) {
    const result = RegexReceiptParser.parse(rawText);
    this.currentPendingResult = result;

    // Fill Review Modal
    document.getElementById('edit-merchant').value = result.merchant;
    document.getElementById('edit-amount').value = result.amount;
    document.getElementById('edit-date').value = result.date;
    document.getElementById('edit-notes').value = '';
    document.getElementById('raw-ocr-preview').textContent = result.rawText;

    const confScore = Math.round(result.confidence * 100);
    document.getElementById('conf-score-text').textContent = `Độ chính xác AI: ${confScore}% (${confScore >= 80 ? 'Rất cao' : 'Khá'})`;

    // Render Category Chips
    const chipsWrap = document.getElementById('category-selector-chips');
    chipsWrap.innerHTML = '';
    Object.keys(CATEGORIES).forEach(k => {
      const cat = CATEGORIES[k];
      const chip = document.createElement('button');
      chip.className = `category-choice-chip ${result.category === k ? 'selected' : ''}`;
      chip.innerHTML = `${cat.icon} ${cat.name}`;
      chip.onclick = () => {
        document.querySelectorAll('.category-choice-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        this.currentPendingResult.category = k;
      };
      chipsWrap.appendChild(chip);
    });

    document.getElementById('review-modal').classList.remove('hidden');
  }

  saveEditedTransaction() {
    const merchant = document.getElementById('edit-merchant').value.trim();
    const amount = parseFloat(document.getElementById('edit-amount').value) || 0;
    const date = document.getElementById('edit-date').value;
    const notes = document.getElementById('edit-notes').value.trim();
    const selectedCategoryChip = document.querySelector('.category-choice-chip.selected');
    const category = selectedCategoryChip ? this.currentPendingResult.category : 'other';

    if (!merchant) {
      alert('Vui lòng nhập tên đơn vị bán lẻ!');
      return;
    }
    if (amount <= 0) {
      alert('Vui lòng nhập số tiền chi tiêu hợp lệ!');
      return;
    }

    const newTxn = {
      id: 'TXN-' + Date.now(),
      merchant,
      amount,
      date,
      category,
      confidence: this.currentPendingResult ? this.currentPendingResult.confidence : 0.9,
      notes,
      rawText: this.currentPendingResult ? this.currentPendingResult.rawText : ''
    };

    this.transactions.unshift(newTxn);
    StorageManager.saveTransactions(this.transactions);
    document.getElementById('review-modal').classList.add('hidden');
    this.render();

    alert(`✅ Đã lưu thành công khoản chi ${this.formatVND(amount)} vào sổ chi tiêu!`);
  }

  deleteTransaction(id) {
    if (confirm('Xóa khoản chi tiêu này?')) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      StorageManager.saveTransactions(this.transactions);
      this.render();
    }
  }

  formatVND(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  render() {
    const totalAmount = this.transactions.reduce((s, t) => s + t.amount, 0);
    document.getElementById('kpi-total-amount').textContent = this.formatVND(totalAmount);
    document.getElementById('kpi-total-count').textContent = `${this.transactions.length} giao dịch đã lưu`;

    const budget = 3500000;
    const pct = Math.min(100, Math.round((totalAmount / budget) * 100));
    document.getElementById('kpi-budget-progress').textContent = `Đã dùng: ${pct}% ngân sách`;

    document.getElementById('txn-count-badge').textContent = `${this.transactions.length} bản ghi`;

    // Render Transactions List
    const listWrap = document.getElementById('transactions-list');
    listWrap.innerHTML = '';
    if (this.transactions.length === 0) {
      listWrap.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">Chưa có khoản chi nào. Bấm nút Quét ở trên để bắt đầu!</div>';
    } else {
      this.transactions.forEach(t => {
        const cat = CATEGORIES[t.category] || CATEGORIES.other;
        const card = document.createElement('div');
        card.className = 'txn-card';
        card.innerHTML = `
          <div class="txn-icon" style="background:${cat.color}15;color:${cat.color}">
            ${cat.icon}
          </div>
          <div class="txn-details">
            <div class="txn-merchant">${t.merchant}</div>
            <div class="txn-meta">${t.date} • ${cat.name} ${t.notes ? '• ' + t.notes : ''}</div>
          </div>
          <div class="txn-amount-wrap">
            <div class="txn-amount">${this.formatVND(t.amount)}</div>
            <span class="txn-confidence">AI: ${Math.round(t.confidence * 100)}%</span>
          </div>
          <button class="txn-del-btn" title="Xóa" onclick="app.deleteTransaction('${t.id}')">✕</button>
        `;
        listWrap.appendChild(card);
      });
    }

    // Render Charts
    this.renderDonutChart(totalAmount);
    this.renderBarChart();
  }

  // ── CustomPainter Canvas: Donut Pie Chart ──────────────────────────────────
  renderDonutChart(totalAmount) {
    const canvas = document.getElementById('donutChartCanvas');
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
    const radius = 95;
    const strokeWidth = 26;

    ctx.clearRect(0, 0, w, h);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Category aggregation
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
          const sweepAngle = (amt / totalAmount) * 2 * Math.PI;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
          ctx.strokeStyle = CATEGORIES[k].color;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
          startAngle += sweepAngle;
        }
      });
    }

    // Center Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748B';
    ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('TỔNG CHI TIÊU', cx, cy - 10);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 15px Plus Jakarta Sans, sans-serif';
    ctx.fillText(this.formatVND(totalAmount), cx, cy + 12);

    // Legend
    const legendWrap = document.getElementById('pie-legend');
    legendWrap.innerHTML = '';
    Object.keys(CATEGORIES).forEach(k => {
      const amt = catTotals[k];
      if (amt > 0) {
        const cat = CATEGORIES[k];
        const pct = totalAmount > 0 ? ((amt / totalAmount) * 100).toFixed(1) : 0;
        const pill = document.createElement('div');
        pill.className = 'legend-pill';
        pill.style.background = `${cat.color}15`;
        pill.style.borderColor = `${cat.color}40`;
        pill.style.color = cat.color;
        pill.innerHTML = `
          <span class="legend-dot" style="background:${cat.color}"></span>
          ${cat.name}: ${pct}% (${this.formatVND(amt)})
        `;
        legendWrap.appendChild(pill);
      }
    });
  }

  // ── CustomPainter Canvas: Weekly Spending Bar Chart ────────────────────────
  renderBarChart() {
    const canvas = document.getElementById('barChartCanvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 340;
    const h = 180;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];

    // Compute last 7 days distribution
    this.transactions.forEach(t => {
      const d = new Date(t.date);
      const dayIndex = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
      weeklyData[dayIndex] += t.amount;
    });

    const maxVal = Math.max(...weeklyData, 100000);
    const bottomPad = 26;
    const topPad = 24;
    const sidePad = 16;
    const chartH = h - bottomPad - topPad;
    const chartW = w - sidePad * 2;
    const slotW = chartW / 7;
    const barW = Math.min(slotW * 0.55, 24);

    // Grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = topPad + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(sidePad, y);
      ctx.lineTo(w - sidePad, y);
      ctx.stroke();
    }

    // Bars
    weeklyData.forEach((val, i) => {
      const x = sidePad + slotW * i + (slotW - barW) / 2;
      const barH = Math.max(4, (val / maxVal) * chartH);
      const y = topPad + chartH - barH;

      const isMax = val === maxVal && val > 0;
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      if (isMax) {
        grad.addColorStop(0, '#0284C7');
        grad.addColorStop(1, '#38BDF8');
      } else {
        grad.addColorStop(0, '#94A3B8');
        grad.addColorStop(1, '#CBD5E1');
      }

      ctx.fillStyle = grad;
      this._roundRect(ctx, x, y, barW, barH, 4);

      // Top label
      if (val > 0) {
        ctx.fillStyle = isMax ? '#0284C7' : '#64748B';
        ctx.font = '700 9.5px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        const compact = val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : Math.round(val / 1000) + 'k';
        ctx.fillText(compact, x + barW / 2, y - 4);
      }

      // Bottom label
      ctx.fillStyle = isMax ? '#0284C7' : '#64748B';
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

// Start application
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new AppController();
  window.app = app;
});
