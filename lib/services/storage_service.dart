import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';
import '../models/receipt_transaction.dart';
import '../models/expense_category.dart';
import 'mock_receipts_service.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  static const String _storageKey = 'vku_ocr_expenses_v2';
  static const String _dbName = 'vku_expense_ocr.db';
  static const String _tableName = 'transactions';

  Database? _db;
  List<ReceiptTransaction> _transactions = [];

  List<ReceiptTransaction> get transactions => List.unmodifiable(_transactions);

  Future<void> init() async {
    try {
      if (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
        await _initSqliteDb();
      } else {
        await _initPrefsFallback();
      }
    } catch (e) {
      debugPrint('Fallback to SharedPreferences storage: $e');
      await _initPrefsFallback();
    }
  }

  Future<void> _initSqliteDb() async {
    final dbPath = await getDatabasesPath();
    final fullPath = p.join(dbPath, _dbName);

    _db = await openDatabase(
      fullPath,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE $_tableName (
            id TEXT PRIMARY KEY,
            merchantName TEXT NOT NULL,
            amount REAL NOT NULL,
            dateTime TEXT NOT NULL,
            categoryType TEXT NOT NULL,
            rawOcrText TEXT,
            receiptImagePath TEXT,
            notes TEXT,
            confidenceScore REAL,
            createdAt TEXT NOT NULL
          )
        ''');
      },
    );

    final rows = await _db!.query(_tableName, orderBy: 'dateTime DESC');
    if (rows.isNotEmpty) {
      _transactions = rows.map((r) => ReceiptTransaction.fromMap(r)).toList();
    } else {
      _transactions = MockReceiptsService.getInitialSeedTransactions();
      for (final txn in _transactions) {
        await _db!.insert(
          _tableName,
          txn.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }
  }

  Future<void> _initPrefsFallback() async {
    final prefs = await SharedPreferences.getInstance();
    final rawJson = prefs.getString(_storageKey);

    if (rawJson != null && rawJson.isNotEmpty) {
      final List<dynamic> decoded = jsonDecode(rawJson);
      _transactions = decoded
          .map((item) => ReceiptTransaction.fromMap(item as Map<String, dynamic>))
          .toList();
    } else {
      _transactions = MockReceiptsService.getInitialSeedTransactions();
      await _saveToPrefs();
    }
  }

  /// Cache receipt thumbnail in application storage directory
  Future<String?> cacheReceiptThumbnail(String? sourcePath, String txnId) async {
    if (sourcePath == null || sourcePath.isEmpty || kIsWeb) return sourcePath;
    try {
      final sourceFile = File(sourcePath);
      if (!await sourceFile.exists()) return sourcePath;

      final appDir = await getApplicationDocumentsDirectory();
      final thumbDir = Directory(p.join(appDir.path, 'receipt_thumbnails'));
      if (!await thumbDir.exists()) {
        await thumbDir.create(recursive: true);
      }

      final ext = p.extension(sourcePath).isNotEmpty ? p.extension(sourcePath) : '.jpg';
      final targetPath = p.join(thumbDir.path, 'thumb_$txnId$ext');
      await sourceFile.copy(targetPath);
      return targetPath;
    } catch (e) {
      debugPrint('Could not cache receipt thumbnail: $e');
      return sourcePath;
    }
  }

  Future<void> addTransaction(ReceiptTransaction txn) async {
    final cachedPath = await cacheReceiptThumbnail(txn.receiptImagePath, txn.id);
    final savedTxn = txn.copyWith(receiptImagePath: cachedPath);

    _transactions.insert(0, savedTxn);
    if (_db != null) {
      await _db!.insert(
        _tableName,
        savedTxn.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await _saveToPrefs();
  }

  Future<void> updateTransaction(ReceiptTransaction txn) async {
    final idx = _transactions.indexWhere((t) => t.id == txn.id);
    if (idx != -1) {
      _transactions[idx] = txn;
      if (_db != null) {
        await _db!.update(
          _tableName,
          txn.toMap(),
          where: 'id = ?',
          whereArgs: [txn.id],
        );
      }
      await _saveToPrefs();
    }
  }

  Future<void> deleteTransaction(String id) async {
    _transactions.removeWhere((t) => t.id == id);
    if (_db != null) {
      await _db!.delete(_tableName, where: 'id = ?', whereArgs: [id]);
    }
    await _saveToPrefs();
  }

  Future<void> resetToSeedData() async {
    _transactions = MockReceiptsService.getInitialSeedTransactions();
    if (_db != null) {
      await _db!.delete(_tableName);
      for (final txn in _transactions) {
        await _db!.insert(
          _tableName,
          txn.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }
    await _saveToPrefs();
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

  Future<void> _saveToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_transactions.map((t) => t.toMap()).toList());
      await prefs.setString(_storageKey, encoded);
    } catch (e) {
      debugPrint('Lỗi lưu trữ dữ liệu cục bộ: $e');
    }
  }
}
