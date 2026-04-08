import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../models/profile_model.dart';
import '../../services/profile_service.dart';
import '../../theme/app_theme.dart';

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
      final profiles = await context.read<ProfileService>().listProfiles();
      if (mounted) setState(() { _profiles = profiles; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _loading = false; });
    }
  }

  Future<void> _deleteProfile(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DarkColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Card', style: TextStyle(color: DarkColors.textPrimary, fontWeight: FontWeight.w700)),
        content: const Text('This will permanently delete the card and its QR code.', style: TextStyle(color: DarkColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: DarkColors.textSecondary))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: DarkColors.error))),
        ],
      ),
    );
    if (confirm != true) return;
    if (!mounted) return;
    final service = context.read<ProfileService>();
    try {
      await service.deleteProfile(id);
      if (mounted) setState(() => _profiles.removeWhere((p) => p.id == id));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: DarkColors.error),
        );
      }
    }
  }

  Color _parseColor(String hex) {
    try { return Color(int.parse(hex.replaceFirst('#', '0xFF'))); } catch (_) { return DarkColors.primary; }
  }

  void _openEditor({ProfileModel? profile}) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => _CardEditorScreen(profile: profile)))
        .then((_) => _loadProfiles());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cards'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: () => _openEditor(),
              child: Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [DarkColors.gradient1, DarkColors.gradient2]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 20),
              ),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DarkColors.primary, strokeWidth: 2))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: DarkColors.error)))
              : _profiles.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      color: DarkColors.primary,
                      backgroundColor: DarkColors.surface,
                      onRefresh: _loadProfiles,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _profiles.length,
                        itemBuilder: (ctx, i) => _buildProfileCard(_profiles[i]),
                      ),
                    ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 80, height: 80,
          decoration: BoxDecoration(
            color: DarkColors.elevated,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: DarkColors.border),
          ),
          child: const Icon(Icons.credit_card_outlined, size: 36, color: DarkColors.textMuted),
        ),
        const SizedBox(height: 20),
        const Text('No cards yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
        const SizedBox(height: 6),
        const Text('Create your first digital business card', style: TextStyle(color: DarkColors.textSecondary, fontSize: 14)),
        const SizedBox(height: 28),
        ElevatedButton.icon(
          onPressed: () => _openEditor(),
          icon: const Icon(Icons.add, size: 18),
          label: const Text('Create Card'),
        ),
      ]),
    );
  }

  Widget _buildProfileCard(ProfileModel profile) {
    final color = _parseColor(profile.branding.primaryColor);
    final cardUrl = ApiConfig.publicCardUrl(profile.username);
    final hasBanner = profile.branding.bannerUrl != null && profile.branding.bannerUrl!.isNotEmpty;
    final hasLogo = profile.branding.logo != null && profile.branding.logo!.isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: DarkColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Banner / cover strip ───────────────────────────────
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: hasBanner
                ? Image.network(
                    profile.branding.bannerUrl!,
                    height: 90,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _defaultBanner(color),
                  )
                : _defaultBanner(color),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                // Avatar / company logo
                Transform.translate(
                  offset: const Offset(0, -24),
                  child: Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: DarkColors.bg, width: 3),
                    ),
                    child: hasLogo
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(11),
                            child: Image.network(profile.branding.logo!, fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _avatarFallback(profile.displayName, color)))
                        : _avatarFallback(profile.displayName, color),
                  ),
                ),
                // QR code button
                GestureDetector(
                  onTap: () => _showQrDialog(profile.username, color),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: color.withOpacity(0.25)),
                    ),
                    child: Icon(Icons.qr_code, color: color, size: 22),
                  ),
                ),
              ]),

              // Name + title — offset compensates avatar lift
              Transform.translate(
                offset: const Offset(0, -10),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(profile.displayName, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
                  if (profile.title.isNotEmpty)
                    Text(profile.title, style: const TextStyle(fontSize: 13, color: DarkColors.textSecondary)),
                  if (profile.company.isNotEmpty)
                    Text(profile.company, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
                ]),
              ),

              // Action buttons
              Row(children: [
                _actionBtn('Preview', Icons.visibility_outlined, color: DarkColors.textSecondary,
                    onTap: () async {
                      final uri = Uri.parse(cardUrl);
                      if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
                    }),
                const SizedBox(width: 8),
                _actionBtn('Share', Icons.share_outlined, color: DarkColors.textSecondary,
                    onTap: () => Share.share(cardUrl, subject: "${profile.displayName}'s Digital Card")),
                const SizedBox(width: 8),
                _actionBtn('Edit', Icons.edit_outlined, color: color,
                    onTap: () => _openEditor(profile: profile)),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _deleteProfile(profile.id!),
                  child: Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: DarkColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.delete_outline, color: DarkColors.error, size: 16),
                  ),
                ),
              ]),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _defaultBanner(Color color) {
    return Container(
      height: 90,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withOpacity(0.8), color.withOpacity(0.3), DarkColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
    );
  }

  Widget _avatarFallback(String name, Color color) {
    return Center(
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800),
      ),
    );
  }

  Widget _actionBtn(String label, IconData icon, {Color? color, VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: (color ?? DarkColors.textSecondary).withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(icon, size: 14, color: color ?? DarkColors.textSecondary),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color ?? DarkColors.textSecondary)),
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
        backgroundColor: DarkColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
            child: QrImageView(data: cardUrl, version: QrVersions.auto, size: 200,
                eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: color)),
          ),
          const SizedBox(height: 12),
          Text(cardUrl, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: DarkColors.textMuted)),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.copy, size: 16),
                label: const Text('Copy'),
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: cardUrl));
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Link copied!')));
                },
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                icon: const Icon(Icons.share, size: 16),
                label: const Text('Share'),
                style: ElevatedButton.styleFrom(backgroundColor: color),
                onPressed: () { Share.share(cardUrl); Navigator.pop(ctx); },
              ),
            ),
          ]),
        ]),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────
