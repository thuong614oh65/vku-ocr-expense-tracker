import 'package:flutter/services.dart';

/// Platform Channel Service (Week 8 Part 7: MethodChannel)
/// Communicates with Android (Kotlin MainActivity) & iOS (Swift AppDelegate)
class DeviceInfoChannel {
  static const MethodChannel _platform = MethodChannel('vn.edu.vku/device_info');

  static Future<int> getBatteryLevel() async {
    try {
      final int? result = await _platform.invokeMethod<int>('getBatteryLevel');
      return result ?? 100;
    } on PlatformException {
      return 100;
    } catch (_) {
      return 100;
    }
  }

  static Future<void> triggerScanHaptics() async {
    try {
      await HapticFeedback.mediumImpact();
    } catch (_) {}
  }
}
