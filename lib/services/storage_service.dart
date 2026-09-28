import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/receipt_transaction.dart';
import '../models/expense_category.dart';
import 'mock_receipts_service.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  static const String _storageKey = 'vku_ocr_expenses_v1';
  List<ReceiptTransaction> _transactions = [];

  List<ReceiptTransaction> get transactions => List.unmodifiable(_transactions);

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawJson = prefs.getString(_storageKey);

      if (rawJson != null && rawJson.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(rawJson);
        _transactions = decoded
            .map((item) => ReceiptTransaction.fromMap(item as Map<String, dynamic>))
            .toList();
      } else {
        // Khởi tạo dữ liệu mẫu ban đầu
        _transactions = MockReceiptsService.getInitialSeedTransactions();
        await _saveToStorage();
      }
    } catch (e) {
      debugPrint('Lỗi khởi tạo lưu trữ: $e');
      _transactions = MockReceiptsService.getInitialSeedTransactions();
    }
  }

  Future<void> addTransaction(ReceiptTransaction txn) async {
    _transactions.insert(0, txn);
    await _saveToStorage();
  }

  Future<void> updateTransaction(ReceiptTransaction txn) async {
    final idx = _transactions.indexWhere((t) => t.id == txn.id);
    if (idx != -1) {
      _transactions[idx] = txn;
      await _saveToStorage();
    }
  }

  Future<void> deleteTransaction(String id) async {
    _transactions.removeWhere((t) => t.id == id);
    await _saveToStorage();
  }

  Future<void> resetToSeedData() async {
    _transactions = MockReceiptsService.getInitialSeedTransactions();
    await _saveToStorage();
  }

  double get totalExpense {
    return _transactions.fold(0.0, (sum, item) => sum + item.amount);
  }

  Map<ExpenseCategoryType, double> get expensesByCategory {
    final Map<ExpenseCategoryType, double> map = {};
    for (final type in ExpenseCategoryType.values) {
      map[type] = 0.0;
    }
    for (final txn in _transactions) {
      map[txn.categoryType] = (map[txn.categoryType] ?? 0.0) + txn.amount;
    }
    return map;
  }

  /// Tổng chi tiêu 7 ngày gần nhất (Thứ 2 -> Chủ Nhật)
  List<double> get weeklyExpenses {
    final List<double> dailyTotals = List.filled(7, 0.0);
    final now = DateTime.now();

    for (final txn in _transactions) {
      final diffDays = now.difference(txn.dateTime).inDays;
      if (diffDays >= 0 && diffDays < 7) {
        final dayIndex = (txn.dateTime.weekday - 1) % 7;
        dailyTotals[dayIndex] += txn.amount;
      }
    }

    return dailyTotals;
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_transactions.map((t) => t.toMap()).toList());
      await prefs.setString(_storageKey, encoded);
    } catch (e) {
      debugPrint('Lỗi lưu trữ dữ liệu cục bộ: $e');
    }
  }
}
