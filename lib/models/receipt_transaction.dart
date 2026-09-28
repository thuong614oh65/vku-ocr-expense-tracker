import 'package:intl/intl.dart';
import 'expense_category.dart';

class ReceiptTransaction {
  final String id;
  final String merchantName;
  final double amount;
  final DateTime dateTime;
  final ExpenseCategoryType categoryType;
  final String rawOcrText;
  final String? receiptImagePath;
  final String notes;
  final double confidenceScore; // 0.0 to 1.0
  final DateTime createdAt;

  const ReceiptTransaction({
    required this.id,
    required this.merchantName,
    required this.amount,
    required this.dateTime,
    required this.categoryType,
    this.rawOcrText = '',
    this.receiptImagePath,
    this.notes = '',
    this.confidenceScore = 0.85,
    required this.createdAt,
  });

  ExpenseCategory get category => ExpenseCategory.fromType(categoryType);

  String get formattedAmount {
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  String get formattedDate {
    return DateFormat('dd/MM/yyyy').format(dateTime);
  }

  String get formattedTime {
    return DateFormat('HH:mm').format(dateTime);
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'merchantName': merchantName,
      'amount': amount,
      'dateTime': dateTime.toIso8601String(),
      'categoryType': categoryType.name,
      'rawOcrText': rawOcrText,
      'receiptImagePath': receiptImagePath,
      'notes': notes,
      'confidenceScore': confidenceScore,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory ReceiptTransaction.fromMap(Map<String, dynamic> map) {
    return ReceiptTransaction(
      id: map['id'] as String,
      merchantName: (map['merchantName'] as String?)?.isNotEmpty == true
          ? map['merchantName'] as String
          : 'Hóa Đơn Bán Lẻ',
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      dateTime: map['dateTime'] != null
          ? DateTime.tryParse(map['dateTime'] as String) ?? DateTime.now()
          : DateTime.now(),
      categoryType: ExpenseCategoryType.values.firstWhere(
        (e) => e.name == map['categoryType'],
        orElse: () => ExpenseCategoryType.other,
      ),
      rawOcrText: (map['rawOcrText'] as String?) ?? '',
      receiptImagePath: map['receiptImagePath'] as String?,
      notes: (map['notes'] as String?) ?? '',
      confidenceScore: (map['confidenceScore'] as num?)?.toDouble() ?? 0.85,
      createdAt: map['createdAt'] != null
          ? DateTime.tryParse(map['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  ReceiptTransaction copyWith({
    String? id,
    String? merchantName,
    double? amount,
    DateTime? dateTime,
    ExpenseCategoryType? categoryType,
    String? rawOcrText,
    String? receiptImagePath,
    String? notes,
    double? confidenceScore,
    DateTime? createdAt,
  }) {
    return ReceiptTransaction(
      id: id ?? this.id,
      merchantName: merchantName ?? this.merchantName,
      amount: amount ?? this.amount,
      dateTime: dateTime ?? this.dateTime,
      categoryType: categoryType ?? this.categoryType,
      rawOcrText: rawOcrText ?? this.rawOcrText,
      receiptImagePath: receiptImagePath ?? this.receiptImagePath,
      notes: notes ?? this.notes,
      confidenceScore: confidenceScore ?? this.confidenceScore,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
