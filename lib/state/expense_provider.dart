import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/expense_category.dart';
import '../models/receipt_transaction.dart';
import '../services/storage_service.dart';

/// Riverpod 2 Compile-Safe State Management (Week 8 Part 3)
class ExpenseController extends Notifier<List<ReceiptTransaction>> {
  @override
  List<ReceiptTransaction> build() {
    return StorageService().transactions;
  }

  Future<void> addExpense(ReceiptTransaction item) async {
    await StorageService().addTransaction(item);
    state = [...StorageService().transactions];
  }

  Future<void> updateExpense(ReceiptTransaction item) async {
    await StorageService().updateTransaction(item);
    state = [...StorageService().transactions];
  }

  Future<void> removeExpense(String id) async {
    await StorageService().deleteTransaction(id);
    state = [...StorageService().transactions];
  }

  Future<void> resetToSeedData() async {
    await StorageService().resetToSeedData();
    state = [...StorageService().transactions];
  }
}

final expenseProvider =
    NotifierProvider<ExpenseController, List<ReceiptTransaction>>(
  ExpenseController.new,
);

/// ThemeMode Notifier for Material 3 Light / Dark Mode
class ThemeModeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.light;

  void toggleTheme() {
    state = state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
  }
}

final themeModeProvider = NotifierProvider<ThemeModeController, ThemeMode>(
  ThemeModeController.new,
);

/// Category Filter Notifier
class CategoryFilterController extends Notifier<ExpenseCategoryType?> {
  @override
  ExpenseCategoryType? build() => null;

  void selectCategory(ExpenseCategoryType? type) {
    state = state == type ? null : type;
  }
}

final categoryFilterProvider =
    NotifierProvider<CategoryFilterController, ExpenseCategoryType?>(
  CategoryFilterController.new,
);
