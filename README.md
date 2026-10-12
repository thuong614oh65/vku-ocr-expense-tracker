# Mini-Project #3: OCR Expense Tracker & Receipt Parser (Flutter 3.x & Dart 3)

> **Học phần:** Phát Triển Ứng Dụng Di Động Đa Nền Tảng (Lớp 4) — VKU  
> **Sinh viên thực hiện:** Nguyễn Thị Thương  
> **Mã số sinh viên (MSSV):** 23IT.B219 — **Lớp sinh hoạt:** 23SE4  
> **Email:** [thuongnt.23itb@vku.udn.vn](mailto:thuongnt.23itb@vku.udn.vn)  
> **Giảng viên hướng dẫn:** TS. Nguyễn Thanh Tuấn — Khoa Khoa học Máy tính, Trường Đại học CNTT & TT Việt - Hàn (VKU)

---

## 🔗 Liên Kết Bàn Giao Dự Án (Mandatory 3 Deliverables)

1. **🌐 Live Demo URL (Cloudflare):** [https://vku-ocr-expense.thuong2213.workers.dev/](https://vku-ocr-expense.thuong2213.workers.dev/)
2. **📱 Signed Release APK (`app-release.apk`):** [https://github.com/thuong614oh65/vku-ocr-expense-tracker/releases/download/v1.0.0/app-release.apk](https://github.com/thuong614oh65/vku-ocr-expense-tracker/releases/download/v1.0.0/app-release.apk)
3. **💻 GitHub Repository:** [https://github.com/thuong614oh65/vku-ocr-expense-tracker](https://github.com/thuong614oh65/vku-ocr-expense-tracker)
4. **📄 Báo Cáo Kỹ Thuật (PDF 2–4 trang):** `BAO_CAO_KY_THUAT_REPORT.pdf` & `Mini-Project-3-Report.pdf`

---

## 🎯 1. Tổng Quan Dự Án & Bối Cảnh Thực Tế

Sinh viên và thủ quỹ các câu lạc bộ VKU thường xuyên phải xử lý rất nhiều hóa đơn mua sắm, siêu thị, ăn uống và giáo trình. Việc nhập thủ công từng con số vào bảng tính Excel rất tốn thời gian và dễ xảy ra nhầm lẫn.

**VKU OCR Expense Tracker** giải quyết triệt để bài toán này bằng kiến trúc **Flutter 3.x & Dart 3** hiện đại:
1. **Camera Capture, Tap-to-Focus & Image Cropping:** Kính ngắm máy ảnh trực tiếp với bật/tắt đèn Flash, chạm lấy nét (`Tap-to-Focus AF`) và khung cắt hóa đơn (`CameraOverlayPainter` với `PathFillType.evenOdd` & tia laser quét động).
2. **On-Device AI OCR (`google_mlkit_text_recognition`):** Trích xuất văn bản tức thì trong **sub-100ms** hoàn toàn ngoại tuyến (**Offline-First, Zero Cloud Cost**).
3. **Regex Heuristic Parser & Dart 3 Records/Patterns:**
   * **Tên đơn vị bán hàng (Merchant):** WinMart+, Highlands Coffee, Fahasa, Petrolimex, Thế Giới Di Động, Căn tin VKU,...
   * **Tổng tiền (Total Amount):** Phân tích chuẩn tiền tệ Việt Nam (`87.500 VND`, `115,000 đ`, `245.000đ`), loại bỏ nhiễu số điện thoại / mã số thuế.
   * **Thời gian giao dịch (Date):** Bóc tách ngày tháng chuẩn `DD/MM/YYYY`.
   * **Phân loại danh mục tự động (6 nhóm):** Ăn uống (`Food`), Học tập (`Study`), Di chuyển (`Travel`), Thiết bị (`Gear`), Giải trí (`Entertainment`), Khác (`Other`).
4. **Quản lý Trạng thái & Lưu trữ Cục bộ (`Riverpod 2` + `sqflite` SQLite):**
   * Quản lý state toàn cục an toàn lúc biên dịch bằng `Notifier` & `NotifierProvider` (`flutter_riverpod`).
   * Lưu trữ giao dịch vào cơ sở dữ liệu quan hệ **SQLite (`sqflite`)** kèm lưu bộ nhớ đệm ảnh thu nhỏ hóa đơn (`Receipt Thumbnail Caching`) trong thư mục ứng dụng (`path_provider`).
5. **Trực quan hóa Canvas 120Hz không dùng thư viện thứ ba (`CustomPainter`):**
   * **Biểu đồ tròn Donut Chart (`CustomPieChart`)** với hiệu ứng `AnimationController` (`Curves.easeOutCubic`).
   * **Biểu đồ cột Weekly Bar Chart (`CustomBarChart`)** so sánh chi tiêu 7 ngày gần nhất (`T2 → CN`).
6. **Material Design 3 Light & Dark Mode + Platform Channels (`MethodChannel`):**
   * Chuyển đổi giao diện Sáng / Tối (`ThemeMode.light` / `ThemeMode.dark`) mượt mà.
   * Giao tiếp Native Android/iOS qua `MethodChannel('vn.edu.vku/device_info')`.

---

## 🏗️ 2. Cấu Trúc Mã Nguồn Chuẩn Clean Architecture (Modular Structure)

```
Tuan_07_08_MiniProject3_VKU_OCRExpenseTracker/
├── lib/
│   ├── main.dart                         # Điểm khởi chạy ứng dụng, ProviderScope & Material 3 Shell
│   ├── core/
│   │   ├── app_theme.dart                # Cấu hình Material Design 3 Light & Dark Theme
│   │   └── app_router.dart               # Định tuyến khai báo với GoRouter & ShellRoute
│   ├── models/
│   │   ├── expense_category.dart         # Dart 3 Switch Expressions, Pattern Matching & 6 danh mục
│   │   └── receipt_transaction.dart      # Model giao dịch bất biến, const constructor & JSON/SQLite map
│   ├── services/
│   │   ├── ocr_service.dart              # Tích hợp Google ML Kit Text Recognition On-Device
│   │   ├── regex_parser_service.dart     # Động cơ Heuristic Regex & Dart 3 Records tuple parser
│   │   ├── storage_service.dart          # Cơ sở dữ liệu SQLite (sqflite CRUD) & lưu đệm ảnh hóa đơn
│   │   ├── device_info_channel.dart      # Platform Channel (MethodChannel) giao tiếp Android/iOS
│   │   └── mock_receipts_service.dart    # 5 mẫu hóa đơn thực tế tại VKU phục vụ kiểm thử nhanh
│   ├── state/
│   │   └── expense_provider.dart         # Riverpod 2 Notifier & NotifierProvider (Expenses, Theme, Filter)
│   ├── widgets/
│   │   ├── expense_summary_card.dart     # Thẻ chi tiêu Material 3 + Dismissible (ValueKey)
│   │   ├── custom_pie_chart.dart         # Biểu đồ tròn Donut vẽ bằng CustomPainter (No 3rd party)
│   │   ├── custom_bar_chart.dart         # Biểu đồ cột 7 ngày vẽ bằng CustomPainter
│   │   └── camera_overlay_painter.dart   # Khung cắt hóa đơn, tia laser động & vòng lấy nét AF
│   └── screens/
│       ├── dashboard_screen.dart         # Màn hình chính, Dark Mode toggle, KPIs, Charts & Filter
│       ├── camera_scanner_screen.dart    # Giao diện chụp hóa đơn, Flash, Tap-to-Focus & mẫu thử
│       └── receipt_review_screen.dart    # Form xác thực (GlobalKey<FormState>), chỉnh sửa & lưu DB
├── web/                                  # Phiên bản Live Demo Web (Cloudflare) với Camera & OCR thật
├── .github/workflows/build-apk.yml       # CI/CD tự động build & phát hành signed app-release.apk
├── pubspec.yaml                          # Cấu hình dependencies Flutter 3.x & Dart 3
├── BAO_CAO_KY_THUAT_REPORT.md            # Báo cáo kỹ thuật chi tiết (Tiếng Việt)
└── Mini-Project-3-Report.md              # Báo cáo kỹ thuật theo mẫu chuẩn (Tiếng Anh/Việt)
```

---

## 🚀 3. Hướng Dẫn Cài Đặt & Build Ứng Dụng (Setup & Build Commands)

```bash
# 1. Clone repository từ GitHub
git clone https://github.com/thuong614oh65/vku-ocr-expense-tracker.git
cd vku-ocr-expense-tracker

# 2. Cài đặt các gói thư viện phụ thuộc
flutter pub get

# 3. Chạy ứng dụng trên thiết bị Android hoặc trình duyệt Chrome
flutter run -d android
flutter run -d chrome

# 4. Đóng gói file Signed Release APK
flutter build apk --release
```

---

## 📊 4. Bảng Kiểm Tra Tính Năng & Thang Điểm 10 (Rubric Checklist)

| Hạng mục (Rubric) | Trọng số | Trạng thái | Chi tiết triển khai kỹ thuật |
|---|:---:|:---:|---|
| **1. On-Device OCR & Heuristics** | **3.5 pts** | ✅ Hoàn thành | Camera capture, chạm lấy nét AF, bật/tắt Flash, `google_mlkit_text_recognition` sub-100ms, Regex bóc tách Tổng tiền, Ngày và Tên cửa hàng. |
| **2. Custom Canvas Visualization** | **2.5 pts** | ✅ Hoàn thành | Vẽ trực tiếp bằng `CustomPainter` (`drawArc`, `drawRRect`) kết hợp `AnimationController`: Biểu đồ tròn Donut & Biểu đồ cột 7 ngày (`T2 → CN`). |
| **3. State Management & DB** | **2.0 pts** | ✅ Hoàn thành | Kiến trúc `Riverpod 2` (`NotifierProvider`), lưu trữ bền vững `sqflite` SQLite CRUD, lưu bộ nhớ đệm ảnh thu nhỏ hóa đơn (`Receipt Thumbnail`). |
| **4. UI/UX Polish** | **1.0 pt** | ✅ Hoàn thành | Chuẩn Material Design 3, hỗ trợ chuyển đổi **Light / Dark Mode**, `Form` + `TextFormField` validation, thẻ `Dismissible` với `ValueKey`. |
| **5. Deliverables & Report** | **1.0 pt** | ✅ Hoàn thành | Live Demo Cloudflare, `app-release.apk` trên GitHub Releases, mã nguồn sạch và Báo cáo kỹ thuật PDF 2–4 trang. |
