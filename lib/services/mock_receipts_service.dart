import '../models/expense_category.dart';
import '../models/receipt_transaction.dart';

class SampleReceipt {
  final String title;
  final String merchant;
  final String rawOcrText;
  final double expectedAmount;
  final String expectedDate;
  final ExpenseCategoryType categoryType;

  const SampleReceipt({
    required this.title,
    required this.merchant,
    required this.rawOcrText,
    required this.expectedAmount,
    required this.expectedDate,
    required this.categoryType,
  });
}

class MockReceiptsService {
  static const List<SampleReceipt> sampleReceipts = [
    SampleReceipt(
      title: 'WinMart+ Cổng Trường VKU',
      merchant: 'WinMart+',
      categoryType: ExpenseCategoryType.food,
      expectedAmount: 87500,
      expectedDate: '28/09/2026',
      rawOcrText: '''
WINMART+ VKU DA NANG
Sieu Thi VinCommerce - Cua hang WinMart+
Dia chi: 470 Duong Tran Dai Nghia, Ngu Hanh Son, Da Nang
MST: 0104918404-128
----------------------------------------
PHIEU THANH TOAN
So HD: HD092826-00412
Ngay: 28/09/2026 11:45
Thu ngan: Nguyen Thi Lan

1. Banh mi cha bong             18,000
2. Sua chua Vinamilk 100g (x2)  17,000
3. Nuoc khoang Lavie 500ml      7,500
4. Ca phe lon Highlands        15,000
5. Mi ly Omachi Bo Xot         30,000
----------------------------------------
CONG TIEN HANG:                  87,500
VAT (8%):                         7,000
TONG CONG:                       87,500 VND
TIEN MAT:                       100,000
TIEN THUA:                       12,500
----------------------------------------
Cam on quy khach - Hen gap lai!
      ''',
    ),
    SampleReceipt(
      title: 'Highlands Coffee - Căn Tin VKU',
      merchant: 'Highlands Coffee',
      categoryType: ExpenseCategoryType.food,
      expectedAmount: 115000,
      expectedDate: '27/09/2026',
      rawOcrText: '''
HIGHLANDS COFFEE VKU
Cong ty Co Phan Dich Vu Ca Phe Cao Nguyen
Dia chi: Toa nha V, Truong Dai hoc CNTT & TT Viet - Han
Tel: (0236) 3667 888
----------------------------------------
HOA DON BAN LE
Ban so: 08 (Khu V)
Gio vao: 14:15 - 27/09/2026
Thu ngan: Mai Phuong

1. Phin Sua Da (L)              39,000
2. Tra Sen Vang Kem Cheese (M)  49,000
3. Banh Mousse Dao              27,000
----------------------------------------
TONG CONG:                     115,000 đ
Chuyen khoan QR:               115,000
----------------------------------------
Pass Wifi: highlandscoffee2026
Highlands Coffee xin cam on!
      ''',
    ),
    SampleReceipt(
      title: 'Nhà Sách Fahasa Đà Nẵng - Sách & Vở',
      merchant: 'Nhà Sách Fahasa',
      categoryType: ExpenseCategoryType.study,
      expectedAmount: 245000,
      expectedDate: '26/09/2026',
      rawOcrText: '''
NHA SACH FAHASA DA NANG
Chi nhanh Cong ty Phat Hanh Sach Fahasa
Dia chi: 300-302 Le Duan, Da Nang
----------------------------------------
HOA DON TINH TIEN
Ngay mua: 26/09/2026 09:30
Thu ngan: Pham Van Hai

1. Giao trinh Lap trinh Flutter  125,000
2. Tap vo sinh vien Klong (x3)    60,000
3. But gel Zebra Sarasa 0.5 (x2)  40,000
4. Giay note ghi chu              20,000
----------------------------------------
TONG TIEN:                      245,000 VND
Thanh toan the VNPay:           245,000
----------------------------------------
Doi tra hang trong vong 07 ngay co hoa don.
Xin cam on quy khach!
      ''',
    ),
    SampleReceipt(
      title: 'Cây Xăng Petrolimex Nam Kỳ Khởi Nghĩa',
      merchant: 'Petrolimex',
      categoryType: ExpenseCategoryType.travel,
      expectedAmount: 70000,
      expectedDate: '25/09/2026',
      rawOcrText: '''
TAP DOAN XANG DAU VIET NAM
PETROLIMEX CUA HANG SO 18
Dia chi: Nam Ky Khoi Nghia, Hoa Quy, Ngu Hanh Son
----------------------------------------
HOA DON DIEN TU
Ngay: 25/09/2026 17:10
Cot bom: 02 - E5 RON 92-II

Don gia: 21,850 VND/Lit
So luong: 3.20 Lit
----------------------------------------
TONG TIEN THANH TOAN:            70,000 VND
Bang chu: Bay muoi ngan dong chan
Tien mat:                        70,000
----------------------------------------
PETROLIMEX - De tien xa hon
      ''',
    ),
    SampleReceipt(
      title: 'Thế Giới Di Động - Phụ Kiện Laptop',
      merchant: 'Thế Giới Di Động',
      categoryType: ExpenseCategoryType.gear,
      expectedAmount: 350000,
      expectedDate: '24/09/2026',
      rawOcrText: '''
THE GIOI DI DONG
Dia chi: 120 Tran Dai Nghia, Da Nang
Hotline: 1800 1060
----------------------------------------
PHIEU XUAT KHO KIEM HOA DON
Ngay lap: 24/09/2026 15:40

1. Chuot khong day Logitech M170 190,000
2. Cap sac nhanh Type-C Baseus   160,000
----------------------------------------
CONG:                           350,000
VAT:                             35,000 (Da bao gom)
TONG TIEN PHAI TRA:             350,000 đ
Hinh thuc:                      MoMo
----------------------------------------
Bao hanh 12 thang theo so dien thoai.
      ''',
    ),
  ];

