import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../services/storage_service.dart';
import '../services/device_info_channel.dart';
import '../state/expense_provider.dart';
import '../widgets/custom_pie_chart.dart';
import '../widgets/custom_bar_chart.dart';

/// Dedicated Reports & CustomPainter Analytics Screen (Week 7 Slide 34 & Week 8 Part 6-7)
class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  int _batteryLevel = 100;

  @override
  void initState() {
    super.initState();
    _loadBattery();
  }

  Future<void> _loadBattery() async {
    final lvl = await DeviceInfoChannel.getBatteryLevel();
    if (mounted) {
      setState(() => _batteryLevel = lvl);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    ref.watch(expenseProvider);

    final storage = StorageService();
    final totalAmount = storage.totalExpense;
    final categoryData = storage.expensesByCategory;
    final weeklyData = storage.weeklyExpenses;

    final currencyFormatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Báo Cáo & Trực Quan Hóa Canvas',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // CustomPainter Donut Chart
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
                        'Phân Bổ Danh Mục (DonutChartPainter)',
                        style: TextStyle(
                            fontSize: 14.5, fontWeight: FontWeight.w800),
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
            const SizedBox(height: 18),

            // CustomPainter Weekly Bar Chart
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
                        'Chi Tiêu 7 Ngày Qua (WeeklyBarChartPainter)',
                        style: TextStyle(
                            fontSize: 14.5, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  CustomBarChart(weeklyData: weeklyData),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Platform Channel Native Interop Info Card (Week 8 Part 7)
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
              child: Row(
                children: [
                  const Icon(Icons.battery_charging_full,
                      color: Color(0xFF10B981), size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Native Platform Channel (vn.edu.vku/device_info)',
                          style: TextStyle(
                              fontSize: 12.5, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Mức pin thiết bị: $_batteryLevel% • Tổng chi: ${currencyFormatter.format(totalAmount)}',
                          style: const TextStyle(
                              fontSize: 11.5, color: Color(0xFF64748B)),
                        ),
                      ],
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
}
