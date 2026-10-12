import '../models/expense_category.dart';

class ParsedReceiptResult {
  final String merchantName;
  final double amount;
  final DateTime dateTime;
  final ExpenseCategoryType categoryType;
  final double confidenceScore;
  final List<String> detectedItems;
  final String rawText;

  const ParsedReceiptResult({
    required this.merchantName,
    required this.amount,
    required this.dateTime,
    required this.categoryType,
    required this.confidenceScore,
    this.detectedItems = const [],
    required this.rawText,
  });
}

class RegexReceiptParser {
  // Known Vietnamese and International merchants
  static final List<String> _knownMerchants = [
    'WinMart+',
    'WinMart',
    'Circle K',
    'Co.opmart',
    'Co.op Food',
    'Bách Hóa Xanh',
    'Highlands Coffee',
    'Phúc Long Coffee & Tea',
    'The Coffee House',
    'Trung Nguyên Legend',
    'Căn Tin VKU',
    'Nhà Sách Fahasa',
    'Nhà Sách Phương Nam',
    'Nhà Sách Tiến Thọ',
    'Lotteria',
    'KFC Vietnam',
    'Jollibee',
    'Pizza Hut',
    'FamilyMart',
    'GS25',
    '7-Eleven',
    'Thế Giới Di Động',
    'FPT Shop',
    'CellphoneS',
    'Phong Vũ Computer',
    'Petrolimex',
    'PVOIL',
    'GrabFood / Grab',
    'Be Group',
    'ShopeeFood',
  ];

  /// Dart 3 Record Tuple Parser (Week 7 Slide 13)
  /// Returns lightweight anonymous tuple (merchant, total, date)
  static (String merchant, double total, DateTime date) parseReceiptRecord(
    String rawText,
  ) {
    final res = parse(rawText);
    return (res.merchantName, res.amount, res.dateTime);
  }

  static ParsedReceiptResult parse(String rawText) {
    if (rawText.trim().isEmpty) {
      return ParsedReceiptResult(
        merchantName: 'Hóa Đơn Không Rõ',
        amount: 0.0,
        dateTime: DateTime.now(),
        categoryType: ExpenseCategoryType.other,
        confidenceScore: 0.0,
        rawText: rawText,
      );
    }

    final lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .where((l) => l.isNotEmpty)
        .toList();

    double confidence = 0.0;

    // 1. Extract Merchant Name
    final merchant = _extractMerchant(lines);
    if (merchant != 'Hóa Đơn Bán Lẻ') {
      confidence += 0.35;
    } else {
      confidence += 0.10;
    }

    // 2. Extract Total Amount
    final amountResult = _extractAmount(lines, rawText);
    final amount = amountResult.amount;
    if (amount > 0) {
      confidence += amountResult.isDirectMatch ? 0.45 : 0.25;
    }

    // 3. Extract Date & Time
    final dateTime = _extractDateTime(rawText);
    if (dateTime != null) {
      confidence += 0.20;
    }

    // 4. Auto-classify Category
    final category = ExpenseCategory.matchFromText(rawText);

    // 5. Extract itemized lines
    final detectedItems = _extractLineItems(lines);

    confidence = confidence.clamp(0.1, 0.99);

    return ParsedReceiptResult(
      merchantName: merchant,
      amount: amount,
      dateTime: dateTime ?? DateTime.now(),
      categoryType: category.type,
      confidenceScore: double.parse(confidence.toStringAsFixed(2)),
      detectedItems: detectedItems,
      rawText: rawText,
    );
  }

  static List<String> _extractLineItems(List<String> lines) {
    final itemPattern = RegExp(
      r'^(?:\d+[\.\)]\s*)?([A-Za-zÀ-ỹ0-9\s\(\)\-\+]{3,35})\s+([0-9]{1,3}(?:[.,][0-9]{3})+)\b',
    );
    final List<String> items = [];
    for (final line in lines) {
      final lower = line.toLowerCase();
      if (lower.contains('tổng') ||
          lower.contains('cộng') ||
          lower.contains('tiền mặt') ||
          lower.contains('tiền thừa') ||
          lower.contains('thanh toán') ||
          lower.contains('chuyển khoản')) {
        continue;
      }
      final m = itemPattern.firstMatch(line);
      if (m != null) {
        items.add('${m.group(1)!.trim()} — ${m.group(2)} đ');
      }
    }
    return items;
  }

