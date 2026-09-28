# Mini-Project #3: OCR Expense Tracker & Receipt Parser (Flutter & Dart)

> **Học phần:** Lập Trình Đa Nền Tảng (Cross-Platform Mobile App Development) — VKU  
> **Sinh viên thực hiện:** Nguyễn Thị Thương  
> **Mã số sinh viên (MSSV):** 23IT.B219 — **Lớp:** 23ITB  
> **Email:** thuongnt.23itb@vku.udn.vn  
> **Giảng viên hướng dẫn:** Bộ môn Kỹ thuật Phần mềm, Trường Đại học CNTT & TT Việt - Hàn (VKU)

---

## 🔗 Liên Kết Bàn Giao Dự Án (Submission Deliverables)

* **🌐 Live Demo Web (Cloudflare):** [https://vku-ocr-expense.thuong2213.workers.dev/](https://vku-ocr-expense.thuong2213.workers.dev/)
* **💻 GitHub Repository:** [https://github.com/thuong614oh65/vku-ocr-expense-tracker](https://github.com/thuong614oh65/vku-ocr-expense-tracker)
* **📄 Báo Cáo Kỹ Thuật (PDF):** `BAO_CAO_KY_THUAT_REPORT.pdf` (Kèm theo dự án)

---

## 🎯 1. Tổng Quan Dự Án & Bối Cảnh Thực Tế

Sinh viên và thủ quỹ các câu lạc bộ VKU thường xuyên phải xử lý rất nhiều hóa đơn mua sắm, siêu thị, ăn uống và giáo trình. Việc nhập thủ công từng con số vào bảng tính Excel rất tốn thời gian và dễ xảy ra nhầm lẫn.

**VKU OCR Expense Tracker** giải quyết bài toán này bằng cách:
1. **On-Device AI OCR:** Tích hợp **Google ML Kit Text Recognition** trích xuất văn bản tức thì trong **sub-100ms** hoàn toàn ngoại tuyến (**Offline-First, Zero Cloud Cost**).
2. **Regex Heuristic Parser:** Bộ phân tích thông minh nhận dạng:
   * **Tên đơn vị bán hàng (Merchant):** WinMart+, Highlands Coffee, Fahasa, Petrolimex, Căn tin VKU,...
   * **Tổng tiền (Total Amount):** Phân tích chuẩn tiền tệ Việt Nam (`87.500 VND`, `115,000 đ`, `245.000đ`).
   * **Thời gian giao dịch (Date):** Bóc tách ngày tháng chuẩn `DD/MM/YYYY`.
   * **Phân loại danh mục tự động:** Ăn uống, Học tập, Di chuyển, Thiết bị, Giải trí.
3. **Trực quan hóa Canvas không dùng thư viện thứ ba (`CustomPainter`):**
   * **Biểu đồ tròn Donut Chart** thể hiện cơ cấu chi tiêu.
   * **Biểu đồ cột Weekly Bar Chart** so sánh 7 ngày gần nhất.

---

## 🏗️ 2. Cấu Trúc Mã Nguồn (Modular Architecture)

```
Tuan_07_08_MiniProject3_VKU_OCRExpenseTracker/
├── lib/
│   ├── main.dart                      # Điểm khởi chạy ứng dụng & Navigation Shell
│   ├── models/
│   │   ├── expense_category.dart      # Định nghĩa 6 danh mục, màu sắc, icon & từ khóa
│   │   └── receipt_transaction.dart   # Model giao dịch chi tiêu, bóc tách OCR & JSON
│   ├── services/
│   │   ├── ocr_service.dart           # Tích hợp Google ML Kit & Fallback đa nền tảng
│   │   ├── regex_parser_service.dart  # Động cơ Heuristic bóc tách tổng tiền, ngày, quán
│   │   ├── mock_receipts_service.dart # Dữ liệu hóa đơn mẫu phục vụ chấm bài & kiểm thử
│   │   └── storage_service.dart       # Lưu trữ bền vững Offline (SQLite / SharedPreferences)
│   ├── widgets/
│   │   ├── custom_pie_chart.dart      # Biểu đồ tròn Donut vẽ bằng CustomPainter (No 3rd party)
│   │   ├── custom_bar_chart.dart      # Biểu đồ cột 7 ngày vẽ bằng CustomPainter
│   │   └── camera_overlay_painter.dart# Khung ngắm máy ảnh & tia laser quét hóa đơn
│   └── screens/
│       ├── dashboard_screen.dart      # Màn hình chính, KPIs, biểu đồ Canvas, danh sách
│       ├── camera_scanner_screen.dart # Giao diện chụp hóa đơn, đèn Flash & mẫu thử
│       └── receipt_review_screen.dart # Màn hình xác nhận, chỉnh sửa và chấm điểm AI
├── web/                               # Phiên bản triển khai Web Cloudflare Pages
│   ├── index.html                     # Giao diện Web tương thích di động
│   ├── style.css                      # Phong cách Material 3 hiện đại
│   └── app.js                         # Bộ xử lý bóc tách Regex & Canvas Web
├── android/                           # Cấu hình Native Android & Quyền Camera
├── pubspec.yaml                       # Quản lý gói phụ thuộc Flutter 3.x
└── BAO_CAO_KY_THUAT_REPORT.md         # Báo cáo kỹ thuật chi tiết theo chuẩn VKU
```

---

## 🚀 3. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống:
* **Flutter SDK:** `>= 3.10.0`
* **Dart SDK:** `>= 3.0.0 < 4.0.0`
* Thiết bị Android thật hoặc Chrome Web Browser.

### Các bước thực hiện:
```bash
# 1. Clone repository từ GitHub
git clone https://github.com/thuong614oh65/vku-ocr-expense-tracker.git
cd vku-ocr-expense-tracker

# 2. Cài đặt các thư viện phụ thuộc
flutter pub get

# 3. Chạy trực tiếp trên trình duyệt Web (Chrome)
flutter run -d chrome

# 4. Hoặc chạy trên thiết bị Android
flutter run -d android

# 5. Đóng gói file APK Release
flutter build apk --release
```

---

## 📊 4. Bảng Kiểm Tra Tính Năng (Feature Checklist)

| STT | Tính Năng Yêu Cầu | Trạng Thái | Chi Tiết Kỹ Thuật |
|:---:|---|:---:|---|
| 1 | **Khung ngắm máy ảnh & Cắt khung** | ✅ Hoàn thành | `CameraOverlayPainter` vẽ góc bo tròn, viền dạ quang và tia quét laser động. |
| 2 | **On-Device Text Recognition** | ✅ Hoàn thành | Tích hợp `google_mlkit_text_recognition` tốc độ sub-100ms, không tốn phí cloud. |
| 3 | **Regex Heuristic Parser** | ✅ Hoàn thành | Nhận dạng chính xác tổng tiền VND (`150.000 đ`, `150,000 VND`), ngày và tên quán. |
| 4 | **Màn hình Review & Sửa thủ công** | ✅ Hoàn thành | `ReceiptReviewScreen` cho phép kiểm tra độ tin cậy AI, chỉnh sửa trước khi lưu. |
| 5 | **Lưu trữ Cục Bộ Bền Vững** | ✅ Hoàn thành | Hỗ trợ lưu trữ offline, khôi phục trạng thái tức thì khi mở lại ứng dụng. |
| 6 | **Biểu đồ CustomPainter** | ✅ Hoàn thành | Vẽ trực tiếp trên Canvas: Biểu đồ tròn Donut & Biểu đồ cột tuần (không dùng thư viện ngoài). |