  static List<ReceiptTransaction> getInitialSeedTransactions() {
    return [
      ReceiptTransaction(
        id: 'TXN-VKU-001',
        merchantName: 'WinMart+ Cổng Trường VKU',
        amount: 87500,
        dateTime: DateTime.now().subtract(const Duration(hours: 3)),
        categoryType: ExpenseCategoryType.food,
        rawOcrText: sampleReceipts[0].rawOcrText,
        notes: 'Mua đồ ăn nhẹ và bánh mì ôn thi nhóm Mini-Project',
        confidenceScore: 0.95,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      ReceiptTransaction(
        id: 'TXN-VKU-002',
        merchantName: 'Highlands Coffee VKU',
        amount: 115000,
        dateTime: DateTime.now().subtract(const Duration(days: 1, hours: 2)),
        categoryType: ExpenseCategoryType.food,
        rawOcrText: sampleReceipts[1].rawOcrText,
        notes: 'Họp nhóm đồ án Lập trình đa nền tảng tại Tòa nhà V',
        confidenceScore: 0.92,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      ReceiptTransaction(
        id: 'TXN-VKU-003',
        merchantName: 'Nhà Sách Fahasa Đà Nẵng',
        amount: 245000,
        dateTime: DateTime.now().subtract(const Duration(days: 2)),
        categoryType: ExpenseCategoryType.study,
        rawOcrText: sampleReceipts[2].rawOcrText,
        notes: 'Giáo trình lập trình di động & tập vở sinh viên',
        confidenceScore: 0.88,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      ReceiptTransaction(
        id: 'TXN-VKU-004',
        merchantName: 'Petrolimex Nam Kỳ Khởi Nghĩa',
        amount: 70000,
        dateTime: DateTime.now().subtract(const Duration(days: 3)),
        categoryType: ExpenseCategoryType.travel,
        rawOcrText: sampleReceipts[3].rawOcrText,
        notes: 'Đổ xăng xe máy đi học và thực tập',
        confidenceScore: 0.90,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
      ),
      ReceiptTransaction(
        id: 'TXN-VKU-005',
        merchantName: 'Thế Giới Di Động',
        amount: 350000,
        dateTime: DateTime.now().subtract(const Duration(days: 4)),
        categoryType: ExpenseCategoryType.gear,
        rawOcrText: sampleReceipts[4].rawOcrText,
        notes: 'Chuột không dây & cáp sạc phục vụ code đồ án',
        confidenceScore: 0.94,
        createdAt: DateTime.now().subtract(const Duration(days: 4)),
      ),
    ];
  }
}
