import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../services/auth_service.dart';
import '../../widgets/google_auth_widgets.dart';
import '../../theme/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  final VoidCallback onLogout;
  const SettingsScreen({super.key, required this.onLogout});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _googleLoading = false;

  Future<void> _openBillingPortal() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/stripe/portal');
      if (await canLaunchUrl(uri)) {
        launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: DarkColors.error),
        );
      }
    }
  }

  Future<void> _connectGoogle() async {
    setState(() => _googleLoading = true);
    try {
      await context.read<AuthService>().loginWithGoogle();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Google account connected!'),
            backgroundColor: DarkColors.success,
          ),
        );
      }
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      if (mounted && msg != 'Google sign-in cancelled') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: DarkColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DarkColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
        content: const Text('Are you sure you want to sign out?', style: TextStyle(color: DarkColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: DarkColors.textSecondary))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Sign Out', style: TextStyle(color: DarkColors.error))),
        ],
      ),
    );
    if (confirm != true) return;
    if (!mounted) return;
    await context.read<AuthService>().logout();
    widget.onLogout();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionLabel('ACCOUNT'),
          _settingsCard([
            _tile(Icons.person_outline, 'Profile', const Color(0xFF6366F1), () {}),
            _divider(),
            _tile(Icons.credit_card_outlined, 'Billing & Plans', const Color(0xFF8B5CF6), _openBillingPortal),
          ]),
          const SizedBox(height: 20),

          _sectionLabel('CONNECTED ACCOUNTS'),
          _settingsCard([
            Padding(
              padding: const EdgeInsets.all(16),
              child: GoogleSignInButton(loading: _googleLoading, onTap: _connectGoogle),
            ),
          ]),
          const SizedBox(height: 20),

          _sectionLabel('INTEGRATIONS'),
          _settingsCard([
            _tile(Icons.calendar_today_outlined, 'Google Calendar', DarkColors.success, () {}),
            _divider(),
            _tile(Icons.mail_outline, 'Outlook Calendar', DarkColors.info, () {}),
            _divider(),
            _tile(Icons.sync_outlined, 'Odoo CRM', DarkColors.warning, () {}, badge: 'Optional'),
          ]),
          const SizedBox(height: 20),

          _sectionLabel('ABOUT'),
          _settingsCard([
            _tile(Icons.info_outline, 'App Version', DarkColors.textMuted, () {},
                trailing: const Text('1.0.0', style: TextStyle(color: DarkColors.textMuted, fontSize: 13))),
            _divider(),
            _tile(Icons.privacy_tip_outlined, 'Privacy Policy', DarkColors.textMuted, () {}),
          ]),
          const SizedBox(height: 28),

          // Sign Out
          GestureDetector(
            onTap: _logout,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: DarkColors.error.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: DarkColors.error.withOpacity(0.25)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.logout, color: DarkColors.error, size: 18),
                  SizedBox(width: 10),
                  Text('Sign Out', style: TextStyle(color: DarkColors.error, fontWeight: FontWeight.w700, fontSize: 15)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        text,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: DarkColors.textMuted, letterSpacing: 1.2),
      ),
    );
  }

  Widget _settingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: DarkColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DarkColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _divider() {
    return const Divider(height: 1, indent: 16, endIndent: 0, color: DarkColors.border);
  }

  Widget _tile(IconData icon, String label, Color color, VoidCallback onTap, {Widget? trailing, String? badge}) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: color, size: 18),
      ),
      title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: DarkColors.textPrimary)),
      trailing: trailing ??
          (badge != null
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: DarkColors.elevated,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: DarkColors.border),
                  ),
                  child: Text(badge, style: const TextStyle(fontSize: 10, color: DarkColors.textMuted, fontWeight: FontWeight.w600)),
                )
              : const Icon(Icons.chevron_right, color: DarkColors.border, size: 18)),
    );
  }
}
