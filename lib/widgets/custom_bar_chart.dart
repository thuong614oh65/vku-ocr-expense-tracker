import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CustomBarChart extends StatefulWidget {
  final List<double> weeklyData; // 7 days: T2 to CN

  const CustomBarChart({
    super.key,
    required this.weeklyData,
  });

  @override
  State<CustomBarChart> createState() => _CustomBarChartState();
}

class _CustomBarChartState extends State<CustomBarChart>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutBack,
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant CustomBarChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    _controller.reset();
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          return CustomPaint(
            size: const Size(double.infinity, 200),
            painter: _WeeklyBarChartPainter(
              weeklyData: widget.weeklyData,
              progress: _animation.value,
            ),
          );
        },
      ),
    );
  }
}

class _WeeklyBarChartPainter extends CustomPainter {
  final List<double> weeklyData;
  final double progress;

  _WeeklyBarChartPainter({
    required this.weeklyData,
    required this.progress,
  });

  static const List<String> dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  @override
  void paint(Canvas canvas, Size size) {
    const bottomPadding = 28.0;
    const topPadding = 24.0;
    const sidePadding = 16.0;

    final chartHeight = size.height - bottomPadding - topPadding;
    final chartWidth = size.width - sidePadding * 2;

    double maxVal = weeklyData.isNotEmpty
        ? weeklyData.reduce(math.max)
        : 100000;
    if (maxVal <= 0) maxVal = 100000;

    // Draw horizontal dashed grid lines
    final gridPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    for (int i = 0; i <= 3; i++) {
      final y = topPadding + (chartHeight / 3) * i;
      canvas.drawLine(
        Offset(sidePadding, y),
        Offset(size.width - sidePadding, y),
        gridPaint,
      );
    }

    final barCount = weeklyData.length;
    final slotWidth = chartWidth / barCount;
    final barWidth = math.min(slotWidth * 0.55, 26.0);

    final currencyFormatter = NumberFormat.compact(locale: 'vi');

    for (int i = 0; i < barCount; i++) {
      final xCenter = sidePadding + slotWidth * i + slotWidth / 2;
      final val = weeklyData[i];
      final barHeight = (val / maxVal) * chartHeight * progress;

      final rect = Rect.fromCenter(
        center: Offset(xCenter, topPadding + chartHeight - barHeight / 2),
        width: barWidth,
        height: math.max(barHeight, 4.0),
      );

      final rrect = RRect.fromRectAndRadius(
        rect,
        const Radius.circular(6),
      );

      // Gradient fill
      final isHighest = val == maxVal && val > 0;
      final barPaint = Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: isHighest
              ? [const Color(0xFF0284C7), const Color(0xFF38BDF8)]
              : [const Color(0xFF94A3B8), const Color(0xFFCBD5E1)],
        ).createShader(rect);

      canvas.drawRRect(rrect, barPaint);

      // Value label on top of bar
      if (val > 0 && progress > 0.6) {
        final tpValue = TextPainter(
          text: TextSpan(
            text: currencyFormatter.format(val),
            style: TextStyle(
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
              color: isHighest ? const Color(0xFF0284C7) : const Color(0xFF64748B),
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();

        tpValue.paint(
          canvas,
          Offset(xCenter - tpValue.width / 2, rect.top - tpValue.height - 3),
        );
      }

      // Day label at bottom
      final tpLabel = TextPainter(
        text: TextSpan(
          text: dayLabels[i],
          style: TextStyle(
            fontSize: 11,
            fontWeight: isHighest ? FontWeight.w800 : FontWeight.w600,
            color: isHighest ? const Color(0xFF0284C7) : const Color(0xFF64748B),
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      tpLabel.paint(
        canvas,
        Offset(xCenter - tpLabel.width / 2, size.height - bottomPadding + 6),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _WeeklyBarChartPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.weeklyData != weeklyData;
  }
}
