import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

/// Login & Registration Screen with Form Validation & Ephemeral State (_obscurePassword)
/// (Matches Week 8 Slide 4 "Logged-in user auth, Password shown" & Slide 24 Route Guard "/login")
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoginMode = true;
  bool _obscurePassword = true; // Ephemeral State (Week 8 Slide 4)
  bool _isLoading = false;

  final _emailController =
      TextEditingController(text: 'thuongnt.23itb@vku.udn.vn');
  final _passwordController = TextEditingController(text: 'vku2026');
  final _nameController = TextEditingController();
  final _studentIdController = TextEditingController();
  final _classController = TextEditingController(text: '23SE4');

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _studentIdController.dispose();
    _classController.dispose();
    super.dispose();
  }

  Future<void> _submitAuth() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isLoading = true);

    final auth = AuthService.instance;
    final ({bool success, String message}) res;

    if (_isLoginMode) {
      res = await auth.login(
        email: _emailController.text,
        password: _passwordController.text,
      );
    } else {
      res = await auth.register(
        fullName: _nameController.text,
        studentId: _studentIdController.text,
        className: _classController.text,
        email: _emailController.text,
        password: _passwordController.text,
      );
    }

    if (mounted) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res.message),
          backgroundColor:
              res.success ? const Color(0xFF10B981) : const Color(0xFFEF4444),
        ),
      );
      if (res.success) {
        context.go('/dash');
      }
    }
  }

  Future<void> _signInWithGoogleVku() async {
    setState(() => _isLoading = true);
    await AuthService.instance.loginWithGoogleVku(
      email: 'thuongnt.23itb@vku.udn.vn',
      fullName: 'Nguyễn Thị Thương',
    );
    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/dash');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // VKU Brand Header
                  Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2C4570), Color(0xFF0284C7)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0284C7).withOpacity(0.28),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.document_scanner_rounded,
                      color: Colors.white,
                      size: 36,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'VKU EXPENSE OCR',
                    style: TextStyle(
                      fontSize: 21,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Hệ Thống Quản Lý Chi Tiêu & Nhận Dạng Hóa Đơn AI (ML Kit)',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 22),

                  // Auth Mode Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isDark
                            ? const Color(0xFF334155)
                            : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Form(
                      key: _formKey,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Segmented Toggle: Đăng nhập vs Đăng ký
                          Row(
                            children: [
                              Expanded(
                                child: ChoiceChip(
                                  selected: _isLoginMode,
                                  label: const Center(child: Text('Đăng Nhập')),
                                  onSelected: (_) =>
                                      setState(() => _isLoginMode = true),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: ChoiceChip(
                                  selected: !_isLoginMode,
                                  label: const Center(
                                      child: Text('Đăng Ký Tài Khoản')),
                                  onSelected: (_) =>
                                      setState(() => _isLoginMode = false),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),

                          if (!_isLoginMode) ...[
                            TextFormField(
                              controller: _nameController,
                              decoration: const InputDecoration(
                                labelText: 'Họ và tên sinh viên',
                                prefixIcon: Icon(Icons.person_outline),
                                border: OutlineInputBorder(),
                              ),
                              validator: (v) =>
                                  (v == null || v.trim().length < 3)
                                      ? 'Vui lòng nhập họ và tên'
                                      : null,
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: _studentIdController,
                                    decoration: const InputDecoration(
                                      labelText: 'Mã SV (VD: 23IT.B219)',
                                      prefixIcon: Icon(Icons.badge_outlined),
                                      border: OutlineInputBorder(),
                                    ),
                                    validator: (v) =>
                                        (v == null || v.trim().isEmpty)
                                            ? 'Nhập MSSV'
                                            : null,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: TextFormField(
                                    controller: _classController,
                                    decoration: const InputDecoration(
                                      labelText: 'Lớp / CLB',
                                      prefixIcon: Icon(Icons.groups_outlined),
                                      border: OutlineInputBorder(),
                                    ),
                                    validator: (v) =>
                                        (v == null || v.trim().isEmpty)
                                            ? 'Nhập Lớp'
                                            : null,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                          ],

                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Email sinh viên VKU (@vku.udn.vn)',
                              prefixIcon: Icon(Icons.email_outlined),
                              border: OutlineInputBorder(),
                            ),
                            validator: (v) =>
                                (v == null || !v.contains('@'))
                                    ? 'Vui lòng nhập email hợp lệ'
                                    : null,
                          ),
                          const SizedBox(height: 12),

                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              labelText: 'Mật khẩu',
                              prefixIcon: const Icon(Icons.lock_outline),
                              border: const OutlineInputBorder(),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                ),
                                onPressed: () => setState(
                                    () => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                            validator: (v) => (v == null || v.length < 4)
                                ? 'Mật khẩu tối thiểu 4 ký tự'
                                : null,
                          ),
                          const SizedBox(height: 18),

                          SizedBox(
                            height: 48,
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : _submitAuth,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0284C7),
                                foregroundColor: Colors.white,
                              ),
                              icon: Icon(
                                  _isLoginMode ? Icons.login : Icons.person_add),
                              label: Text(
                                _isLoginMode
                                    ? 'Đăng Nhập Vào Sổ Chi Tiêu'
                                    : 'Tạo Tài Khoản Mới',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),

                          OutlinedButton.icon(
                            onPressed: _isLoading ? null : _signInWithGoogleVku,
                            icon: const Icon(Icons.verified_user_outlined,
                                color: Color(0xFF0284C7)),
                            label: const Text(
                              'Đăng nhập bằng Google VKU (@vku.udn.vn)',
                              style: TextStyle(fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