  static String _extractMerchant(List<String> lines) {
    final fullTextLower = lines.join(' ').toLowerCase();

    for (final brand in _knownMerchants) {
      if (fullTextLower.contains(brand.toLowerCase())) {
        return brand;
      }
    }

    final ignoreWords = [
      'hóa đơn', 'hoa don', 'receipt', 'bill', 'phiếu thanh toán',
      'phiếu tính tiền', 'cộng hòa', 'chi nhánh', 'địa chỉ', 'mst',
      'tel', 'phone', 'ngày', 'thu ngân', 'stt', 'đơn giá', 'sl'
    ];

    for (int i = 0; i < lines.length && i < 4; i++) {
      final line = lines[i];
      final lower = line.toLowerCase();
      bool shouldIgnore = false;
      for (final w in ignoreWords) {
        if (lower.contains(w)) {
          shouldIgnore = true;
          break;
        }
      }
      if (!shouldIgnore && line.length >= 3 && line.length <= 40) {
        return line;
      }
    }

    return 'Hóa Đơn Bán Lẻ';
  }

  static ({double amount, bool isDirectMatch}) _extractAmount(
    List<String> lines,
    String fullText,
  ) {
    final totalPatterns = [
      RegExp(
        r'(?:tổng\s*(?:cộng|tiền|thanh\s*toán)?|tong\s*(?:cong|tien)|thanh\s*toán|thanh\s*toan|tiền\s*mặt|cộng\s*tiền|phải\s*trả|khách\s*trả|total(?:\s*due)?|amount\s*due|grand\s*total)[\s:=-]*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]+)\s*(?:đ|d|vnd|vnđ)?',
        caseSensitive: false,
      ),
      RegExp(
        r'([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:đ|vnd|vnđ)\b',
        caseSensitive: false,
      ),
    ];

    for (final pattern in totalPatterns) {
      for (final line in lines) {
        final match = pattern.firstMatch(line);
        if (match != null) {
          final rawNum = match.group(1);
          if (rawNum != null) {
            final parsed = _parseVietnameseNumber(rawNum);
            if (parsed > 0 && parsed < 1000000000) {
              return (amount: parsed, isDirectMatch: true);
            }
          }
        }
      }
    }

    final numberPattern = RegExp(r'\b([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,8})\b');
    double maxAmount = 0.0;

    for (final line in lines) {
      final matches = numberPattern.allMatches(line);
      for (final m in matches) {
        final str = m.group(1);
        if (str != null) {
          if (str.length >= 10 && !str.contains('.') && !str.contains(',')) {
            continue;
          }
          final val = _parseVietnameseNumber(str);
          if (val >= 1000 && val <= 50000000 && val > maxAmount) {
            maxAmount = val;
          }
        }
      }
    }

    return (amount: maxAmount, isDirectMatch: false);
  }

  static double _parseVietnameseNumber(String input) {
    String clean = input.replaceAll(' ', '').trim();
    if (clean.contains('.') && !clean.contains(',')) {
      clean = clean.replaceAll('.', '');
    } else if (clean.contains(',') && !clean.contains('.')) {
      clean = clean.replaceAll(',', '');
    } else if (clean.contains('.') && clean.contains(',')) {
      if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
        clean = clean.replaceAll('.', '').replaceAll(',', '.');
      } else {
        clean = clean.replaceAll(',', '');
      }
    }

    return double.tryParse(clean) ?? 0.0;
  }

  static DateTime? _extractDateTime(String fullText) {
    final datePattern = RegExp(
      r'\b([0-3]?[0-9])[/\-.]([0-1]?[0-9])[/\-.](20[2-3][0-9]|[2-3][0-9])\b',
    );
    final match = datePattern.firstMatch(fullText);

    if (match != null) {
      final day = int.tryParse(match.group(1) ?? '') ?? 1;
      final month = int.tryParse(match.group(2) ?? '') ?? 1;
      var year = int.tryParse(match.group(3) ?? '') ?? DateTime.now().year;
      if (year < 100) year += 2000;

      final timePattern = RegExp(r'\b([0-2]?[0-9]):([0-5][0-9])\b');
      final timeMatch = timePattern.firstMatch(fullText);
      final hour =
          timeMatch != null ? int.tryParse(timeMatch.group(1) ?? '') ?? 12 : 12;
      final minute =
          timeMatch != null ? int.tryParse(timeMatch.group(2) ?? '') ?? 0 : 0;

      try {
        return DateTime(year, month, day, hour, minute);
      } catch (_) {
        return DateTime.now();
      }
    }

    return null;
  }
}
