import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../services/auth_service.dart';

class SettingsScreen extends StatelessWidget {
  final VoidCallback onLogout;

  const SettingsScreen({super.key, required this.onLogout});

  Future<void> _openBillingPortal(BuildContext context) async {
    try {
      final auth = context.read<AuthService>();
      final headers = await auth.getAuthHeaders();

      // We call the portal API to get the redirect URL
      // In production, use Dio for this
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/stripe/portal');
      // For now, just open the billing page in browser
      if (await canLaunchUrl(uri)) {
        launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _section('Account', [
            _tile(Icons.person_outline, 'Profile', const Color(0xFF3B82F6), () {}),
            _tile(Icons.credit_card_outlined, 'Billing & Plans', const Color(0xFF8B5CF6), () => _openBillingPortal(context)),
          ]),

          const SizedBox(height: 16),
          _section('Integrations', [
            _tile(Icons.calendar_today_outlined, 'Google Calendar', const Color(0xFF10B981), () {}),
            _tile(Icons.mail_outline, 'Outlook Calendar', const Color(0xFF0EA5E9), () {}),
            _tile(Icons.sync_outlined, 'Odoo CRM Sync', const Color(0xFFF59E0B), () {}, badge: 'Optional'),
          ]),

          const SizedBox(height: 16),
          _section('About', [
            _tile(Icons.info_outline, 'App Version', const Color(0xFF94A3B8), () {}, trailing: const Text('1.0.0', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13))),
            _tile(Icons.privacy_tip_outlined, 'Privacy Policy', const Color(0xFF64748B), () {}),
          ]),

          const SizedBox(height: 24),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFFECACA))),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Color(0xFFEF4444)),
              title: const Text('Sign Out', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w600)),
              onTap: () async {
                final auth = context.read<AuthService>();
                await auth.logout();
                onLogout();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _section(String title, List<Widget> tiles) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8), letterSpacing: 0.5)),
      ),
      Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6)]),
        child: Column(children: tiles.map((t) => t).toList()),
      ),
    ]);
  }

  Widget _tile(IconData icon, String label, Color color, VoidCallback onTap, {Widget? trailing, String? badge}) {
    return ListTile(
      leading: Container(width: 36, height: 36, decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: color, size: 18)),
      title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1E293B))),
      trailing: trailing ?? (badge != null
          ? Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)), child: Text(badge, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w600)))
          : const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1), size: 18)),
      onTap: onTap,
    );
  }
}
