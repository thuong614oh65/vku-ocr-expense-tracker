# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 3: OCR Expense Tracker & Receipt Parser (Flutter 3.x & Dart 3)  
**Team / Student Name:** Nguyễn Thị Thương  
**Submission Date:** 12/10/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. **Nguyễn Thị Thương** — Student ID: **23IT.B219** — Class: **23SE4** — Course Class: **Phát triển ứng dụng di động đa nền tảng (4)** — Instructor: **TS. Nguyễn Thanh Tuấn** — Role: **Full-Stack Mobile & On-Device AI Developer** — Contribution: **100%**
* **🔗 Live Demo URL:** [https://vku-ocr-expense.thuong2213.workers.dev/](https://vku-ocr-expense.thuong2213.workers.dev/)
* **📱 Signed Release APK (`app-release.apk`):** [https://github.com/thuong614oh65/vku-ocr-expense-tracker/releases/download/v1.0.0/app-release.apk](https://github.com/thuong614oh65/vku-ocr-expense-tracker/releases/download/v1.0.0/app-release.apk)
* **💻 GitHub Repository:** [https://github.com/thuong614oh65/vku-ocr-expense-tracker](https://github.com/thuong614oh65/vku-ocr-expense-tracker)

---

## 2. FEATURE IMPLEMENTATION CHECKLIST (10-POINT RUBRIC ALIGNMENT)

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Camera Capture, Focus Tap & Framing Crop** | ✅ Complete | `CameraScannerScreen` + `CameraOverlayPainter`: Live camera viewfinder with Flash/Torch toggle, tap-to-focus (`AF`) reticle animation, and even-odd framing crop overlay with animated laser. |
| 2 | **On-Device Text Recognition (ML Kit)** | ✅ Complete | `OcrService` integrates `google_mlkit_text_recognition` (`TextRecognizer`) for offline, sub-100ms on-device text extraction with zero cloud cost. |
| 3 | **Regex Heuristic Parser & Dart 3 Records** | ✅ Complete | `RegexReceiptParser` uses multi-stage regex heuristics & Dart 3 Records `(String merchant, double total, DateTime date)` to extract Vietnamese totals (`150.000 đ`, `150,000 VND`), dates (`DD/MM/YYYY`), merchants, and 6 categories. |
| 4 | **Interactive Review & Form Validation** | ✅ Complete | `ReceiptReviewScreen` uses `Form`, `GlobalKey<FormState>`, `AutovalidateMode.onUserInteraction`, `TextFormField` validators, `FocusNode` chaining, AI confidence badge, and raw OCR inspector. |
| 5 | **Riverpod 2 Compile-Safe State Management** | ✅ Complete | `expense_provider.dart` implements `ExpenseController extends Notifier<List<ReceiptTransaction>>`, `ThemeModeController`, and `CategoryFilterController` consumed via `ConsumerStatefulWidget`. |
| 6 | **Local SQLite (`sqflite`) & Thumbnail Cache** | ✅ Complete | `StorageService` persists transactions in `sqflite` (`vku_expense_ocr.db`) with Web `SharedPreferences` fallback, and caches cropped receipt thumbnails in the app documents directory (`path_provider`). |
| 7 | **CustomPainter Animated Donut / Pie Chart** | ✅ Complete | `CustomPieChart` draws category distribution directly on GPU Canvas via `canvas.drawArc` + `AnimationController` (`Curves.easeOutCubic`) without any third-party chart library. |
| 8 | **CustomPainter Animated Weekly Bar Chart** | ✅ Complete | `CustomBarChart` renders 7-day (`T2 → CN`) spending bars using `canvas.drawRRect`, `LinearGradient`, dashed grid lines, and `TextPainter` compact currency labels. |
| 9 | **Material 3 Light / Dark Mode & Polish** | ✅ Complete | Full Material Design 3 seed color harmonization (`#0284C7`), one-tap Light/Dark mode toggle, and `ExpenseSummaryCard` wrapped in `Dismissible(key: ValueKey(txn.id))`. |
| 10 | **Declarative Routing & Platform Channel** | ✅ Complete | `GoRouter` with `ShellRoute` persistent bottom navigation (`app_router.dart`) and `MethodChannel('vn.edu.vku/device_info')` (`device_info_channel.dart`) for native battery/haptic interop. |

---

## 3. TECHNICAL ARCHITECTURE & OCR REGEX TUNING

### 3.1. End-to-End System Pipeline & Clean Architecture
```
[Camera Capture / Gallery] ──► [Google ML Kit TextRecognizer (Offline <100ms)]
                                               │
                                               ▼
[Local SQLite (sqflite) + Thumbnail Cache] ◄── [ReceiptReviewScreen (Form Validation)] ◄── [RegexReceiptParser (Dart 3 Records)]
                   │
                   ▼
[Riverpod 2 NotifierProvider] ──► [DashboardScreen + Animated CustomPainter Donut & Bar Charts (120Hz Impeller)]
```

* **Modular Directory Structure:** `lib/core/` (`app_theme.dart`, `app_router.dart`) • `lib/models/` (`expense_category.dart`, `receipt_transaction.dart`) • `lib/services/` (`ocr_service.dart`, `regex_parser_service.dart`, `storage_service.dart`, `device_info_channel.dart`, `mock_receipts_service.dart`) • `lib/state/` (`expense_provider.dart`) • `lib/widgets/` (`custom_pie_chart.dart`, `custom_bar_chart.dart`, `camera_overlay_painter.dart`, `expense_summary_card.dart`) • `lib/screens/` (`dashboard_screen.dart`, `camera_scanner_screen.dart`, `receipt_review_screen.dart`).

### 3.2. Real-World Vietnamese Receipt Regex Tuning Table

| Target Field | Regular Expression Pattern | Edge Cases Handled |
|---|---|---|
| **Total Keyword Line** | `(?:tổng\s*(?:cộng\|tiền\|thanh\s*toán)?\|thanh\s*toán\|phải\s*trả\|total\|amount\s*due)[\s:=-]*([0-9]{1,3}(?:[.,][0-9]{3})*\|[0-9]+)` | Matches `TỔNG CỘNG: 87,500 VND`, `THANH TOÁN: 115.000 đ`, `TOTAL: 245000` across noisy thermal prints. |
| **Currency Number Normalization** | `\b([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:đ\|vnd\|vnđ)?\b` | Normalizes both dot-separated (`150.000`) and comma-separated (`150,000`) Vietnamese thousands, while rejecting 10-digit phone numbers and Tax IDs (`MST`). |
| **Transaction Date (`DD/MM/YYYY`)** | `\b([0-3]?[0-9])[/\-.]([0-1]?[0-9])[/\-.](20[2-3][0-9]\|[2-3][0-9])\b` | Extracts `28/09/2026`, `12-10-2026`, `12.10.26` and pairs with `([0-2]?[0-9]):([0-5][0-9])` timestamp. |
| **Merchant Header & Category** | Dictionary lookup (`WinMart+`, `Highlands Coffee`, `Fahasa`, `Petrolimex`, `Thế Giới Di Động`) + Top-4 header line heuristic | Filters out generic header words (`HÓA ĐƠN`, `PHIẾU THANH TOÁN`, `ĐỊA CHỈ`, `MST`) and auto-maps to 6 categories via Dart 3 `switch` expressions. |

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS (LIGHT & DARK MODES)
* **Evidence 1 — Dashboard in Light & Dark Mode (`DashboardScreen`):** Displays VKU student header (`Nguyễn Thị Thương • 23IT.B219 • 23SE4`), Light/Dark theme toggle (`🌙 / ☀️`), KPI cards (Total Spent & 3,500,000 ₫ Monthly Budget), Category Filter chips, and virtualized `ExpenseSummaryCard` list with swipe-to-delete (`Dismissible`).
* **Evidence 2 — Custom Canvas Visualizations (`CustomPainter`):** Hardware-accelerated Donut Pie Chart (`canvas.drawArc`) with animated sweep angle and center total counter, paired with 7-day Weekly Bar Chart (`canvas.drawRRect`) highlighting peak spending days in VKU Sky Blue gradient.
* **Evidence 3 — Live Camera Viewfinder & Framing Overlay (`CameraScannerScreen`):** Real-time camera feed with 4 glowing corner brackets, animated scanning laser, tap-to-focus (`AF`) reticle, Flash toggle, and 5 one-tap VKU sample receipt chips (`WinMart+`, `Highlands`, `Fahasa`, `Petrolimex`, `Thế Giới Di Động`).
* **Evidence 4 — Interactive OCR Review & Manual Correction (`ReceiptReviewScreen`):** Shows AI Confidence badge (`96% • 24ms`), cached receipt thumbnail preview, validated `TextFormField` inputs for Merchant, Total Amount (VND), Date, Category `ChoiceChip` selector, and expandable Raw OCR text viewer.

---

## 5. TECHNICAL CHALLENGES, RESOLUTIONS & LIMITATIONS
1. **Challenge 1 — Disambiguating Receipt Totals from Phone Numbers & Tax IDs (`MST`):** Vietnamese receipts contain 10-digit phone numbers (`02363667888`), tax codes (`0104918404`), and cash tendered (`TIỀN MẶT: 100,000`). *Resolution:* Prioritized context-anchored regex lines (`TỔNG CỘNG`, `PHẢI TRẢ`) before falling back to max-number heuristics, and filtered out unformatted $\ge 10$-digit integers.
2. **Challenge 2 — Zero-Jank 120Hz Custom Chart Animations Without Third-Party Packages:** *Resolution:* Implemented custom `shouldRepaint()` checks in `_DonutChartPainter` and `_WeeklyBarChartPainter` driven by `CurvedAnimation(curve: Curves.easeOutCubic)`, issuing direct `drawArc` and `drawRRect` calls to Flutter's Skia/Impeller canvas.
3. **Current Limitations & Future Work:** Extremely crumpled or faded thermal receipts under low light can degrade OCR character accuracy on Vietnamese diacritics; future iterations will add OpenCV adaptive thresholding pre-processing and multi-page receipt stitching.

---
*Đà Nẵng, Ngày 12 tháng 10 năm 2026*  
**Sinh viên thực hiện:** **Nguyễn Thị Thương — MSSV: 23IT.B219 — Lớp: 23SE4**
