import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/dashboard_screen.dart';
import '../screens/camera_scanner_screen.dart';

/// Declarative Routing with GoRouter & ShellRoute (Week 8 Part 4)
final GoRouter appRouter = GoRouter(
  initialLocation: '/dash',
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        final isScanner = state.matchedLocation == '/scanner';
        return Scaffold(
          body: child,
          bottomNavigationBar: NavigationBar(
            selectedIndex: isScanner ? 1 : 0,
            onDestinationSelected: (idx) {
              context.go(idx == 0 ? '/dash' : '/scanner');
            },
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.dashboard_outlined),
                selectedIcon: Icon(Icons.dashboard, color: Color(0xFF0284C7)),
                label: 'Tổng Quan',
              ),
              NavigationDestination(
                icon: Icon(Icons.camera_alt_outlined),
                selectedIcon: Icon(Icons.camera_alt, color: Color(0xFF0284C7)),
                label: 'Quét Hóa Đơn AI',
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
      ],
    ),
  ],
);
