import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../models/expense_category.dart';
import '../models/receipt_transaction.dart';
import '../services/regex_parser_service.dart';
import '../services/storage_service.dart';

class ReceiptReviewScreen extends StatefulWidget {
  final ParsedReceiptResult parsedResult;
  final String? imagePath;

  const ReceiptReviewScreen({
    super.key,
    required this.parsedResult,
    this.imagePath,
  });

  @override
  State<ReceiptReviewScreen> createState() => _ReceiptReviewScreenState();
}

class _ReceiptReviewScreenState extends State<ReceiptReviewScreen> {
  late TextEditingController _merchantController;
  late TextEditingController _amountController;
  late TextEditingController _notesController;
  late DateTime _selectedDate;
  late ExpenseCategoryType _selectedCategory;
  bool _showRawText = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _merchantController = TextEditingController(text: widget.parsedResult.merchantName);
    _amountController = TextEditingController(
      text: widget.parsedResult.amount > 0
          ? widget.parsedResult.amount.toStringAsFixed(0)
          : '',
    );
    _notesController = TextEditingController();
    _selectedDate = widget.parsedResult.dateTime;
    _selectedCategory = widget.parsedResult.categoryType;
  }

  @override
  void dispose() {
    _merchantController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = DateTime(
          picked.year,
          picked.month,
          picked.day,
          _selectedDate.hour,
          _selectedDate.minute,
        );
      });
    }
  }

  Future<void> _saveTransaction() async {
    final merchant = _merchantController.text.trim();
    final amountText = _amountController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final amount = double.tryParse(amountText) ?? 0.0;

    if (merchant.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập tên đơn vị bán lẻ / cửa hàng!')),
      );
      return;
    }

    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập số tiền chi tiêu hợp lệ!')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final txn = ReceiptTransaction(
      id: const Uuid().v4(),
      merchantName: merchant,
      amount: amount,
      dateTime: _selectedDate,
      categoryType: _selectedCategory,
      rawOcrText: widget.parsedResult.rawText,
      receiptImagePath: widget.imagePath,
      notes: _notesController.text.trim(),
      confidenceScore: widget.parsedResult.confidenceScore,
      createdAt: DateTime.now(),
    );

    await StorageService().addTransaction(txn);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã lưu thành công khoản chi ${txn.formattedAmount}!'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final confidencePercent = (widget.parsedResult.confidenceScore * 100).toInt();
    final confidenceColor = confidencePercent >= 80
        ? const Color(0xFF10B981)
        : confidencePercent >= 50
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Kiểm Tra & Lưu Hóa Đơn AI',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossTransAxisAlignment.start,
          children: [
            // AI Confidence Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: confidenceColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: confidenceColor.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.auto_awesome, color: confidenceColor, size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossTransAxisAlignment.start,
                      children: [
                        Text(
                          'Độ Chính Xác Trích Xuất AI: $confidencePercent%',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: confidenceColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Hệ thống Heuristics đã tự động bóc tách số tiền, tên quán và danh mục.',
                          style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Form Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossTransAxisAlignment.start,
                children: [
                  // Merchant Name
                  const Text(
                    'ĐƠN VỊ BÁN HÀNG / TÊN CỬA HÀNG',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _merchantController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.storefront, color: Color(0xFF0284C7)),
                      hintText: 'VD: WinMart+, Highlands Coffee VKU...',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Total Amount
                  const Text(
                    'TỔNG TIỀN THANH TOÁN (VND)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0284C7),
                    ),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.payments, color: Color(0xFF0284C7)),
                      suffixText: '₫',
                      suffixStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      hintText: 'VD: 87500',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Transaction Date
                  const Text(
                    'NGÀY GIAO DỊCH',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  InkWell(
                    onTap: _selectDate,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 20, color: Color(0xFF0284C7)),
                          const SizedBox(width: 10),
                          Text(
                            DateFormat('dd/MM/yyyy • HH:mm').format(_selectedDate),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                          ),
                          const Spacer(),
                          const Text(
                            'Thay đổi',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF0284C7),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Category Selector
                  const Text(
                    'PHÂN LOẠI DANH MỤC CHI TIÊU',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ExpenseCategory.allCategories.map((cat) {
                      final isSelected = _selectedCategory == cat.type;
                      return ChoiceChip(
                        selected: isSelected,
                        avatar: Icon(
                          cat.icon,
                          size: 16,
                          color: isSelected ? Colors.white : cat.color,
                        ),
                        label: Text(cat.displayName.split(' ')[0]),
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : const Color(0xFF334155),
                        ),
                        selectedColor: cat.color,
                        backgroundColor: const Color(0xFFF1F5F9),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedCategory = cat.type);
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Notes
                  const Text(
                    'GHI CHÚ THÊM (TÙY CHỌN)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _notesController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'VD: Ăn trưa cùng nhóm đồ án, mua tập vẽ kỹ thuật...',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Raw OCR Text Accordion
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: ExpansionTile(
                initiallyExpanded: false,
                leading: const Icon(Icons.text_snippet, color: Color(0xFF64748B)),
                title: const Text(
                  'Xem Dữ Liệu Chữ Thô Bóc Tách Bởi AI (OCR Raw)',
                  style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
                ),
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    color: const Color(0xFFF8FAFC),
                    child: Text(
                      widget.parsedResult.rawText.isNotEmpty
                          ? widget.parsedResult.rawText
                          : '(Không có dữ liệu văn bản thô)',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: Color(0xFF334155),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Save Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveTransaction,
                icon: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.check_circle, size: 22),
                label: Text(
                  _isSaving ? 'Đang Lưu...' : 'Xác Nhận & Lưu Vào Sổ Chi Tiêu',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 2,
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
