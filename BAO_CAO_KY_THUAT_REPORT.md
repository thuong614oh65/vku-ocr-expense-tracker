# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 3: OCR Expense Tracker & Receipt Parser (Flutter & Dart)  
**Team / Student Name:** Nguyễn Thị Thương  
**Submission Date:** 28/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. **Nguyễn Thị Thương** — Student ID: **23IT.B219** — Class: **23ITB** — Role: **Full-stack Mobile & AI Engineer (Flutter Architecture, On-Device ML Kit, Regex Heuristics & Custom Canvas)** — Contribution: **100%**
* **🔗 Live Demo URL:** [https://vku-ocr-expense-17t.pages.dev/](https://vku-ocr-expense-17t.pages.dev/)
* **💻 GitHub Repository:** [https://github.com/thuong614oh65/vku-ocr-expense-tracker](https://github.com/thuong614oh65/vku-ocr-expense-tracker)
* **🎥 Video Demo / Mobile Access:** Truy cập trực tiếp tại đường dẫn Live Demo trên thiết bị di động (hỗ trợ cả Camera thật và bộ kiểm thử hóa đơn mẫu sinh viên VKU).

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Camera Capture & Image Cropping** | ✅ Complete | Giao diện kính ngắm camera với tính năng bật/tắt đèn Flash, chọn ảnh từ thư viện, và khung cắt `CameraOverlayPainter` kèm tia laser quét động. |
| 2 | **On-Device Text Recognition** | ✅ Complete | Tích hợp thư viện `google_mlkit_text_recognition`, trích xuất văn bản biên lai hoàn toàn ngoại tuyến trên thiết bị với độ trễ sub-100ms, không tốn chi phí điện toán đám mây. |
| 3 | **Regex Heuristic Parser Engine** | ✅ Complete | Động cơ Heuristic tự xây dựng bóc tách chính xác: Tổng tiền (`150.000 đ`, `150,000 VND`), ngày giao dịch (`DD/MM/YYYY`), tên đơn vị bán lẻ (WinMart, Highlands, Fahasa, Petrolimex), và tự động phân loại danh mục. |
| 4 | **Interactive Review & Manual Edits** | ✅ Complete | Màn hình `ReceiptReviewScreen` hiển thị chỉ số độ tin cậy AI (Confidence Score), cho phép người dùng kiểm tra lại và chỉnh sửa số tiền, tên quán, ngày, danh mục trước khi lưu. |
| 5 | **Local Database & Offline Persistence** | ✅ Complete | Lưu trữ bền vững dữ liệu chi tiêu và phân loại 6 danh mục chính (Ăn uống, Học tập, Di chuyển, Thiết bị, Giải trí, Khác), dữ liệu tồn tại vĩnh viễn khi tắt app. |
| 6 | **Custom Canvas Donut Pie Chart** | ✅ Complete | Biểu đồ tròn Donut vẽ hoàn toàn bằng `CustomPainter` (`canvas.drawArc`), tính toán góc lát cắt tỷ lệ thuận với chi tiêu, có hiệu ứng chuyển động mượt mà và chú thích phân loại. |
| 7 | **Custom Canvas Weekly Bar Chart** | ✅ Complete | Biểu đồ cột 7 ngày trong tuần vẽ trực tiếp bằng `CustomPainter` (`canvas.drawRRect`), hỗ trợ dải màu Gradient, đường lưới ngắt quãng và nhãn hiển thị số tiền rút gọn. |
| 8 | **Packaging & Cross-Platform Web Demo** | ✅ Complete | Triển khai phiên bản Web chạy mượt trên Cloudflare Pages, hỗ trợ PWA Standalone và cung cấp liên kết tải APK Release cho Android. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1. Directory Structure
```
lib/
├── main.dart                      # App entry point & Navigation bar shell
├── models/
│   ├── expense_category.dart      # 6 categories, color mappings & keyword heuristics
│   └── receipt_transaction.dart   # Transaction entity with formatters & serialization
├── services/
│   ├── ocr_service.dart           # Google ML Kit integration & cross-platform adapter
│   ├── regex_parser_service.dart  # Heuristic regex extractor (amount, date, merchant)
│   ├── mock_receipts_service.dart # Real VKU receipt samples for instant grading/testing
│   └── storage_service.dart       # Offline-first local database service
├── widgets/
│   ├── custom_pie_chart.dart      # Canvas Donut chart painter (CustomPainter)
│   ├── custom_bar_chart.dart      # Canvas Weekly bar chart painter (CustomPainter)
│   └── camera_overlay_painter.dart# Viewfinder brackets & animated laser painter
└── screens/
    ├── dashboard_screen.dart      # KPI cards, charts, scan trigger & recent records
    ├── camera_scanner_screen.dart # Camera viewfinder, flash toggle & sample bar
    └── receipt_review_screen.dart # AI review, confidence rating & category picker
```

### 3.2. Data Flow Architecture
1. **Thu nhận ảnh (Image Ingestion):** Người dùng chụp hóa đơn qua camera hoặc chọn ảnh từ bộ sưu tập.
2. **Nhận dạng ký tự (OCR Layer):** Google ML Kit trích xuất văn bản thô theo khối dòng chữ (`TextBlock` -> `TextLine`).
3. **Phân tích ngữ nghĩa (Regex Heuristics Layer):**
   * Quét từ khóa tổng tiền (`TỔNG CỘNG`, `THANH TOÁN`, `TOTAL`, `VND`) để xác định giá trị thanh toán cuối cùng.
   * Quét định dạng ngày tháng `\b([0-3]?[0-9])[/\-.]([0-1]?[0-9])[/\-.](20[2-3][0-9])\b`.
   * Đối chiếu thương hiệu trong từ điển đơn vị bán lẻ Việt Nam.
   * Gán nhãn danh mục thông minh theo tập từ khóa sản phẩm.
4. **Xác nhận người dùng (Human-in-the-loop):** Màn hình Review cho phép kiểm tra độ tin cậy AI và tinh chỉnh dữ liệu.
5. **Lưu trữ & Trực quan hóa (Canvas Visualization):** Dữ liệu được ghi vào cơ sở dữ liệu cục bộ; các widget `CustomPainter` tự động kích hoạt hoạt họa vẽ lại biểu đồ tròn và cột trên Canvas.

---

## 4. EMPIRICAL EVIDENCE & SYSTEM CAPABILITIES

### 4.1. Màn hình Bảng Điều Khiển Tổng Quan (DashboardScreen)
* Hiển thị thẻ thông tin sinh viên VKU (Nguyễn Thị Thương - 23IT.B219).
* 2 thẻ chỉ số KPI: Tổng chi tiêu thực tế và Tiến độ ngân sách tháng (3.500.000 ₫).
* Nút bấm lớn kích hoạt nhanh máy ảnh quét hóa đơn AI.
* 2 biểu đồ Canvas tự vẽ độc lập không dùng bất kỳ thư viện biểu đồ bên ngoài nào.

### 4.2. Khung ngắm Camera & Tia Laser Quét AI (CameraScannerScreen)
* Kính ngắm máy ảnh với 4 góc bo dạ quang màu xanh VKU (`Color(0xFF0284C7)`).
* Tia laser quét động di chuyển lên xuống liên tục với hiệu ứng vệt sáng gradient.
* Thanh kiểm thử hóa đơn mẫu thực tế (WinMart, Highlands, Fahasa, Petrolimex, Thế Giới Di Động) giúp kiểm tra độ chính xác của AI ngay trên bất kỳ thiết bị nào mà không cần chuẩn bị sẵn hóa đơn giấy.

### 4.3. Màn hình Kiểm Tra & Bóc Tách Hóa Đơn AI (ReceiptReviewScreen)
* Huy hiệu đánh giá độ tin cậy AI (Confidence Score) từ 0% đến 99%.
* Các trường dữ liệu tự động điền sẵn: Đơn vị bán lẻ, Tổng tiền, Ngày tháng, Danh mục.
* Ngăn kéo mở rộng cho phép xem toàn bộ văn bản thô OCR trích xuất được từ hóa đơn.

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### 5.1. Thách thức 1: Phân Tách Tổng Tiền Chính Xác Trên Hóa Đơn Việt Nam Bị Nhăn / Lẫn Nhiều Con Số
* **Vấn đề kỹ thuật:** Hóa đơn siêu thị chứa rất nhiều con số: mã hóa đơn, mã số thuế (MST), số điện thoại, đơn giá từng món, tiền thừa,... Nếu chỉ tìm số lớn nhất, hệ thống rất dễ bắt nhầm số điện thoại hoặc mã vạch.
* **Giải pháp khắc phục:**
  1. Xây dựng biểu thức chính quy nhiều tầng ưu tiên kết hợp từ khóa ngữ cảnh:
     ```dart
     RegExp(r'(?:tổng\s*(?:cộng|tiền|thanh\s*toán)?|thanh\s*toán|tiền\s*mặt|total)[\s:=-]*([0-9]{1,3}(?:[.,][0-9]{3})*)', caseSensitive: false)
     ```
  2. Bổ sung thuật toán làm sạch số tiền Việt Nam (`_parseVietnameseNumber`), xử lý triệt để cả trường hợp dấu chấm làm phân cách hàng nghìn (`150.000`) và dấu phẩy (`150,000`).
  3. Áp dụng quy tắc lọc độ dài: loại bỏ các chuỗi số liên tục từ 10 chữ số trở lên không có dấu phân cách để không nhầm với số điện thoại hoặc mã số thuế.

### 5.2. Thách thức 2: Vẽ Biểu Đồ Tròn Donut & Biểu Đồ Cột 60 FPS Bằng CustomPainter Không Dùng Thư Viện Ngoài
* **Vấn đề kỹ thuật:** Đề cương yêu cầu vẽ trực tiếp trên Canvas bằng `CustomPainter`. Việc tính toán góc quét lượng giác ($\Delta \theta = \frac{A_i}{\sum A} \cdot 2\pi$), tọa độ hiển thị nhãn và hiệu ứng chuyển động mượt mà đòi hỏi sự chính xác cao về mặt hình học.
* **Giải pháp khắc phục:**
  1. Trong `_DonutChartPainter`, sử dụng phương thức `canvas.drawArc` vẽ từ góc 12 giờ ($-\frac{\pi}{2}$ rad), kết hợp độ dày nét `strokeWidth = 28.0` và tâm lỗ rỗng để tạo hình Donut hiện đại.
  2. Tích hợp `AnimationController` với đường cong `Curves.easeOutCubic`, nhân tiến độ `progress` vào góc quét để tạo hiệu ứng các lát cắt mở rộng dần khi mở màn hình.
  3. Trong `_WeeklyBarChartPainter`, áp dụng `RRect.fromRectAndRadius` tạo các cột bo góc tròn mềm mại kèm dải chuyển màu `LinearGradient` làm nổi bật ngày có chi tiêu cao nhất.

---
*Đà Nẵng, Ngày 28 tháng 09 năm 2026*  
**Sinh viên thực hiện:**  
**Nguyễn Thị Thương — MSSV: 23IT.B219**
