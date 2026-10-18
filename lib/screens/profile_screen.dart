import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../services/device_info_channel.dart';
import '../providers/theme_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _showAccountSwitcher(BuildContext context) {
    final auth = AuthService.instance;
    final savedProfiles = auth.savedProfiles;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Quản Lý & Đổi Tài Khoản',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const Divider(),
                if (savedProfiles.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text('Không có tài khoản lưu nào khác trên máy.',
                        style: TextStyle(fontSize: 13, color: Colors.grey)),
                  )
                else ...[
                  const Text('Chọn tài khoản để đổi:',
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  ...savedProfiles.map((p) => ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFF0284C7),
                          child: Text(
                            p.fullName.isNotEmpty
                                ? p.fullName.substring(0, 1)
                                : 'U',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(p.fullName,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13)),
                        subtitle: Text('${p.studentId} • ${p.email}',
                            style: const TextStyle(fontSize: 11)),
                        trailing: ElevatedButton(
                          onPressed: () async {
                            Navigator.pop(ctx);
                            await auth.switchToProfile(p);
                          },
                          child: const Text('Chọn',
                              style: TextStyle(fontSize: 12)),
                        ),
                      )),
                  const SizedBox(height: 10),
                ],
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.add),
                        label: const Text('Thêm Tài Khoản'),
                        onPressed: () async {
                          Navigator.pop(ctx);
                          await auth.logout();
                          if (context.mounted) context.go('/login');
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFEF4444)),
                        icon: const Icon(Icons.logout, color: Colors.white),
                        label: const Text('Đăng Xuất',
                            style: TextStyle(color: Colors.white)),
                        onPressed: () async {
                          Navigator.pop(ctx);
                          await auth.logout();
                          if (context.mounted) context.go('/login');
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = AuthService.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Hồ Sơ & Trang Cá Nhân',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
        ),
        actions: [
          IconButton(
            tooltip: 'Đổi giao diện Sáng / Tối',
            icon: Icon(
              isDark ? Icons.light_mode : Icons.dark_mode_outlined,
              color: const Color(0xFF0284C7),
            ),
            onPressed: () {
              ref.read(themeModeProvider.notifier).toggleTheme();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Hero Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF0284C7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0284C7).withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Center(
                      child: Text(
                        'TT',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.22),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'SINH VIÊN VKU',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const Spacer(),
                            FutureBuilder<int>(
                              future: DeviceInfoChannel.getBatteryLevel(),
                              builder: (context, snapshot) {
                                final level = snapshot.data ?? 96;
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.25),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: Colors.white38),
                                  ),
                                  child: Text(
                                    '🔋 Pin: $level%',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          user?.fullName ?? 'Nguyễn Thị Thương',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16.5,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${user?.studentId ?? "23IT.B219"} • Lớp ${user?.className ?? "23SE4"}',
                          style: const TextStyle(
                            color: Color(0xFFE0F2FE),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Email: ${user?.email ?? "thuongnt.23itb@vku.udn.vn"}',
                          style: const TextStyle(
                            color: Color(0xFFBAE6FD),
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'GVHD: TS. Nguyễn Thanh Tuấn',
                          style: TextStyle(
                            color: Color(0xFFBAE6FD),
                            fontSize: 11,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Profile Quick Actions Card List
            Text(
              'QUẢN LÝ TÀI KHOẢN & HỆ THỐNG',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),

            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFFE0F2FE),
                      child: Icon(Icons.switch_account_rounded,
                          color: Color(0xFF0284C7)),
                    ),
                    title: const Text('Đổi Tài Khoản Sinh Viên',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13.5)),
                    subtitle: const Text(
                        'Chuyển đổi giữa các tài khoản lưu trên thiết bị',
                        style: TextStyle(fontSize: 11.5)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _showAccountSwitcher(context),
                  ),
                  const Divider(height: 1, indent: 56),
                  ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFFEFF6FF),
                      child: Icon(Icons.palette_outlined,
                          color: Color(0xFF2563EB)),
                    ),
                    title: const Text('Chế Độ Giao Diện (Material 3)',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13.5)),
                    subtitle: Text(
                        isDark ? 'Đang bật Giao diện Tối (Dark Mode)' : 'Đang bật Giao diện Sáng (Light Mode)',
                        style: const TextStyle(fontSize: 11.5)),
                    trailing: Switch(
                      value: isDark,
                      onChanged: (_) {
                        ref.read(themeModeProvider.notifier).toggleTheme();
                      },
                    ),
                  ),
                  const Divider(height: 1, indent: 56),
                  ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFFFEF2F2),
                      child: Icon(Icons.logout_rounded,
                          color: Color(0xFFEF4444)),
                    ),
                    title: const Text('Đăng Xuất Khỏi Thiết Bị',
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13.5,
                            color: Color(0xFFEF4444))),
                    subtitle: const Text(
                        'Xóa phiên làm việc hiện tại an toàn',
                        style: TextStyle(fontSize: 11.5)),
                    trailing: const Icon(Icons.chevron_right,
                        color: Color(0xFFEF4444)),
                    onTap: () async {
                      await AuthService.instance.logout();
                      if (context.mounted) {
                        context.go('/login');
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Diagnostic & Technical Rubric Info Card
            Text(
              'THÔNG TIN KỸ THUẬT & HỆ THỐNG',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),

            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  children: [
                    _buildTechRow(
                      'Học phần',
                      'Phát triển ứng dụng di động đa nền tảng (4)',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'Mã sinh viên (MSSV)',
                      user?.studentId ?? '23IT.B219',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'Họ và tên',
                      user?.fullName ?? 'Nguyễn Thị Thương',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'Lớp sinh hoạt',
                      user?.className ?? '23SE4',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'MethodChannel',
                      'vn.edu.vku/device_info',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'AI OCR Engine',
                      'Google ML Kit Text Recognition',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'Cơ sở dữ liệu',
                      'SQLite (sqflite CRUD persistent)',
                    ),
                    const Divider(height: 16),
                    _buildTechRow(
                      'State Management',
                      'Flutter Riverpod 2 (NotifierProvider)',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTechRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w600)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}
