import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../models/profile_model.dart';
import '../../services/profile_service.dart';

class CardsScreen extends StatefulWidget {
  const CardsScreen({super.key});

  @override
  State<CardsScreen> createState() => _CardsScreenState();
}

class _CardsScreenState extends State<CardsScreen> {
  List<ProfileModel> _profiles = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProfiles();
  }

  Future<void> _loadProfiles() async {
    setState(() { _loading = true; _error = null; });
    try {
      final service = context.read<ProfileService>();
      final profiles = await service.listProfiles();
      if (mounted) setState(() { _profiles = profiles; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _loading = false; });
    }
  }

  Future<void> _deleteProfile(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Card'),
        content: const Text('This will permanently delete the card and its QR code.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await context.read<ProfileService>().deleteProfile(id);
      setState(() => _profiles.removeWhere((p) => p.id == id));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return const Color(0xFF3B82F6);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Cards', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const _CardEditorScreen())).then((_) => _loadProfiles()),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6)))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Color(0xFFEF4444))))
              : _profiles.isEmpty
                  ? _emptyState()
                  : RefreshIndicator(
                      onRefresh: _loadProfiles,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _profiles.length,
                        itemBuilder: (ctx, i) => _profileCard(_profiles[i]),
                      ),
                    ),
      floatingActionButton: _profiles.isNotEmpty
          ? FloatingActionButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const _CardEditorScreen())).then((_) => _loadProfiles()),
              backgroundColor: const Color(0xFF3B82F6),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.credit_card_outlined, size: 72, color: Color(0xFFCBD5E1)),
        const SizedBox(height: 16),
        const Text('No cards yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
        const SizedBox(height: 8),
        const Text('Create your first digital business card', style: TextStyle(color: Color(0xFF94A3B8))),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const _CardEditorScreen())).then((_) => _loadProfiles()),
          icon: const Icon(Icons.add),
          label: const Text('Create Card'),
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF3B82F6), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        ),
      ]),
    );
  }

  Widget _profileCard(ProfileModel profile) {
    final color = _parseColor(profile.branding.primaryColor);
    final cardUrl = ApiConfig.publicCardUrl(profile.username);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4), width: 1.5),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cover
          Container(height: 70, decoration: BoxDecoration(
            gradient: LinearGradient(colors: [color, color.withOpacity(0.7)]),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
          )),

          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Avatar + QR row
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Transform.translate(
                  offset: const Offset(0, -28),
                  child: CircleAvatar(
                    radius: 32,
                    backgroundColor: color,
                    child: Text(profile.displayName.isNotEmpty ? profile.displayName[0].toUpperCase() : '?',
                      style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                  ),
                ),
                GestureDetector(
                  onTap: () => _showQrDialog(profile.username, color),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                    child: Icon(Icons.qr_code, color: color, size: 28),
                  ),
                ),
              ]),

              Text(profile.displayName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
              if (profile.title.isNotEmpty) Text(profile.title, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
              if (profile.company.isNotEmpty) Text(profile.company, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),

              const SizedBox(height: 12),

              // Action buttons
              Row(children: [
                _cardBtn(Icons.visibility_outlined, 'Preview', onTap: () async {
                  final uri = Uri.parse(cardUrl);
                  if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
                }),
                const SizedBox(width: 8),
                _cardBtn(Icons.share_outlined, 'Share', onTap: () => Share.share(cardUrl, subject: '${profile.displayName}\'s Digital Card')),
                const SizedBox(width: 8),
                _cardBtn(Icons.edit_outlined, 'Edit', color: color, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => _CardEditorScreen(profile: profile))).then((_) => _loadProfiles())),
                const SizedBox(width: 8),
                _cardBtn(Icons.delete_outline, '', isDestructive: true, onTap: () => _deleteProfile(profile.id!)),
              ]),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _cardBtn(IconData icon, String label, {VoidCallback? onTap, Color? color, bool isDestructive = false}) {
    if (label.isEmpty) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(8)),
          child: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 18),
        ),
      );
    }
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: color != null ? color.withOpacity(0.1) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(icon, size: 14, color: color ?? const Color(0xFF64748B)),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color ?? const Color(0xFF64748B))),
          ]),
        ),
      ),
    );
  }

  void _showQrDialog(String username, Color color) {
    final cardUrl = ApiConfig.publicCardUrl(username);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          QrImageView(data: cardUrl, version: QrVersions.auto, size: 200, eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: color)),
          const SizedBox(height: 12),
          Text(cardUrl, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: OutlinedButton.icon(icon: const Icon(Icons.copy, size: 16), label: const Text('Copy Link'), onPressed: () { Clipboard.setData(ClipboardData(text: cardUrl)); Navigator.pop(ctx); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Link copied!'))); })),
            const SizedBox(width: 8),
            Expanded(child: ElevatedButton.icon(icon: const Icon(Icons.share, size: 16), label: const Text('Share'), style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white), onPressed: () { Share.share(cardUrl); Navigator.pop(ctx); })),
          ]),
        ]),
      ),
    );
  }
}

class _CardEditorScreen extends StatefulWidget {
  final ProfileModel? profile;
  const _CardEditorScreen({this.profile});

  @override
  State<_CardEditorScreen> createState() => _CardEditorScreenState();
}

