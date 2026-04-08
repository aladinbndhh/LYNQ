import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';
import '../../models/profile_model.dart';
import '../../services/auth_service.dart';
import '../../services/profile_service.dart';
import '../../theme/app_theme.dart';

// ──────────────────────────────────────────────────────────────────────────
//  Cards Screen — Popl-style card view
// ──────────────────────────────────────────────────────────────────────────

class CardsScreen extends StatefulWidget {
  const CardsScreen({super.key});

  @override
  State<CardsScreen> createState() => _CardsScreenState();
}

class _CardsScreenState extends State<CardsScreen> {
  List<ProfileModel> _profiles = [];
  bool _loading = true;
  String? _error;
  int _currentPage = 0;
  String _userName = '';
  final _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() { _loading = true; _error = null; });
    try {
      final auth = context.read<AuthService>();
      final service = context.read<ProfileService>();

      final user = await auth.getUser();
      final profiles = await service.listProfiles();

      if (mounted) {
        setState(() {
          _profiles = profiles;
          _userName = user?['name']?.toString().split(' ').first ?? 'My Cards';
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _loading = false; });
    }
  }

  void _openEditor({ProfileModel? profile}) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => _CardEditorScreen(profile: profile)),
    ).then((_) => _loadData());
  }

  Future<void> _deleteProfile(ProfileModel profile) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: DarkColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 40),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('Delete Card', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17, color: DarkColors.textPrimary)),
            const SizedBox(height: 8),
            const Text('This will permanently delete the card and its QR code.', style: TextStyle(color: DarkColors.textSecondary, fontSize: 14), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Row(children: [
              Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel'))),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: DarkColors.error),
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Delete'),
              )),
            ]),
          ]),
        ),
      ),
    );
    if (confirm != true) return;
    if (!mounted) return;
    try {
      await context.read<ProfileService>().deleteProfile(profile.id!);
      if (mounted) {
        setState(() {
          _profiles.removeWhere((p) => p.id == profile.id);
          if (_currentPage >= _profiles.length && _currentPage > 0) {
            _currentPage = _profiles.length - 1;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: DarkColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_userName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: () => _openEditor(),
              child: const Icon(Icons.add, color: DarkColors.textPrimary, size: 28),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DarkColors.primary, strokeWidth: 2))
          : _error != null
              ? _buildError()
              : _profiles.isEmpty
                  ? _buildEmpty()
                  : _buildCardView(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.error_outline, color: DarkColors.error, size: 48),
        const SizedBox(height: 12),
        Text(_error!, style: const TextStyle(color: DarkColors.textSecondary), textAlign: TextAlign.center),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _loadData, child: const Text('Retry')),
      ]),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 100, height: 100,
          decoration: BoxDecoration(
            color: DarkColors.elevated,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: DarkColors.border),
          ),
          child: const Icon(Icons.credit_card_outlined, size: 44, color: DarkColors.textMuted),
        ),
        const SizedBox(height: 24),
        const Text('No cards yet', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
        const SizedBox(height: 8),
        const Text('Create your first digital business card', style: TextStyle(color: DarkColors.textSecondary, fontSize: 14)),
        const SizedBox(height: 28),
        ElevatedButton.icon(
          onPressed: () => _openEditor(),
          icon: const Icon(Icons.add, size: 20),
          label: const Text('Create Card'),
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14)),
        ),
      ]),
    );
  }

  Widget _buildCardView() {
    final profile = _profiles[_currentPage];
    final cardUrl = ApiConfig.publicCardUrl(profile.username);

    return RefreshIndicator(
      color: DarkColors.primary,
      backgroundColor: DarkColors.surface,
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: Column(
          children: [
            // ── Edit / Preview pills ───────────────────────────────
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              _pillBtn('Edit', Icons.edit_outlined, onTap: () => _openEditor(profile: profile)),
              const SizedBox(width: 12),
              _pillBtn('Preview', Icons.open_in_browser_outlined, onTap: () async {
                final uri = Uri.parse(cardUrl);
                if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
              }),
            ]),
            const SizedBox(height: 16),

            // ── Card PageView ──────────────────────────────────────
            SizedBox(
              height: 520,
              child: PageView.builder(
                controller: _pageController,
                itemCount: _profiles.length,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemBuilder: (ctx, i) => _buildCard(_profiles[i]),
              ),
            ),

            // ── Page dots ─────────────────────────────────────────
            if (_profiles.length > 1) ...[
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_profiles.length, (i) {
                  final active = i == _currentPage;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: active ? 20 : 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: active ? DarkColors.primary : DarkColors.border,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              ),
            ],

            const SizedBox(height: 20),

            // ── Share + More row ───────────────────────────────────
            Row(children: [
              Expanded(
                child: _actionRow(Icons.share_outlined, 'Share',
                    onTap: () => Share.share(cardUrl, subject: "${profile.displayName}'s Digital Card")),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _actionRow(Icons.more_horiz, 'More', onTap: () => _showMoreMenu(profile)),
              ),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(ProfileModel profile) {
    final color = _parseColor(profile.branding.primaryColor);
    final hasBanner = profile.branding.bannerUrl != null && profile.branding.bannerUrl!.isNotEmpty;
    final hasLogo = profile.branding.logo != null && profile.branding.logo!.isNotEmpty;
    final hasAvatar = profile.avatar != null && profile.avatar!.isNotEmpty;
    final cardUrl = ApiConfig.publicCardUrl(profile.username);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Container(
        decoration: BoxDecoration(
          color: DarkColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: DarkColors.border2, width: 1.5),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          children: [
            // ── Banner ──────────────────────────────────────────────
            Stack(
              clipBehavior: Clip.none,
              children: [
                // Banner image or gradient
                SizedBox(
                  height: 130,
                  width: double.infinity,
                  child: hasBanner
                      ? Image.network(
                          profile.branding.bannerUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _defaultBanner(color),
                        )
                      : _defaultBanner(color),
                ),

                // "..." menu top-right
                Positioned(
                  top: 10, right: 10,
                  child: GestureDetector(
                    onTap: () => _showMoreMenu(profile),
                    child: Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(100),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.more_horiz, color: Colors.white, size: 18),
                    ),
                  ),
                ),

                // Company subtitle top-left
                if (profile.company.isNotEmpty)
                  Positioned(
                    top: 10, left: 12, right: 50,
                    child: Text(
                      profile.company,
                      style: const TextStyle(fontSize: 10, color: Colors.white70, fontWeight: FontWeight.w500),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                // Avatar overlapping banner bottom
                Positioned(
                  bottom: -32, left: 16,
                  child: _buildAvatar(profile, hasAvatar, hasLogo, color),
                ),
              ],
            ),

            // ── Profile info ─────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 44, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(profile.displayName,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: DarkColors.textPrimary),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (profile.title.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(profile.title, style: const TextStyle(fontSize: 13, color: DarkColors.textSecondary)),
                  ],
                  if (profile.company.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(profile.company, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color)),
                  ],
                  if (profile.bio.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(profile.bio,
                      style: const TextStyle(fontSize: 12, color: DarkColors.textMuted),
                      maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ],
              ),
            ),

            const Spacer(),

            // ── QR section ─────────────────────────────────────────
            Container(
              width: double.infinity,
              color: const Color(0xFF0A0F1A),
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Column(children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: QrImageView(
                    data: cardUrl,
                    version: QrVersions.auto,
                    size: 140,
                    eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: color),
                    dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('Scan to share card',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: DarkColors.textSecondary)),
              ]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar(ProfileModel profile, bool hasAvatar, bool hasLogo, Color color) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      // Profile photo
      Container(
        width: 64, height: 64,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: DarkColors.surface, width: 3),
          color: color.withAlpha(40),
        ),
        child: hasAvatar
            ? ClipOval(child: Image.network(profile.avatar!, fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _avatarFallback(profile.displayName, color, 64)))
            : _avatarFallback(profile.displayName, color, 64),
      ),

      // Company logo (if set)
      if (hasLogo) ...[
        const SizedBox(width: 8),
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: DarkColors.surface, width: 3),
            color: Colors.white,
          ),
          child: ClipOval(
            child: Image.network(profile.branding.logo!, fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Icon(Icons.business, color: color, size: 22)),
          ),
        ),
      ],
    ]);
  }

  Widget _avatarFallback(String name, Color color, double size) {
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color.withAlpha(40)),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: TextStyle(color: color, fontSize: size * 0.35, fontWeight: FontWeight.w800),
        ),
      ),
    );
  }

  Widget _defaultBanner(Color color) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color.withAlpha(200), color.withAlpha(80), DarkColors.elevated],
        ),
      ),
    );
  }

  Widget _pillBtn(String label, IconData icon, {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 10),
        decoration: BoxDecoration(
          color: DarkColors.elevated,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: DarkColors.border2),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 14, color: DarkColors.textSecondary),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: DarkColors.textPrimary)),
        ]),
      ),
    );
  }

  Widget _actionRow(IconData icon, String label, {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: DarkColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: DarkColors.border),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 18, color: DarkColors.textSecondary),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: DarkColors.textPrimary)),
        ]),
      ),
    );
  }

  void _showMoreMenu(ProfileModel profile) {
    final cardUrl = ApiConfig.publicCardUrl(profile.username);
    showModalBottomSheet(
      context: context,
      backgroundColor: DarkColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: DarkColors.border, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          _menuItem(Icons.qr_code_outlined, 'Show QR Code', DarkColors.primary, () {
            Navigator.pop(ctx);
            _showQrDialog(profile);
          }),
          _menuItem(Icons.copy_outlined, 'Copy Card Link', DarkColors.info, () {
            Clipboard.setData(ClipboardData(text: cardUrl));
            Navigator.pop(ctx);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Card link copied!'), backgroundColor: DarkColors.success),
            );
          }),
          _menuItem(Icons.share_outlined, 'Share Card', DarkColors.success, () {
            Navigator.pop(ctx);
            Share.share(cardUrl, subject: "${profile.displayName}'s Digital Card");
          }),
          _menuItem(Icons.edit_outlined, 'Edit Card', DarkColors.textSecondary, () {
            Navigator.pop(ctx);
            _openEditor(profile: profile);
          }),
          const Divider(color: DarkColors.border, height: 24),
          _menuItem(Icons.delete_outline, 'Delete Card', DarkColors.error, () {
            Navigator.pop(ctx);
            _deleteProfile(profile);
          }),
        ]),
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, Color color, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      leading: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(color: color.withAlpha(30), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: color, size: 18),
      ),
      title: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: DarkColors.textPrimary)),
      trailing: const Icon(Icons.chevron_right, color: DarkColors.border, size: 18),
    );
  }

  void _showQrDialog(ProfileModel profile) {
    final cardUrl = ApiConfig.publicCardUrl(profile.username);
    final color = _parseColor(profile.branding.primaryColor);
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: DarkColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 32),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(profile.displayName,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
            const SizedBox(height: 4),
            Text(profile.company, style: TextStyle(fontSize: 12, color: color)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
              child: QrImageView(
                data: cardUrl,
                version: QrVersions.auto,
                size: 190,
                eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: color),
              ),
            ),
            const SizedBox(height: 14),
            Text(cardUrl, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: DarkColors.textMuted)),
            const SizedBox(height: 20),
            Row(children: [
              Expanded(child: OutlinedButton.icon(
                icon: const Icon(Icons.copy, size: 16),
                label: const Text('Copy'),
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: cardUrl));
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Copied!'), backgroundColor: DarkColors.success));
                },
              )),
              const SizedBox(width: 10),
              Expanded(child: ElevatedButton.icon(
                icon: const Icon(Icons.share, size: 16),
                label: const Text('Share'),
                style: ElevatedButton.styleFrom(backgroundColor: color),
                onPressed: () { Share.share(cardUrl); Navigator.pop(ctx); },
              )),
            ]),
          ]),
        ),
      ),
    );
  }

  Color _parseColor(String hex) {
    try { return Color(int.parse(hex.replaceFirst('#', '0xFF'))); } catch (_) { return DarkColors.primary; }
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
  late final TextEditingController _bannerCtrl;
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
              decoration: BoxDecoration(color: DarkColors.error.withAlpha(25), borderRadius: BorderRadius.circular(12), border: Border.all(color: DarkColors.error.withAlpha(80))),
              child: Row(children: [
                const Icon(Icons.error_outline, color: DarkColors.error, size: 16),
                const SizedBox(width: 8),
                Expanded(child: Text(_error!, style: const TextStyle(color: DarkColors.error, fontSize: 13))),
              ]),
            ),

          // Live mini preview
          _buildCardPreview(brandColor),
          const SizedBox(height: 20),

          _section('Profile Info', [
            _field('Display Name *', _nameCtrl),
            if (widget.profile == null) _field('Username (URL slug) *', _usernameCtrl),
            _field('Job Title', _titleCtrl),
            _field('Company', _companyCtrl),
            _field('Bio', _bioCtrl, maxLines: 3),
          ]),
          const SizedBox(height: 12),

          _section('Contact', [
            _field('Email', _emailCtrl, keyboardType: TextInputType.emailAddress),
            _field('Phone', _phoneCtrl, keyboardType: TextInputType.phone),
          ]),
          const SizedBox(height: 12),

          _section('Branding & Banner', [
            _field('Company Logo URL', _logoCtrl, hint: 'https://example.com/logo.png', onChanged: (_) => setState(() {})),
            _field('Banner Image URL', _bannerCtrl, hint: 'https://example.com/banner.jpg', onChanged: (_) => setState(() {})),
            const SizedBox(height: 4),
            const Text('Banner appears at the top of your card and in email signatures.',
              style: TextStyle(fontSize: 12, color: DarkColors.textMuted)),
          ]),
          const SizedBox(height: 12),

          _cardSection(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Theme', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, children: _themes.map((t) {
              final selected = _theme == t;
              return GestureDetector(
                onTap: () => setState(() => _theme = t),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected ? brandColor.withAlpha(40) : DarkColors.elevated,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: selected ? brandColor : DarkColors.border, width: selected ? 1.5 : 1),
                  ),
                  child: Text(t[0].toUpperCase() + t.substring(1),
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: selected ? brandColor : DarkColors.textSecondary)),
                ),
              );
            }).toList()),
          ])),
          const SizedBox(height: 12),

          _cardSection(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
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
                    border: Border.all(color: selected ? Colors.white : Colors.transparent, width: 2.5),
                    boxShadow: selected ? [BoxShadow(color: col.withAlpha(130), blurRadius: 10, spreadRadius: 1)] : null,
                  ),
                  child: selected ? const Icon(Icons.check, color: Colors.white, size: 16) : null,
                ),
              );
            }).toList()),
          ])),
          const SizedBox(height: 32),
        ]),
      ),
    );
  }

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
        border: Border.all(color: brandColor.withAlpha(100), width: 1.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Banner
        Stack(clipBehavior: Clip.none, children: [
          SizedBox(
            height: 80, width: double.infinity,
            child: hasBanner
                ? Image.network(_bannerCtrl.text.trim(), fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _previewDefaultBanner(brandColor))
                : _previewDefaultBanner(brandColor),
          ),
          Positioned(
            bottom: -20, left: 14,
            child: Row(children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: DarkColors.surface, width: 3), color: brandColor.withAlpha(40)),
                child: hasLogo
                    ? ClipOval(child: Image.network(_logoCtrl.text.trim(), fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Icon(Icons.business, color: brandColor, size: 20)))
                    : Center(child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?',
                        style: TextStyle(color: brandColor, fontSize: 18, fontWeight: FontWeight.w800))),
              ),
            ]),
          ),
        ]),
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 28, 14, 14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
                Text(title, style: const TextStyle(fontSize: 12, color: DarkColors.textSecondary)),
                Text(company, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: brandColor)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: brandColor.withAlpha(25), borderRadius: BorderRadius.circular(20), border: Border.all(color: brandColor.withAlpha(80))),
                child: Text('Preview', style: TextStyle(fontSize: 10, color: brandColor, fontWeight: FontWeight.w600)),
              ),
            ]),
          ]),
        ),
      ]),
    );
  }

  Widget _previewDefaultBanner(Color brandColor) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [brandColor.withAlpha(180), brandColor.withAlpha(60)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
      ),
      child: Center(child: Text('Add a banner URL above', style: TextStyle(color: Colors.white.withAlpha(120), fontSize: 11))),
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
