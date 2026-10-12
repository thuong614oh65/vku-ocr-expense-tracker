import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_profile.dart';

/// Authentication Service supporting VKU Account Login, Registration & Route Guards
/// (Matches Week 8 Slide 4 "Logged-in user auth" & Slide 24 "AuthService.instance.isAuthenticated")
class AuthService extends ChangeNotifier {
  static final AuthService instance = AuthService._internal();
  factory AuthService() => instance;
  AuthService._internal();

  static const String _sessionKey = 'vku_ocr_active_session_v1';
  static const String _usersKey = 'vku_ocr_registered_users_v1';

  UserProfile? _currentUser;
  final Map<String, Map<String, dynamic>> _accounts = {};

  UserProfile? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawUsers = prefs.getString(_usersKey);
      if (rawUsers != null && rawUsers.isNotEmpty) {
        final Map<String, dynamic> decoded = jsonDecode(rawUsers);
        decoded.forEach((k, v) {
          _accounts[k] = Map<String, dynamic>.from(v as Map);
        });
      }

      // Ensure default VKU student account is registered
      const defaultEmail = 'thuongnt.23itb@vku.udn.vn';
      if (!_accounts.containsKey(defaultEmail)) {
        _accounts[defaultEmail] = {
          'passwordHash': _hashPassword('vku2026'),
          'profile': const UserProfile(
            id: 'usr_23itb219',
            fullName: 'Nguyễn Thị Thương',
            studentId: '23IT.B219',
            className: '23SE4',
            email: defaultEmail,
            role: 'Thủ quỹ CLB & Sinh viên VKU',
            monthlyBudget: 3500000.0,
          ).toMap(),
        };
        await _saveAccounts();
      }

      final rawSession = prefs.getString(_sessionKey);
      if (rawSession != null && rawSession.isNotEmpty) {
        _currentUser = UserProfile.fromMap(
          jsonDecode(rawSession) as Map<String, dynamic>,
        );
      }
    } catch (e) {
      debugPrint('AuthService init error: $e');
    }
  }

  String _hashPassword(String password) {
    final bytes = utf8.encode('VKU_SALT_2026::$password');
    int hash = 0x811c9dc5;
    for (final b in bytes) {
      hash ^= b;
      hash = (hash * 0x01000193) & 0xFFFFFFFF;
    }
    return hash.toRadixString(16).padLeft(8, '0');
  }

  Future<({bool success, String message})> login({
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim().toLowerCase();
    final record = _accounts[normalizedEmail];
    if (record == null) {
      return (
        success: false,
        message: 'Tài khoản chưa được đăng ký. Vui lòng chuyển sang tab Đăng ký!'
      );
    }

    final expectedHash = record['passwordHash'] as String?;
    if (expectedHash != _hashPassword(password)) {
      return (
        success: false,
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!'
      );
    }

    _currentUser = UserProfile.fromMap(
      Map<String, dynamic>.from(record['profile'] as Map),
    );
    await _saveSession();
    notifyListeners();
    return (
      success: true,
      message: 'Chào mừng ${_currentUser!.fullName} (${_currentUser!.studentId})!'
    );
  }

  Future<({bool success, String message})> register({
    required String fullName,
    required String studentId,
    required String className,
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@vku.udn.vn') &&
        !normalizedEmail.contains('@')) {
      return (
        success: false,
        message: 'Vui lòng nhập email hợp lệ (ưu tiên @vku.udn.vn)!'
      );
    }

    if (_accounts.containsKey(normalizedEmail)) {
      return (
        success: false,
        message: 'Email này đã được đăng ký. Vui lòng đăng nhập!'
      );
    }

    final profile = UserProfile(
      id: 'usr_${DateTime.now().millisecondsSinceEpoch}',
      fullName: fullName.trim(),
      studentId: studentId.trim().toUpperCase(),
      className: className.trim().toUpperCase(),
      email: normalizedEmail,
      role: 'Sinh viên / Thủ quỹ CLB VKU',
      monthlyBudget: 3500000.0,
    );

    _accounts[normalizedEmail] = {
      'passwordHash': _hashPassword(password),
      'profile': profile.toMap(),
    };

    _currentUser = profile;
    await _saveAccounts();
    await _saveSession();
    notifyListeners();
    return (
      success: true,
      message: 'Đăng ký thành công tài khoản ${profile.studentId}!'
    );
  }

  Future<void> loginWithGoogleVku({
    required String email,
    required String fullName,
  }) async {
    final normalizedEmail = email.trim().toLowerCase();
    final studentIdMatch =
        RegExp(r'(\d{2}[a-z]{2,3}\d*)', caseSensitive: false)
            .firstMatch(normalizedEmail);
    final extractedStudentId = studentIdMatch != null
        ? studentIdMatch.group(1)!.toUpperCase()
        : '23IT.B219';

    final profile = UserProfile(
      id: 'google_${DateTime.now().millisecondsSinceEpoch}',
      fullName: fullName,
      studentId: extractedStudentId,
      className: '23SE4',
      email: normalizedEmail,
      role: 'Tài khoản Google VKU (@vku.udn.vn)',
      monthlyBudget: 3500000.0,
    );

    _currentUser = profile;
    await _saveSession();
    notifyListeners();
  }

  Future<void> logout() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    notifyListeners();
  }

  Future<void> _saveSession() async {
    final prefs = await SharedPreferences.getInstance();
    if (_currentUser != null) {
      await prefs.setString(_sessionKey, jsonEncode(_currentUser!.toMap()));
    }
  }

  Future<void> _saveAccounts() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_usersKey, jsonEncode(_accounts));
  }
}
