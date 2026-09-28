import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/storage_service.dart';
import '../models/receipt_transaction.dart';
import '../models/expense_category.dart';
import '../widgets/custom_pie_chart.dart';
import '../widgets/custom_bar_chart.dart';
import 'camera_scanner_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final StorageService _storage = StorageService();

  void _refresh() {
    setState(() {});
  }

  Future<void> _openScanner() async {
    final res = await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CameraScannerScreen()),
    );
    if (res == true) {
      _refresh();
    }
  }

  Future<void> _deleteTxn(String id) async {
    await _storage.deleteTransaction(id);
    _refresh();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã xóa giao dịch khỏi sổ chi tiêu')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );

    final transactions = _storage.transactions;
    final totalAmount = _storage.totalExpense;
    final categoryData = _storage.expensesByCategory;
    final weeklyData = _storage.weeklyExpenses;

    const double monthlyBudget = 3500000.0;
    final budgetPercent = (totalAmount / monthlyBudget).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossTransAxisAlignment.start,
          children: const [
            Text(
              'VKU EXPENSE TRACKER',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0284C7),
                letterSpacing: 0.8,
              ),
            ),
            SizedBox(height: 1),
            Text(
              'Quản Lý Chi Tiêu & OCR Hóa Đơn AI',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            tooltip: 'Đặt lại dữ liệu mẫu',
            icon: const Icon(Icons.restart_alt, color: Color(0xFF64748B)),
            onPressed: () async {
              await _storage.resetToSeedData();
              _refresh();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _refresh(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossTransAxisAlignment.start,
            children: [
              // Student Profile Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0284C7).withOpacity(0.25),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      child: const Center(
                        child: Text(
                          'VKU',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossTransAxisAlignment.start,
                        children: const [
                          Text(
                            'Nguyễn Thị Thương • 23IT.B219',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Mini-Project 3 • Flutter 3.x & Google ML Kit On-Device OCR',
                            style: TextStyle(
                              color: Color(0xFFE0F2FE),
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Prominent AI Scan Button Card
              InkWell(
                onTap: _openScanner,
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF0284C7), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0284C7).withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE0F2FE),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: Color(0xFF0284C7),
                          size: 26,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossTransAxisAlignment.start,
                          children: const [
                            Text(
                              '📷 Chụp & Quét Hóa Đơn AI',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(height: 3),
                            Text(
                              'Nhận dạng số tiền, ngày và đơn vị bán lẻ trong sub-100ms offline',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF0284C7)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // KPI Stats Grid
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      title: 'TỔNG CHI THÁNG',
                      value: currencyFormatter.format(totalAmount),
                      subtitle: '${transactions.length} khoản chi',
                      color: const Color(0xFF0284C7),
                      icon: Icons.account_balance_wallet,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: 'NGÂN SÁCH VKU',
                      value: currencyFormatter.format(monthlyBudget),
                      subtitle: 'Đã dùng ${(budgetPercent * 100).toStringAsFixed(1)}%',
                      color: budgetPercent > 0.8
                          ? const Color(0xFFEF4444)
                          : const Color(0xFF10B981),
                      icon: Icons.savings,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Custom Canvas 1: Animated Donut Chart
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossTransAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.pie_chart, color: Color(0xFF0284C7), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Cơ Cấu Chi Tiêu Theo Danh Mục',
                          style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800),
                        ),
                        Spacer(),
                        Text(
                          'CustomPainter',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    CustomPieChart(
                      categoryData: categoryData,
                      totalAmount: totalAmount,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Custom Canvas 2: Weekly Spending Bar Chart
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossTransAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.bar_chart, color: Color(0xFF0284C7), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Biểu Đồ Chi Tiêu 7 Ngày Gần Nhất',
                          style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800),
                        ),
                        Spacer(),
                        Text(
                          'T2 → CN',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    CustomBarChart(weeklyData: weeklyData),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Recent Transactions List
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Giao Dịch Gần Đây',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    '${transactions.length} bản ghi',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (transactions.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Text(
                      'Chưa có hóa đơn nào. Bấm nút Quét ở trên để bắt đầu!',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ),
                )
              else
                ...transactions.take(5).map((txn) => _buildTransactionItem(txn)),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openScanner,
        backgroundColor: const Color(0xFF0284C7),
        icon: const Icon(Icons.camera_alt, color: Colors.white),
        label: const Text(
          'Quét Hóa Đơn AI',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossTransAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: color,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(ReceiptTransaction txn) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: txn.category.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(txn.category.icon, color: txn.category.color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossTransAxisAlignment.start,
              children: [
                Text(
                  txn.merchantName,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${txn.formattedDate} • ${txn.category.displayName.split(' ')[0]}',
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossTransAxisAlignment.end,
            children: [
              Text(
                txn.formattedAmount,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0284C7),
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'AI: ${(txn.confidenceScore * 100).toInt()}%',
                  style: const TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFF94A3B8)),
            onPressed: () => _deleteTxn(txn.id),
          ),
        ],
      ),
    );
  }
}
