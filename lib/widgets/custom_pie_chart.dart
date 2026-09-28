import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/expense_category.dart';

class CustomPieChart extends StatefulWidget {
  final Map<ExpenseCategoryType, double> categoryData;
  final double totalAmount;

  const CustomPieChart({
    super.key,
    required this.categoryData,
    required this.totalAmount,
  });

  @override
  State<CustomPieChart> createState() => _CustomPieChartState();
}

class _CustomPieChartState extends State<CustomPieChart>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant CustomPieChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.totalAmount != widget.totalAmount) {
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );

    return Column(
      children: [
        SizedBox(
          height: 220,
          child: AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              return CustomPaint(
                size: const Size(220, 220),
                painter: _DonutChartPainter(
                  categoryData: widget.categoryData,
                  totalAmount: widget.totalAmount,
                  progress: _animation.value,
                ),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'TỔNG CHI TIÊU',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF64748B),
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currencyFormatter.format(widget.totalAmount * _animation.value),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        // Legend
        _buildLegend(),
      ],
    );
  }

  Widget _buildLegend() {
    final currencyFormatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );

    final validCategories = ExpenseCategory.allCategories.where((cat) {
      final amount = widget.categoryData[cat.type] ?? 0.0;
      return amount > 0;
    }).toList();

    if (validCategories.isEmpty) {
      return const Text(
        'Chưa có dữ liệu chi tiêu',
        style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
      );
    }

    return Wrap(
      spacing: 12,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: validCategories.map((cat) {
        final amount = widget.categoryData[cat.type] ?? 0.0;
        final percentage = widget.totalAmount > 0
            ? (amount / widget.totalAmount * 100).toStringAsFixed(1)
            : '0';

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: cat.color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: cat.color.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: cat.color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '${cat.displayName.split(' ')[0]}: $percentage% (${currencyFormatter.format(amount)})',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: cat.color.withOpacity(0.9),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _DonutChartPainter extends CustomPainter {
  final Map<ExpenseCategoryType, double> categoryData;
  final double totalAmount;
  final double progress;

  _DonutChartPainter({
    required this.categoryData,
    required this.totalAmount,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;
    const strokeWidth = 28.0;

    // Draw background track
    final trackPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius - strokeWidth / 2, trackPaint);

    if (totalAmount <= 0) return;

    double startAngle = -math.pi / 2; // Start from 12 o'clock

    for (final cat in ExpenseCategory.allCategories) {
      final amount = categoryData[cat.type] ?? 0.0;
      if (amount <= 0) continue;

      final sweepAngle = (amount / totalAmount) * 2 * math.pi * progress;

      final slicePaint = Paint()
        ..color = cat.color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.butt;

      final rect = Rect.fromCircle(
        center: center,
        radius: radius - strokeWidth / 2,
      );

      canvas.drawArc(rect, startAngle, sweepAngle, false, slicePaint);
      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutChartPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.totalAmount != totalAmount ||
        oldDelegate.categoryData != categoryData;
  }
}