class _CardEditorScreenState extends State<_CardEditorScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _usernameCtrl;
  late final TextEditingController _titleCtrl;
  late final TextEditingController _companyCtrl;
  late final TextEditingController _bioCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _phoneCtrl;
  late String _primaryColor;
  late String _theme;
  bool _saving = false;
  String? _error;

  final _themes = ['light', 'dark', 'gradient', 'glass', 'neon'];
  final _colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#1e293b'];

  @override
  void initState() {
    super.initState();
    final p = widget.profile;
    _nameCtrl = TextEditingController(text: p?.displayName ?? '');
    _usernameCtrl = TextEditingController(text: p?.username ?? '');
    _titleCtrl = TextEditingController(text: p?.title ?? '');
    _companyCtrl = TextEditingController(text: p?.company ?? '');
    _bioCtrl = TextEditingController(text: p?.bio ?? '');
    _emailCtrl = TextEditingController(text: p?.contactInfo.email ?? '');
    _phoneCtrl = TextEditingController(text: p?.contactInfo.phone ?? '');
    _primaryColor = p?.branding.primaryColor ?? '#3b82f6';
    _theme = p?.branding.theme ?? 'light';
  }

  @override
  void dispose() {
    for (final c in [_nameCtrl, _usernameCtrl, _titleCtrl, _companyCtrl, _bioCtrl, _emailCtrl, _phoneCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  Color _parseColor(String hex) {
    try { return Color(int.parse(hex.replaceFirst('#', '0xFF'))); } catch (_) { return const Color(0xFF3B82F6); }
  }

  Future<void> _save() async {
    if (_nameCtrl.text.isEmpty || _usernameCtrl.text.isEmpty) {
      setState(() => _error = 'Name and username are required');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final service = context.read<ProfileService>();
      final profile = ProfileModel(
        id: widget.profile?.id,
        username: _usernameCtrl.text.trim(),
        displayName: _nameCtrl.text.trim(),
        title: _titleCtrl.text.trim(),
        company: _companyCtrl.text.trim(),
        bio: _bioCtrl.text.trim(),
        branding: BrandingModel(primaryColor: _primaryColor, theme: _theme),
        contactInfo: ContactInfoModel(email: _emailCtrl.text.trim(), phone: _phoneCtrl.text.trim()),
      );
      if (widget.profile?.id != null) {
        await service.updateProfile(widget.profile!.id!, profile);
      } else {
        await service.createProfile(profile);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _parseColor(_primaryColor);
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(widget.profile == null ? 'New Card' : 'Edit Card', style: const TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF3B82F6)))
                : const Text('Save', style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w700, fontSize: 16)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          if (_error != null) Container(
            width: double.infinity, margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
            child: Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
          ),

          _section('Profile Info', [
            _field('Display Name *', _nameCtrl),
            if (widget.profile == null) _field('Username (URL slug) *', _usernameCtrl),
            _field('Job Title', _titleCtrl),
            _field('Company', _companyCtrl),
            _field('Bio', _bioCtrl, maxLines: 3),
          ]),
          const SizedBox(height: 16),

          _section('Contact', [
            _field('Email', _emailCtrl, keyboardType: TextInputType.emailAddress),
            _field('Phone', _phoneCtrl, keyboardType: TextInputType.phone),
          ]),
          const SizedBox(height: 16),

          // Theme selector
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Theme', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
              const SizedBox(height: 12),
              Wrap(spacing: 8, runSpacing: 8, children: _themes.map((t) {
                final selected = _theme == t;
                return GestureDetector(
                  onTap: () => setState(() => _theme = t),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? color.withOpacity(0.12) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? color : const Color(0xFFE2E8F0), width: selected ? 2 : 1),
                    ),
                    child: Text(t[0].toUpperCase() + t.substring(1), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: selected ? color : const Color(0xFF64748B))),
                  ),
                );
              }).toList()),
            ]),
          ),
          const SizedBox(height: 16),

          // Color picker
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Brand Color', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
              const SizedBox(height: 12),
              Wrap(spacing: 10, runSpacing: 10, children: _colors.map((c) {
                final selected = _primaryColor == c;
                return GestureDetector(
                  onTap: () => setState(() => _primaryColor = c),
                  child: Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      color: _parseColor(c),
                      shape: BoxShape.circle,
                      border: Border.all(color: selected ? Colors.white : Colors.transparent, width: 3),
                      boxShadow: selected ? [BoxShadow(color: _parseColor(c), blurRadius: 8)] : null,
                    ),
                    child: selected ? const Icon(Icons.check, color: Colors.white, size: 16) : null,
                  ),
                );
              }).toList()),
            ]),
          ),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }

  Widget _section(String title, List<Widget> fields) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
        const SizedBox(height: 12),
        ...fields.map((f) => Padding(padding: const EdgeInsets.only(bottom: 12), child: f)),
      ]),
    );
  }

  Widget _field(String label, TextEditingController ctrl, {TextInputType? keyboardType, int maxLines = 1}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
      const SizedBox(height: 4),
      TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        maxLines: maxLines,
        decoration: InputDecoration(
          filled: true, fillColor: const Color(0xFFF8FAFC),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          isDense: true,
        ),
      ),
    ]);
  }
}
