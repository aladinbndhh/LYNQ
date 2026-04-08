import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
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
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0D1526),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
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
        theme: AppTheme.dark,
        darkTheme: AppTheme.dark,
        themeMode: ThemeMode.dark,
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
  bool? _isLoggedIn;
  bool _showSignup = false;
  int _currentTab = 0;

  @override
  Widget build(BuildContext context) {
    if (_isLoggedIn == null) {
      final auth = context.read<AuthService>();
      return SplashScreen(
        authFuture: auth.isLoggedIn(),
        onComplete: (loggedIn) {
          if (mounted) setState(() => _isLoggedIn = loggedIn);
        },
      );
    }

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
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.credit_card_outlined),
            selectedIcon: Icon(Icons.credit_card),
            label: 'Cards',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: 'Leads',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner_outlined),
            selectedIcon: Icon(Icons.qr_code_scanner),
            label: 'Scan',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
