import 'package:flutter/material.dart';

class CameraOverlayPainter extends CustomPainter {
  final double scanProgress; // 0.0 to 1.0

  const CameraOverlayPainter({
    required this.scanProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw darkened backdrop outside scanning rectangle
    const frameWidthRatio = 0.85;
    const frameHeightRatio = 0.65;

    final frameWidth = size.width * frameWidthRatio;
    final frameHeight = size.height * frameHeightRatio;
    final frameLeft = (size.width - frameWidth) / 2;
    final frameTop = (size.height - frameHeight) / 2 - 20;

    final frameRect = Rect.fromLTWH(frameLeft, frameTop, frameWidth, frameHeight);

    final backgroundPaint = Paint()
      ..color = Colors.black.withOpacity(0.55)
      ..style = PaintingStyle.fill;

    // Use path with difference to punch a hole
    final backgroundPath = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(RRect.fromRectAndRadius(frameRect, const Radius.circular(16)))
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(backgroundPath, backgroundPaint);

    // 2. Draw 4 Glowing Corner Brackets
    final cornerPaint = Paint()
      ..color = const Color(0xFF0284C7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round;

    const cornerLength = 32.0;
    const cornerRadius = 16.0;

    // Top-Left
    canvas.drawPath(
      Path()
        ..moveTo(frameLeft, frameTop + cornerLength)
        ..lineTo(frameLeft, frameTop + cornerRadius)
        ..quadraticBezierTo(frameLeft, frameTop, frameLeft + cornerRadius, frameTop)
        ..lineTo(frameLeft + cornerLength, frameTop),
      cornerPaint,
    );

    // Top-Right
    canvas.drawPath(
      Path()
        ..moveTo(frameLeft + frameWidth - cornerLength, frameTop)
        ..lineTo(frameLeft + frameWidth - cornerRadius, frameTop)
        ..quadraticBezierTo(
            frameLeft + frameWidth, frameTop, frameLeft + frameWidth, frameTop + cornerRadius)
        ..lineTo(frameLeft + frameWidth, frameTop + cornerLength),
      cornerPaint,
    );

    // Bottom-Left
    canvas.drawPath(
      Path()
        ..moveTo(frameLeft, frameTop + frameHeight - cornerLength)
        ..lineTo(frameLeft, frameTop + frameHeight - cornerRadius)
        ..quadraticBezierTo(
            frameLeft, frameTop + frameHeight, frameLeft + cornerRadius, frameTop + frameHeight)
        ..lineTo(frameLeft + cornerLength, frameTop + frameHeight),
      cornerPaint,
    );

    // Bottom-Right
    canvas.drawPath(
      Path()
        ..moveTo(frameLeft + frameWidth - cornerLength, frameTop + frameHeight)
        ..lineTo(frameLeft + frameWidth - cornerRadius, frameTop + frameHeight)
        ..quadraticBezierTo(frameLeft + frameWidth, frameTop + frameHeight,
            frameLeft + frameWidth, frameTop + frameHeight - cornerRadius)
        ..lineTo(frameLeft + frameWidth, frameTop + frameHeight - cornerLength),
      cornerPaint,
    );

    // 3. Draw Animated Scanning Laser
    final laserY = frameTop + frameHeight * scanProgress;
    final laserPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          const Color(0xFF0284C7).withOpacity(0.0),
          const Color(0xFF38BDF8),
          const Color(0xFF0284C7).withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(frameLeft + 10, laserY - 1, frameWidth - 20, 2))
      ..strokeWidth = 2.5;

    canvas.drawLine(
      Offset(frameLeft + 12, laserY),
      Offset(frameLeft + frameWidth - 12, laserY),
      laserPaint,
    );

    // Laser glow gradient underneath
    final glowPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          const Color(0xFF0284C7).withOpacity(0.25),
          const Color(0xFF0284C7).withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(frameLeft + 12, laserY, frameWidth - 20, 30));

    canvas.drawRect(
      Rect.fromLTWH(frameLeft + 12, laserY, frameWidth - 20, 20),
      glowPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CameraOverlayPainter oldDelegate) {
    return oldDelegate.scanProgress != scanProgress;
  }
}
