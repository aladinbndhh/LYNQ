import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'services/profile_service.dart';
import 'services/lead_service.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/card_editor/cards_screen.dart';
import 'screens/leads/leads_screen.dart';
import 'screens/qr_scanner/scanner_screen.dart';
import 'screens/settings/settings_screen.dart';

void main() {
  runApp(const LynQApp());
}

class LynQApp extends StatelessWidget {
  const LynQApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();
    return MultiProvider(
      providers: [
        Provider<AuthService>(create: (_) => authService),
        Provider<ProfileService>(create: (_) => ProfileService(auth: authService)),
        Provider<LeadService>(create: (_) => LeadService(auth: authService)),
      ],
      child: MaterialApp(
        title: 'LynQ',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF3B82F6),
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          fontFamily: 'SF Pro Display',
          appBarTheme: const AppBarTheme(
            centerTitle: false,
            titleTextStyle: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1E293B),
            ),
          ),
        ),
        home: const AppRoot(),
      ),
    );
  }
}

class AppRoot extends StatefulWidget {
  const AppRoot({super.key});

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> {
  // null = showing splash, true = logged in, false = logged out
  bool? _isLoggedIn;
  bool _showSignup = false;
  int _currentTab = 0;

  @override
  Widget build(BuildContext context) {
    // Splash screen: passes auth future and handles completion
    if (_isLoggedIn == null) {
      final auth = context.read<AuthService>();
      return SplashScreen(
        authFuture: auth.isLoggedIn(),
        onComplete: (loggedIn) {
          if (mounted) setState(() => _isLoggedIn = loggedIn);
        },
      );
    }

    // Auth screens
    if (_isLoggedIn == false) {
      return _showSignup
          ? SignupScreen(
              onSignupSuccess: () => setState(() {
                _isLoggedIn = true;
                _showSignup = false;
              }),
              onGoLogin: () => setState(() => _showSignup = false),
            )
          : LoginScreen(
              onLoginSuccess: () => setState(() => _isLoggedIn = true),
              onGoSignup: () => setState(() => _showSignup = true),
            );
    }

    // Main app with bottom navigation
    final screens = [
      DashboardScreen(
        onNavigateToCards: () => setState(() => _currentTab = 1),
        onNavigateToLeads: () => setState(() => _currentTab = 2),
        onNavigateToScanner: () => setState(() => _currentTab = 3),
        onNavigateToSettings: () => setState(() => _currentTab = 4),
      ),
      const CardsScreen(),
      const LeadsScreen(),
      const ScannerScreen(),
      SettingsScreen(
        onLogout: () => setState(() {
          _isLoggedIn = false;
          _currentTab = 0;
        }),
      ),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentTab, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentTab,
        onDestinationSelected: (i) => setState(() => _currentTab = i),
        backgroundColor: Colors.white,
        elevation: 0,
        shadowColor: Colors.transparent,
        indicatorColor: const Color(0xFF3B82F6).withOpacity(0.12),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: Color(0xFF3B82F6)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.credit_card_outlined),
            selectedIcon: Icon(Icons.credit_card, color: Color(0xFF3B82F6)),
            label: 'Cards',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people, color: Color(0xFF3B82F6)),
            label: 'Leads',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner_outlined),
            selectedIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF3B82F6)),
            label: 'Scan',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: Color(0xFF3B82F6)),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
