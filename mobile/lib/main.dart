import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'services/auth_service.dart';
import 'services/profile_service.dart';
import 'services/lead_service.dart';
import 'services/lead_polling_service.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/card_editor/cards_screen.dart';
import 'screens/leads/leads_screen.dart';
import 'screens/qr_scanner/scanner_screen.dart';
import 'screens/settings/settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0D1526),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  await LeadPollingService.initNotifications();
  runApp(const LynQApp());
}

class LynQApp extends StatelessWidget {
  const LynQApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();
    final leadService = LeadService(auth: authService);
    final pollingService = LeadPollingService(
      leadService: leadService,
      authService: authService,
    );

    return MultiProvider(
      providers: [
        Provider<AuthService>(create: (_) => authService),
        Provider<ProfileService>(create: (_) => ProfileService(auth: authService)),
        Provider<LeadService>(create: (_) => leadService),
        ChangeNotifierProvider<LeadPollingService>.value(value: pollingService),
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
          if (loggedIn) {
            // Start polling after login confirmed
            context.read<LeadPollingService>().start();
          }
        },
      );
    }

    if (_isLoggedIn == false) {
      return _showSignup
          ? SignupScreen(
              onSignupSuccess: () => setState(() {
                _isLoggedIn = true;
                _showSignup = false;
                context.read<LeadPollingService>().start();
              }),
              onGoLogin: () => setState(() => _showSignup = false),
            )
          : LoginScreen(
              onLoginSuccess: () {
                setState(() => _isLoggedIn = true);
                context.read<LeadPollingService>().start();
              },
              onGoSignup: () => setState(() => _showSignup = true),
            );
    }

    const screens = [
      CardsScreen(),
      LeadsScreen(),
      _PlaceholderScreen(), // Share FAB slot
      ScannerScreen(),
    ];

    return _AppShell(
      currentTab: _currentTab,
      screens: screens,
      onTabChanged: (i) {
        if (i == 2) {
          _ShareManager.requestShare();
          return;
        }
        if (i == 4) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => SettingsScreen(
                onLogout: () {
                  context.read<LeadPollingService>().stop();
                  Navigator.pop(context);
                  setState(() {
                    _isLoggedIn = false;
                    _currentTab = 0;
                  });
                },
              ),
            ),
          );
          return;
        }
        final screenIdx = i > 2 ? i - 1 : i;
        setState(() => _currentTab = screenIdx);
      },
      onLogout: () {
        context.read<LeadPollingService>().stop();
        setState(() {
          _isLoggedIn = false;
          _currentTab = 0;
        });
      },
    );
  }
}

// ── App shell ─────────────────────────────────────────────────────────────

class _AppShell extends StatelessWidget {
  final int currentTab;
  final List<Widget> screens;
  final void Function(int) onTabChanged;
  final VoidCallback onLogout;

  const _AppShell({
    required this.currentTab,
    required this.screens,
    required this.onTabChanged,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: currentTab.clamp(0, screens.length - 1),
        children: screens,
      ),
      bottomNavigationBar: _PoplNavBar(
        currentIndex: currentTab,
        onTap: onTabChanged,
      ),
    );
  }
}

// ── Custom bottom nav bar with lead badge ─────────────────────────────────

class _PoplNavBar extends StatelessWidget {
  final int currentIndex;
  final void Function(int) onTap;

  const _PoplNavBar({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final newLeadCount = context.watch<LeadPollingService>().newLeadCount;

    return Container(
      decoration: const BoxDecoration(
        color: DarkColors.surface,
        border: Border(top: BorderSide(color: DarkColors.border, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              _navItem(context, 0, Icons.credit_card_outlined, Icons.credit_card, 'Cards'),
              _navItemWithBadge(context, 1, Icons.people_outline, Icons.people, 'Leads', newLeadCount),
              _shareButton(context),
              _navItem(context, 3, Icons.qr_code_scanner_outlined, Icons.qr_code_scanner, 'Scan'),
              _navItem(context, 4, Icons.settings_outlined, Icons.settings, 'Settings'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navItem(BuildContext ctx, int index, IconData icon, IconData activeIcon, String label) {
    final screenIndex = index > 2 ? index - 1 : index;
    final isActive = (index < 2 && currentIndex == screenIndex) ||
        (index == 3 && currentIndex == 2) ||
        (index == 4 && currentIndex == 3);

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onTap(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              size: 22,
              color: isActive ? DarkColors.primary : DarkColors.textMuted,
            ),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? DarkColors.primary : DarkColors.textMuted,
                )),
          ],
        ),
      ),
    );
  }

  Widget _navItemWithBadge(BuildContext ctx, int index, IconData icon,
      IconData activeIcon, String label, int badge) {
    final screenIndex = index > 2 ? index - 1 : index;
    final isActive = currentIndex == screenIndex;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onTap(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  size: 22,
                  color: isActive ? DarkColors.primary : DarkColors.textMuted,
                ),
                if (badge > 0)
                  Positioned(
                    top: -6,
                    right: -8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: DarkColors.error,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        badge > 99 ? '99+' : '$badge',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? DarkColors.primary : DarkColors.textMuted,
                )),
          ],
        ),
      ),
    );
  }

  Widget _shareButton(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onTap(2),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [DarkColors.gradient1, DarkColors.gradient2],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: DarkColors.primary.withAlpha(100),
                    blurRadius: 12,
                    spreadRadius: 0,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(Icons.near_me_outlined, color: Colors.white, size: 22),
            ),
            const SizedBox(height: 2),
            const Text('Share',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: DarkColors.primary)),
          ],
        ),
      ),
    );
  }
}

// ── Placeholder ───────────────────────────────────────────────────────────

class _PlaceholderScreen extends StatelessWidget {
  const _PlaceholderScreen();

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}

// ── Share manager ─────────────────────────────────────────────────────────

class _ShareManager {
  static VoidCallback? _callback;
  static void requestShare() => _callback?.call();
  static void register(VoidCallback cb) => _callback = cb;
  static void unregister() => _callback = null;
}