//  Card Editor Screen
// ──────────────────────────────────────────────────────────────────────────

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
  late final TextEditingController _logoCtrl;
  late final TextEditingController _bannerCtrl;  // ← banner URL
  late String _primaryColor;
  late String _theme;
  bool _saving = false;
  String? _error;

  final _themes = ['light', 'dark', 'gradient', 'glass', 'neon'];
  final _colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];

  @override
  void initState() {
    super.initState();
    final p = widget.profile;
    _nameCtrl     = TextEditingController(text: p?.displayName ?? '');
    _usernameCtrl = TextEditingController(text: p?.username ?? '');
    _titleCtrl    = TextEditingController(text: p?.title ?? '');
    _companyCtrl  = TextEditingController(text: p?.company ?? '');
    _bioCtrl      = TextEditingController(text: p?.bio ?? '');
    _emailCtrl    = TextEditingController(text: p?.contactInfo.email ?? '');
    _phoneCtrl    = TextEditingController(text: p?.contactInfo.phone ?? '');
    _logoCtrl     = TextEditingController(text: p?.branding.logo ?? '');
    _bannerCtrl   = TextEditingController(text: p?.branding.bannerUrl ?? '');
    _primaryColor = p?.branding.primaryColor ?? '#6366f1';
    _theme        = p?.branding.theme ?? 'dark';
  }

  @override
  void dispose() {
    for (final c in [_nameCtrl, _usernameCtrl, _titleCtrl, _companyCtrl, _bioCtrl, _emailCtrl, _phoneCtrl, _logoCtrl, _bannerCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  Color _parseColor(String hex) {
    try { return Color(int.parse(hex.replaceFirst('#', '0xFF'))); } catch (_) { return DarkColors.primary; }
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
        branding: BrandingModel(
          primaryColor: _primaryColor,
          theme: _theme,
          logo: _logoCtrl.text.trim().isNotEmpty ? _logoCtrl.text.trim() : null,
          bannerUrl: _bannerCtrl.text.trim().isNotEmpty ? _bannerCtrl.text.trim() : null,
        ),
        contactInfo: ContactInfoModel(
          email: _emailCtrl.text.trim(),
          phone: _phoneCtrl.text.trim(),
        ),
      );
      if (widget.profile?.id != null) {
        await service.updateProfile(widget.profile!.id!, profile);
      } else {
        await service.createProfile(profile);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final brandColor = _parseColor(_primaryColor);
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.profile == null ? 'New Card' : 'Edit Card'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: DarkColors.primary))
                : const Text('Save', style: TextStyle(color: DarkColors.primary, fontWeight: FontWeight.w700, fontSize: 16)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          if (_error != null)
            Container(
              width: double.infinity, margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: DarkColors.error.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: DarkColors.error.withOpacity(0.3))),
              child: Row(children: [
                const Icon(Icons.error_outline, color: DarkColors.error, size: 16),
                const SizedBox(width: 8),
                Expanded(child: Text(_error!, style: const TextStyle(color: DarkColors.error, fontSize: 13))),
              ]),
            ),

          // ── Live Banner Preview ────────────────────────────────────
          _buildCardPreview(brandColor),
          const SizedBox(height: 20),

          // ── Profile Info ──────────────────────────────────────────
          _section('Profile Info', [
            _field('Display Name *', _nameCtrl),
            if (widget.profile == null) _field('Username (URL slug) *', _usernameCtrl),
            _field('Job Title', _titleCtrl),
            _field('Company', _companyCtrl),
            _field('Bio', _bioCtrl, maxLines: 3),
          ]),
          const SizedBox(height: 12),

          // ── Contact ───────────────────────────────────────────────
          _section('Contact', [
            _field('Email', _emailCtrl, keyboardType: TextInputType.emailAddress),
            _field('Phone', _phoneCtrl, keyboardType: TextInputType.phone),
          ]),
          const SizedBox(height: 12),

          // ── Branding / Banner ─────────────────────────────────────
          _section('Branding & Banner', [
            _field('Company Logo URL', _logoCtrl, hint: 'https://example.com/logo.png', onChanged: (_) => setState(() {})),
            _field('Banner Image URL', _bannerCtrl, hint: 'https://example.com/banner.jpg', onChanged: (_) => setState(() {})),
            const SizedBox(height: 4),
            const Text(
              'Banner appears at the top of your digital card and in email signatures.',
              style: TextStyle(fontSize: 12, color: DarkColors.textMuted),
            ),
          ]),
          const SizedBox(height: 12),

          // ── Theme ─────────────────────────────────────────────────
          _cardSection(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Theme', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
              const SizedBox(height: 12),
              Wrap(spacing: 8, runSpacing: 8, children: _themes.map((t) {
                final selected = _theme == t;
                return GestureDetector(
                  onTap: () => setState(() => _theme = t),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? brandColor.withOpacity(0.15) : DarkColors.elevated,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? brandColor : DarkColors.border, width: selected ? 1.5 : 1),
                    ),
                    child: Text(
                      t[0].toUpperCase() + t.substring(1),
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: selected ? brandColor : DarkColors.textSecondary),
                    ),
                  ),
                );
              }).toList()),
            ]),
          ),
          const SizedBox(height: 12),

          // ── Brand Color ───────────────────────────────────────────
          _cardSection(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Brand Color', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
              const SizedBox(height: 12),
              Wrap(spacing: 12, runSpacing: 12, children: _colors.map((c) {
                final selected = _primaryColor == c;
                final col = _parseColor(c);
                return GestureDetector(
                  onTap: () => setState(() => _primaryColor = c),
                  child: Container(
                    width: 38, height: 38,
                    decoration: BoxDecoration(
                      color: col,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected ? Colors.white : Colors.transparent,
                        width: 2.5,
                      ),
                      boxShadow: selected ? [BoxShadow(color: col.withOpacity(0.5), blurRadius: 10, spreadRadius: 1)] : null,
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

  /// Live mini-preview of the card with the current branding settings.
  Widget _buildCardPreview(Color brandColor) {
    final hasBanner = _bannerCtrl.text.trim().isNotEmpty;
    final hasLogo = _logoCtrl.text.trim().isNotEmpty;
    final name = _nameCtrl.text.isEmpty ? 'Your Name' : _nameCtrl.text;
    final title = _titleCtrl.text.isEmpty ? 'Job Title' : _titleCtrl.text;
    final company = _companyCtrl.text.isEmpty ? 'Company' : _companyCtrl.text;

    return Container(
      decoration: BoxDecoration(
        color: DarkColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: brandColor.withOpacity(0.4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: hasBanner
                ? Image.network(
                    _bannerCtrl.text.trim(),
                    height: 80, width: double.infinity, fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _previewDefaultBanner(brandColor),
                  )
                : _previewDefaultBanner(brandColor),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Transform.translate(
                  offset: const Offset(0, -18),
                  child: Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: brandColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: DarkColors.bg, width: 3),
                    ),
                    child: hasLogo
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(9),
                            child: Image.network(_logoCtrl.text.trim(), fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Icon(Icons.business, color: brandColor, size: 22)),
                          )
                        : Icon(Icons.business, color: brandColor, size: 22),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: brandColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: brandColor.withOpacity(0.3)),
                  ),
                  child: Text('Preview', style: TextStyle(fontSize: 11, color: brandColor, fontWeight: FontWeight.w600)),
                ),
              ]),
              Transform.translate(
                offset: const Offset(0, -6),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
                  Text(title, style: const TextStyle(fontSize: 12, color: DarkColors.textSecondary)),
                  Text(company, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: brandColor)),
                ]),
              ),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _previewDefaultBanner(Color brandColor) {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [brandColor.withOpacity(0.7), brandColor.withOpacity(0.2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text('Add banner URL above', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
      ),
    );
  }

  Widget _section(String title, List<Widget> fields) {
    return _cardSection(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
        const SizedBox(height: 14),
        ...fields.map((f) => Padding(padding: const EdgeInsets.only(bottom: 12), child: f)),
      ]),
    );
  }

  Widget _cardSection({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DarkColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DarkColors.border),
      ),
      child: child,
    );
  }

  Widget _field(String label, TextEditingController ctrl, {
    TextInputType? keyboardType,
    int maxLines = 1,
    String? hint,
    void Function(String)? onChanged,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: DarkColors.textSecondary, letterSpacing: 0.3)),
      const SizedBox(height: 6),
      TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        maxLines: maxLines,
        onChanged: onChanged,
        style: const TextStyle(color: DarkColors.textPrimary, fontSize: 14),
        decoration: InputDecoration(hintText: hint),
      ),
    ]);
  }
}
