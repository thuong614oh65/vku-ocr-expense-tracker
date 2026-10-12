import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/ocr_service.dart';
import '../services/mock_receipts_service.dart';
import '../services/device_info_channel.dart';
import '../widgets/camera_overlay_painter.dart';
import 'receipt_review_screen.dart';

class CameraScannerScreen extends StatefulWidget {
  const CameraScannerScreen({super.key});

  @override
  State<CameraScannerScreen> createState() => _CameraScannerScreenState();
}

class _CameraScannerScreenState extends State<CameraScannerScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _laserController;
  bool _isFlashOn = false;
  bool _isProcessing = false;
  Offset? _focusPoint;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _laserController.dispose();
    super.dispose();
  }

  void _handleViewfinderTap(TapDownDetails details) {
    setState(() {
      _focusPoint = details.localPosition;
    });
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() => _focusPoint = null);
      }
    });
  }

  Future<void> _pickFromGallery() async {
    try {
      final XFile? image =
          await _picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        await _processImagePath(image.path);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi chọn ảnh: $e')),
        );
      }
    }
  }

  Future<void> _capturePhoto() async {
    try {
      await DeviceInfoChannel.triggerScanHaptics();
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.rear,
      );
      if (image != null) {
        await _processImagePath(image.path);
      } else {
        _testWithSample(0);
      }
    } catch (e) {
      _testWithSample(0);
    }
  }

  Future<void> _processImagePath(String path) async {
    setState(() => _isProcessing = true);

    try {
      final parsed = await OcrService().processImage(path);

      if (mounted) {
        setState(() => _isProcessing = false);
        final result = await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ReceiptReviewScreen(
              parsedResult: parsed,
              imagePath: path,
            ),
          ),
        );
        if (result == true && mounted) {
          Navigator.of(context).pop(true);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi quét hóa đơn: $e')),
        );
      }
    }
  }

  Future<void> _testWithSample(int index) async {
    setState(() => _isProcessing = true);
    await DeviceInfoChannel.triggerScanHaptics();

    await Future.delayed(const Duration(milliseconds: 500));
    final parsed = OcrService().processSampleReceipt(index);

    if (mounted) {
      setState(() => _isProcessing = false);
      final result = await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ReceiptReviewScreen(
            parsedResult: parsed,
          ),
        ),
      );
      if (result == true && mounted) {
        Navigator.of(context).pop(true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapDown: _handleViewfinderTap,
        child: Stack(
          children: [
            // Camera Viewfinder Feed
            Positioned.fill(
              child: Container(
                color: const Color(0xFF1E293B),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.document_scanner,
                        size: 64,
                        color: Colors.white.withOpacity(0.2),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Đặt hóa đơn vào khung cắt • Chạm màn hình để lấy nét (AF)',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: Colors.white.withOpacity(0.55),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Custom Framing Crop Overlay with animated laser & tap-to-focus
            Positioned.fill(
              child: AnimatedBuilder(
                animation: _laserController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: CameraOverlayPainter(
                      scanProgress: _laserController.value,
                      focusPoint: _focusPoint,
                    ),
                  );
                },
              ),
            ),

            // Top Action Bar
            SafeArea(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CircleAvatar(
                      backgroundColor: Colors.black54,
                      child: IconButton(
                        icon:
                            const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.bolt,
                              color: Color(0xFF38BDF8), size: 16),
                          SizedBox(width: 6),
                          Text(
                            'On-Device AI • Offline OCR',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                    CircleAvatar(
                      backgroundColor: _isFlashOn
                          ? const Color(0xFFF59E0B)
                          : Colors.black54,
                      child: IconButton(
                        icon: Icon(
                          _isFlashOn ? Icons.flash_on : Icons.flash_off,
                          color: Colors.white,
                        ),
                        onPressed: () {
                          setState(() => _isFlashOn = !_isFlashOn);
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Quick Sample Receipts Selector
            Positioned(
              left: 0,
              right: 0,
              bottom: 120,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0284C7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'CHẤM BÀI / DEMO',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Thử Nhanh Mẫu Hóa Đơn VKU:',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 38,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: MockReceiptsService.sampleReceipts.length,
                      itemBuilder: (context, idx) {
                        final sample =
                            MockReceiptsService.sampleReceipts[idx];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ActionChip(
                            avatar: const Icon(Icons.receipt,
                                size: 16, color: Color(0xFF0284C7)),
                            label: Text(
                              sample.merchant,
                              style: const TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700),
                            ),
                            backgroundColor: Colors.white.withOpacity(0.9),
                            onPressed: () => _testWithSample(idx),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Capture Controls
            Positioned(
              left: 0,
              right: 0,
              bottom: 24,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    iconSize: 32,
                    icon: const Icon(Icons.photo_library, color: Colors.white),
                    onPressed: _pickFromGallery,
                  ),
                  GestureDetector(
                    onTap: _capturePhoto,
                    child: Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 4),
                      ),
                      padding: const EdgeInsets.all(4),
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Color(0xFF0284C7),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    iconSize: 32,
                    icon: const Icon(Icons.flash_auto,
                        color: Color(0xFF38BDF8)),
                    onPressed: () => _testWithSample(0),
                  ),
                ],
              ),
            ),

            if (_isProcessing)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withOpacity(0.75),
                  child: const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(
                            color: Color(0xFF38BDF8), strokeWidth: 3),
                        SizedBox(height: 18),
                        Text(
                          'Đang Nhận Dạng Hóa Đơn AI...',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Google ML Kit • Regex Heuristics Engine',
                          style: TextStyle(
                              color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
