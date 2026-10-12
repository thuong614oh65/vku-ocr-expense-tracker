import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/expense_provider.dart';
import '../services/regex_parser_service.dart';
import 'receipt_review_screen.dart';

/// Dynamic Path Parameter Route: /expense/:id (Week 8 Slide 21-22)
class ExpenseDetailScreen extends ConsumerWidget {
  final String id;

  const ExpenseDetailScreen({
    super.key,
    required this.id,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final transactions = ref.watch(expenseProvider);
    final txnIndex = transactions.indexWhere((t) => t.id == id);

    if (txnIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi Tiết Hóa Đơn')),
        body: const Center(child: Text('Không tìm thấy hóa đơn này.')),
      );
    }

    final txn = transactions[txnIndex];
    final category = txn.category;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Chi Tiết Hóa Đơn OCR',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
        actions: [
          IconButton(
            tooltip: 'Chỉnh sửa hóa đơn',
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ReceiptReviewScreen(
                    parsedResult: ParsedReceiptResult(
                      merchantName: txn.merchantName,
                      amount: txn.amount,
                      dateTime: txn.dateTime,
                      categoryType: txn.categoryType,
                      confidenceScore: txn.confidenceScore,
                      rawText: txn.rawOcrText,
                    ),
                    imagePath: txn.receiptImagePath,
                  ),
                ),
              );
            },
          ),
          IconButton(
            tooltip: 'Xóa hóa đơn',
            icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444)),
            onPressed: () async {
              await ref.read(expenseProvider.notifier).removeExpense(txn.id);
              if (context.mounted) {
                Navigator.of(context).pop();
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: category.color.withOpacity(0.15),
                    child: Icon(category.icon, color: category.color, size: 28),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    txn.merchantName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    txn.formattedAmount,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0284C7),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Chip(
                    label: Text(
                      '${category.displayName} • Độ tin cậy OCR ${(txn.confidenceScore * 100).toInt()}%',
                      style: const TextStyle(
                          fontSize: 11.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                  const Divider(height: 28),
                  _buildRow('Mã giao dịch (UUID)', txn.id),
                  const SizedBox(height: 8),
                  _buildRow(
                      'Thời gian giao dịch', '${txn.formattedDate} • ${txn.formattedTime}'),
                  if (txn.notes.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _buildRow('Ghi chú', txn.notes),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'VĂN BẢN THÔ BÓC TÁCH BỞI GOOGLE ML KIT OCR',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    txn.rawOcrText.isNotEmpty
                        ? txn.rawOcrText
                        : '(Hóa đơn nhập thủ công)',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}
