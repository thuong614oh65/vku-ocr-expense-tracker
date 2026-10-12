import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app_theme.dart';
import 'core/app_router.dart';
import 'services/auth_service.dart';
import 'services/storage_service.dart';
import 'state/expense_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthService.instance.init();
  await StorageService().init();
  runApp(
    const ProviderScope(
      child: VkuOcrExpenseTrackerApp(),
    ),
  );
}

class VkuOcrExpenseTrackerApp extends ConsumerWidget {
  const VkuOcrExpenseTrackerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'VKU Expense OCR',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: appRouter,
    );
  }
}
