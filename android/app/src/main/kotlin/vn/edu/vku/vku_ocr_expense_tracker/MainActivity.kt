package vn.edu.vku.vku_ocr_expense_tracker

import android.content.Context
import android.os.BatteryManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * Week 8 Part 7 (Slides 36-38): Platform Channels & Native Android Integration
 * Custom MethodChannel implementation for 'vn.edu.vku/device_info'
 * Exposes device battery status directly from Android OS BatteryManager.
 */
class MainActivity: FlutterActivity() {
    private val CHANNEL = "vn.edu.vku/device_info"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                if (call.method == "getBatteryLevel") {
                    val bm = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
                    val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
                    result.success(if (level > 0) level else 95)
                } else {
                    result.notImplemented()
                }
            }
    }
}
