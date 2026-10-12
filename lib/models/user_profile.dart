class UserProfile {
  final String id;
  final String fullName;
  final String studentId;
  final String className;
  final String email;
  final String role;
  final double monthlyBudget;

  const UserProfile({
    required this.id,
    required this.fullName,
    required this.studentId,
    required this.className,
    required this.email,
    this.role = 'Sinh viên / Thủ quỹ CLB VKU',
    this.monthlyBudget = 3500000.0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'fullName': fullName,
      'studentId': studentId,
      'className': className,
      'email': email,
      'role': role,
      'monthlyBudget': monthlyBudget,
    };
  }

  factory UserProfile.fromMap(Map<String, dynamic> map) {
    return UserProfile(
      id: (map['id'] as String?) ?? 'usr_default',
      fullName: (map['fullName'] as String?) ?? 'Nguyễn Thị Thương',
      studentId: (map['studentId'] as String?) ?? '23IT.B219',
      className: (map['className'] as String?) ?? '23SE4',
      email: (map['email'] as String?) ?? 'thuongnt.23itb@vku.udn.vn',
      role: (map['role'] as String?) ?? 'Sinh viên / Thủ quỹ CLB VKU',
      monthlyBudget: (map['monthlyBudget'] as num?)?.toDouble() ?? 3500000.0,
    );
  }
}
