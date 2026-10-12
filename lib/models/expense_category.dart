import 'package:flutter/material.dart';

enum ExpenseCategoryType {
  food,
  study,
  travel,
  gear,
  entertainment,
  other,
}

class ExpenseCategory {
  final ExpenseCategoryType type;
  final String displayName;
  final Color color;
  final IconData icon;
  final List<String> keywords;

  const ExpenseCategory({
    required this.type,
    required this.displayName,
    required this.color,
    required this.icon,
    required this.keywords,
  });

  /// Dart 3 Switch Expression for Category Color (Week 7 Slide 14)
  static Color getCategoryColor(ExpenseCategoryType category) =>
      switch (category) {
        ExpenseCategoryType.food => const Color(0xFFEF4444),
        ExpenseCategoryType.study => const Color(0xFF3B82F6),
        ExpenseCategoryType.travel => const Color(0xFF10B981),
        ExpenseCategoryType.gear => const Color(0xFF8B5CF6),
        ExpenseCategoryType.entertainment => const Color(0xFFF59E0B),
        ExpenseCategoryType.other => const Color(0xFF6B7280),
      };

  /// Dart 3 Pattern Matching on Transaction Map (Week 7 Slide 14)
  static String describeTransaction(Map<String, dynamic> json) =>
      switch (json) {
        {'amount': final num a, 'merchantName': final String m}
            when a >= 500000 =>
          '🚨 Chi tiêu lớn tại $m: ${a.toStringAsFixed(0)} đ',
        {'amount': final num a, 'merchantName': final String m} =>
          'Khoản chi tại $m: ${a.toStringAsFixed(0)} đ',
        _ => 'Giao dịch chi tiêu khác',
      };

  static const List<ExpenseCategory> allCategories = [
    ExpenseCategory(
      type: ExpenseCategoryType.food,
      displayName: 'Ăn Uống (Food & Beverage)',
      color: Color(0xFFEF4444), // Red
      icon: Icons.restaurant,
      keywords: [
        'cà phê', 'cafe', 'coffee', 'trà sữa', 'highlands', 'phúc long',
        'cơm', 'phở', 'bánh mì', 'bún', 'mì', 'pizza', 'burger', 'kfc',
        'lotteria', 'jollibee', 'winmart', 'circle k', 'familymart', 'gs25',
        'thực phẩm', 'đồ uống', 'căn tin', 'bếp', 'ăn trưa', 'nước ngọt'
      ],
    ),
    ExpenseCategory(
      type: ExpenseCategoryType.study,
      displayName: 'Học Tập (Study & Materials)',
      color: Color(0xFF3B82F6), // Blue
      icon: Icons.menu_book,
      keywords: [
        'sách', 'vở', 'bút', 'giáo trình', 'photocopy', 'in ấn', 'tài liệu',
        'học phí', 'khóa học', 'vku', 'fahasa', 'nhà sách', 'phương nam',
        'tiến thọ', 'văn phòng phẩm', 'giấy a4', 'thư viện'
      ],
    ),
    ExpenseCategory(
      type: ExpenseCategoryType.travel,
      displayName: 'Di Chuyển (Travel & Fuel)',
      color: Color(0xFF10B981), // Green
      icon: Icons.directions_car,
      keywords: [
        'xăng', 'petrolimex', 'pv oil', 'xe buýt', 'danabus', 'grab', 'be',
        'taxi', 'vé xe', 'gửi xe', 'rửa xe', 'thay nhớt', 'bảo dưỡng',
        'vé tàu', 'vé máy bay'
      ],
    ),
    ExpenseCategory(
      type: ExpenseCategoryType.gear,
      displayName: 'Thiết Bị (Gear & Technology)',
      color: Color(0xFF8B5CF6), // Purple
      icon: Icons.devices,
      keywords: [
        'chuột', 'mouse', 'bàn phím', 'keyboard', 'tai nghe', 'headphone',
        'cáp sạc', 'usb', 'ram', 'ổ cứng', 'ssd', 'laptop', 'điện thoại',
        'thế giới di động', 'fpt shop', 'cellphones', 'phong vũ', 'linh kiện'
      ],
    ),
    ExpenseCategory(
      type: ExpenseCategoryType.entertainment,
      displayName: 'Giải Trí (Entertainment)',
      color: Color(0xFFF59E0B), // Amber/Orange
      icon: Icons.sports_esports,
      keywords: [
        'cgv', 'lotte cinema', 'vé xem phim', 'billiards', 'bida', 'karaoke',
        'game', 'steam', 'netflix', 'spotify', 'du lịch', 'dã ngoại'
      ],
    ),
    ExpenseCategory(
      type: ExpenseCategoryType.other,
      displayName: 'Chi Tiêu Khác (General)',
      color: Color(0xFF6B7280), // Gray
      icon: Icons.receipt_long,
      keywords: [],
    ),
  ];

  static ExpenseCategory fromType(ExpenseCategoryType type) {
    return allCategories.firstWhere(
      (c) => c.type == type,
      orElse: () => allCategories.last,
    );
  }

  static ExpenseCategory matchFromText(String rawText) {
    final lower = rawText.toLowerCase();
    for (final cat in allCategories) {
      if (cat.type == ExpenseCategoryType.other) continue;
      for (final kw in cat.keywords) {
        if (lower.contains(kw)) {
          return cat;
        }
      }
    }
    return allCategories.last;
  }
}
