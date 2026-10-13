import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../services/auth_service.dart';
import '../services/ocr_service.dart';
import '../services/storage_service.dart';
import '../state/expense_provider.dart';
import '../models/expense_category.dart';
import '../widgets/custom_pie_chart.dart';
import '../widgets/custom_bar_chart.dart';
import '../widgets/expense_summary_card.dart';
import 'camera_scanner_screen.dart';
import 'receipt_review_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final StorageService _storage = StorageService();
  final ImagePicker _picker = ImagePicker();

  bool _isDesktopPlatform(BuildContext context) {
    final p = Theme.of(context).platform;
    return p == TargetPlatform.windows ||
        p == TargetPlatform.macOS ||
        p == TargetPlatform.linux;
  }

  Future<void> _openScanner() async {
    if (_isDesktopPlatform(context)) {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null && mounted) {
        final parsed = await OcrService().processImage(image.path);
        if (mounted) {
          final saved = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => ReceiptReviewScreen(
                parsedResult: parsed,
                imagePath: image.path,
              ),
            ),
          );
          if (saved == true && mounted) setState(() {});
        }
      }
      return;
    }

    final res = await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CameraScannerScreen()),
    );
    if (res == true && mounted) {
      setState(() {});
    }
  }

  Future<void> _deleteTxn(String id) async {
    await ref.read(expenseProvider.notifier).removeExpense(id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã xóa giao dịch khỏi sổ chi tiêu')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = AuthService.instance.currentUser;
    final currencyFormatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );

    final allTransactions = ref.watch(expenseProvider);
    final selectedCat = ref.watch(categoryFilterProvider);
    final transactions = selectedCat == null
        ? allTransactions
        : allTransactions.where((t) => t.categoryType == selectedCat).toList();

    final totalAmount = _storage.totalExpense;
    final categoryData = _storage.expensesByCategory;
    final weeklyData = _storage.weeklyExpenses;

    final double monthlyBudget = user?.monthlyBudget ?? 3500000.0;
    final budgetPercent = (totalAmount / monthlyBudget).clamp(0.0, 1.0);

    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'VKU EXPENSE OCR',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0284C7),
                letterSpacing: 0.8,
              ),
            ),
            SizedBox(height: 1),
            Text(
              'Sổ Chi Tiêu & Hóa Đơn AI',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip:
                isDark ? 'Chế độ Sáng (Light Mode)' : 'Chế độ Tối (Dark Mode)',
            icon: Icon(
              isDark ? Icons.light_mode : Icons.dark_mode_outlined,
              color: const Color(0xFF0284C7),
            ),
            onPressed: () {
              ref.read(themeModeProvider.notifier).toggleTheme();
            },
          ),
          IconButton(
            tooltip: 'Đăng xuất tài khoản',
            icon: const Icon(Icons.logout, color: Color(0xFFEF4444)),
            onPressed: () async {
              await AuthService.instance.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => setState(() {}),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logged-in User Profile Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2C4570), Color(0xFF0284C7)],
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
                        child: Icon(Icons.verified_user,
                            color: Colors.white, size: 22),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${user?.fullName ?? "Nguyễn Thị Thương"} • ${user?.studentId ?? "23IT.B219"}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${user?.email ?? "thuongnt.23itb@vku.udn.vn"} • Lớp ${user?.className ?? "23SE4"}',
                            style: const TextStyle(
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

              // Prominent AI Scan / Upload Button Card (Adaptive: Desktop File Picker vs Mobile Camera)
              InkWell(
                onTap: _openScanner,
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: const Color(0xFF0284C7), width: 1.5),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE0F2FE),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          _isDesktopPlatform(context)
                              ? Icons.upload_file
                              : Icons.camera_alt,
                          color: const Color(0xFF0284C7),
                          size: 26,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isDesktopPlatform(context)
                                  ? '📁 Chọn Ảnh Hóa Đơn Từ Máy Tính'
                                  : '📷 Chụp & Quét Hóa Đơn AI',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              _isDesktopPlatform(context)
                                  ? 'Tải file ảnh hóa đơn (.JPG, .PNG) • Bóc tách AI dưới 100ms'
                                  : 'Google ML Kit On-Device OCR • Bóc tách tự động dưới 100ms',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios,
                        size: 16,
                        color: Color(0xFF0284C7),
                      ),
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
                      subtitle: '${allTransactions.length} hóa đơn đã lưu',
                      color: const Color(0xFF0284C7),
                      icon: Icons.account_balance_wallet,
                      isDark: isDark,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      title: 'NGÂN SÁCH THÁNG',
                      value: currencyFormatter.format(monthlyBudget),
                      subtitle:
                          'Đã dùng ${(budgetPercent * 100).toStringAsFixed(1)}%',
                      color: budgetPercent > 0.8
                          ? const Color(0xFFEF4444)
                          : const Color(0xFF10B981),
                      icon: Icons.savings,
                      isDark: isDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Custom Canvas 1: Animated Donut Chart
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
                    const Row(
                      children: [
                        Icon(Icons.pie_chart,
                            color: Color(0xFF0284C7), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Cơ Cấu Chi Tiêu Theo Danh Mục',
                          style: TextStyle(
                              fontSize: 14.5, fontWeight: FontWeight.w800),
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
                    const Row(
                      children: [
                        Icon(Icons.bar_chart,
                            color: Color(0xFF0284C7), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Biểu Đồ Chi Tiêu 7 Ngày Gần Nhất',
                          style: TextStyle(
                              fontSize: 14.5, fontWeight: FontWeight.w800),
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

              // Category Filter Bar
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    FilterChip(
                      selected: selectedCat == null,
                      label: const Text('Tất cả'),
                      onSelected: (_) => ref
                          .read(categoryFilterProvider.notifier)
                          .selectCategory(null),
                    ),
                    const SizedBox(width: 8),
                    ...ExpenseCategory.allCategories.map(
                      (cat) => Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: FilterChip(
                          selected: selectedCat == cat.type,
                          avatar: Icon(cat.icon, size: 15, color: cat.color),
                          label: Text(cat.displayName.split(' ')[0]),
                          onSelected: (_) => ref
                              .read(categoryFilterProvider.notifier)
                              .selectCategory(cat.type),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Recent Transactions List
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Danh Sách Hóa Đơn Đã Lưu (SQLite)',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    '${transactions.length} bản ghi',
                    style: const TextStyle(
                        fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (transactions.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Text(
                      'Chưa có hóa đơn nào. Bấm nút Quét ở trên để bắt đầu!',
                      style:
                          TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: transactions.length,
                  itemBuilder: (context, index) {
                    final txn = transactions[index];
                    return ExpenseSummaryCard(
                      key: ValueKey(txn.id),
                      transaction: txn,
                      onTap: () => context.push('/expense/${txn.id}'),
                      onDelete: () => _deleteTxn(txn.id),
                    );
                  },
                ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openScanner,
        backgroundColor: const Color(0xFF0284C7),
        icon: Icon(
          _isDesktopPlatform(context) ? Icons.upload_file : Icons.camera_alt,
          color: Colors.white,
        ),
        label: Text(
          _isDesktopPlatform(context) ? 'Chọn Ảnh Hóa Đơn' : 'Scan Receipt',
          style:
              const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
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
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
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
}
