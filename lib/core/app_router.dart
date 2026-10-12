import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../screens/login_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/camera_scanner_screen.dart';
import '../screens/reports_screen.dart';
import '../screens/expense_detail_screen.dart';

/// Declarative Routing with GoRouter, ShellRoute & Route Guards (Week 8 Part 4 Slides 19-24)
final GoRouter appRouter = GoRouter(
  initialLocation: '/dash',
  refreshListenable: AuthService.instance,
  redirect: (BuildContext context, GoRouterState state) {
    final bool isLoggedIn = AuthService.instance.isAuthenticated;
    final bool isLoggingIn = state.matchedLocation == '/login';

    // 1. If not logged in and not on login page, force redirect to /login
    if (!isLoggedIn && !isLoggingIn) return '/login';

    // 2. If logged in and attempting to access /login, redirect to home
    if (isLoggedIn && isLoggingIn) return '/dash';

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/expense/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ExpenseDetailScreen(id: id);
      },
    ),
    ShellRoute(
      builder: (context, state, child) {
        final loc = state.matchedLocation;
        final int selectedIndex = loc == '/scanner'
            ? 1
            : loc == '/reports'
                ? 2
                : 0;

        return Scaffold(
          body: child,
          bottomNavigationBar: NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: (idx) {
              if (idx == 0) context.go('/dash');
              if (idx == 1) context.go('/scanner');
              if (idx == 2) context.go('/reports');
            },
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.receipt_long_outlined),
                selectedIcon:
                    Icon(Icons.receipt_long, color: Color(0xFF0284C7)),
                label: 'Sổ Chi Tiêu',
              ),
              NavigationDestination(
                icon: Icon(Icons.camera_alt_outlined),
                selectedIcon: Icon(Icons.camera_alt, color: Color(0xFF0284C7)),
                label: 'Quét OCR',
              ),
              NavigationDestination(
                icon: Icon(Icons.pie_chart_outline),
                selectedIcon: Icon(Icons.pie_chart, color: Color(0xFF0284C7)),
                label: 'Báo Cáo',
              ),
            ],
          ),
        );
      },
      routes: [
        GoRoute(
          path: '/dash',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/scanner',
          builder: (context, state) => const CameraScannerScreen(),
        ),
        GoRoute(
          path: '/reports',
          builder: (context, state) => const ReportsScreen(),
        ),
      ],
    ),
  ],
);
