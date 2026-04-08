import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/lead_model.dart';
import '../../services/lead_service.dart';
import '../../theme/app_theme.dart';

class LeadsScreen extends StatefulWidget {
  const LeadsScreen({super.key});

  @override
  State<LeadsScreen> createState() => _LeadsScreenState();
}

class _LeadsScreenState extends State<LeadsScreen> {
  List<LeadModel> _leads = [];
  bool _loading = true;
  String? _error;
  String _filterStatus = 'all';

  @override
  void initState() {
    super.initState();
    _loadLeads();
  }

  Future<void> _loadLeads() async {
    setState(() { _loading = true; _error = null; });
    try {
      final leads = await context.read<LeadService>().listLeads(
        status: _filterStatus == 'all' ? null : _filterStatus,
      );
      if (mounted) setState(() { _leads = leads; _loading = false; });
    } catch (e) {
      if (mounted) setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _loading = false;
      });
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'new':       return DarkColors.info;
      case 'contacted': return const Color(0xFF8B5CF6);
      case 'qualified': return DarkColors.success;
      case 'converted': return DarkColors.warning;
      case 'lost':      return DarkColors.error;
      default:          return DarkColors.textMuted;
    }
  }

  void _openDetail(LeadModel lead) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _LeadDetailSheet(lead: lead, statusColor: _statusColor(lead.status)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leads'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
          child: Container(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: DarkColors.border)),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'].map((s) {
                  final active = _filterStatus == s;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () { setState(() => _filterStatus = s); _loadLeads(); },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: active ? DarkColors.primary : DarkColors.elevated,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: active ? DarkColors.primary : DarkColors.border),
                        ),
                        child: Text(
                          s[0].toUpperCase() + s.substring(1),
                          style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w600,
                            color: active ? Colors.white : DarkColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DarkColors.primary, strokeWidth: 2))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: DarkColors.error)))
              : _leads.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      color: DarkColors.primary,
                      backgroundColor: DarkColors.surface,
                      onRefresh: _loadLeads,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _leads.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (ctx, i) => _buildLeadCard(_leads[i]),
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
          child: const Icon(Icons.people_outline, size: 36, color: DarkColors.textMuted),
        ),
        const SizedBox(height: 20),
        const Text('No leads yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
        const SizedBox(height: 6),
        Text(
          _filterStatus == 'all'
              ? 'Scan a QR code or NFC card to capture leads'
              : 'No "$_filterStatus" leads found',
          style: const TextStyle(color: DarkColors.textSecondary, fontSize: 14),
          textAlign: TextAlign.center,
        ),
      ]),
    );
  }

  Widget _buildLeadCard(LeadModel lead) {
    final color = _statusColor(lead.status);
    return GestureDetector(
      onTap: () => _openDetail(lead),
      child: Container(
        decoration: BoxDecoration(
          color: DarkColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: DarkColors.border),
        ),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Avatar initial
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: color.withAlpha(30),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  lead.name.isNotEmpty ? lead.name[0].toUpperCase() : '?',
                  style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 20),
                ),
              ),
            ),
            const SizedBox(width: 14),

            // Details column
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(lead.name,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: DarkColors.textPrimary)),

                  if (lead.company != null) ...[
                    const SizedBox(height: 2),
                    Text(lead.company!,
                      style: const TextStyle(fontSize: 12, color: DarkColors.textSecondary, fontWeight: FontWeight.w500)),
                  ],

                  // ── Email ────────────────────────────────────────
                  if (lead.email != null) ...[
                    const SizedBox(height: 4),
                    Row(children: [
                      const Icon(Icons.email_outlined, size: 12, color: DarkColors.textMuted),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(lead.email!,
                          style: const TextStyle(fontSize: 12, color: DarkColors.textSecondary),
                          overflow: TextOverflow.ellipsis),
                      ),
                    ]),
                  ],

                  // ── Phone ────────────────────────────────────────
                  if (lead.phone != null) ...[
                    const SizedBox(height: 2),
                    Row(children: [
                      const Icon(Icons.phone_outlined, size: 12, color: DarkColors.textMuted),
                      const SizedBox(width: 4),
                      Text(lead.phone!,
                        style: const TextStyle(fontSize: 12, color: DarkColors.textSecondary)),
                    ]),
                  ],

                  const SizedBox(height: 8),
                  Row(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: color.withAlpha(30),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(lead.statusLabel,
                        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.3)),
                    ),
                    const SizedBox(width: 6),
                    Text(lead.sourceLabel,
                      style: const TextStyle(fontSize: 11, color: DarkColors.textMuted)),
                  ]),
                ],
              ),
            ),

            // Score badge + chevron
            Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              if (lead.score != null)
                Container(
                  width: 34, height: 34,
                  decoration: BoxDecoration(
                    color: color.withAlpha(25),
                    shape: BoxShape.circle,
                    border: Border.all(color: color.withAlpha(80)),
                  ),
                  child: Center(
                    child: Text('${lead.score}',
                      style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w800)),
                  ),
                ),
              const SizedBox(height: 4),
              const Icon(Icons.chevron_right, color: DarkColors.border, size: 18),
            ]),
          ],
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────
//  Lead Detail Bottom Sheet
// ──────────────────────────────────────────────────────────────────────────

class _LeadDetailSheet extends StatefulWidget {
  final LeadModel lead;
  final Color statusColor;

  const _LeadDetailSheet({required this.lead, required this.statusColor});

  @override
  State<_LeadDetailSheet> createState() => _LeadDetailSheetState();
}

class _LeadDetailSheetState extends State<_LeadDetailSheet> {
  bool _saving = false;

  Future<void> _saveToContacts() async {
    setState(() => _saving = true);
    try {
      final lead = widget.lead;

      // Build vCard string
      final vcf = StringBuffer()
        ..writeln('BEGIN:VCARD')
        ..writeln('VERSION:3.0')
        ..writeln('FN:${lead.name}')
        ..writeln('N:$_lastName;$_firstName;;;');
      if (lead.company != null) vcf.writeln('ORG:${lead.company}');
      if (lead.email != null)   vcf.writeln('EMAIL;TYPE=WORK:${lead.email}');
      if (lead.phone != null)   vcf.writeln('TEL;TYPE=CELL:${lead.phone}');
      vcf.writeln('END:VCARD');

      // Write to temp file
      final dir  = await getTemporaryDirectory();
      final safe = lead.name.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '_');
      final file = File('${dir.path}/$safe.vcf');
      await file.writeAsString(vcf.toString());

      // Share — iOS shows native "Add to Contacts", Android opens contacts app
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'text/vcard')],
        subject: lead.name,
      );
    } catch (e) {
      if (mounted) {
        _showSnack('Failed to export contact: ${e.toString().replaceFirst("Exception: ", "")}', isError: true);
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? DarkColors.error : DarkColors.success,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  String get _firstName {
    final parts = widget.lead.name.trim().split(' ');
    return parts.length > 1 ? parts.sublist(0, parts.length - 1).join(' ') : parts.first;
  }

  String get _lastName {
    final parts = widget.lead.name.trim().split(' ');
    return parts.length > 1 ? parts.last : '';
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri != null && await canLaunchUrl(uri)) {
      launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lead = widget.lead;
    final color = widget.statusColor;

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      builder: (ctx, scrollCtrl) => Container(
        decoration: const BoxDecoration(
          color: DarkColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: ListView(
          controller: scrollCtrl,
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
          children: [
            // ── Handle ──────────────────────────────────────────
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 20),
                width: 40, height: 4,
                decoration: BoxDecoration(color: DarkColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),

            // ── Header ──────────────────────────────────────────
            Row(children: [
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  color: color.withAlpha(30),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text(
                    lead.name.isNotEmpty ? lead.name[0].toUpperCase() : '?',
                    style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 24),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(lead.name,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
                if (lead.company != null)
                  Text(lead.company!,
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: color)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: color.withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: color.withAlpha(80)),
                ),
                child: Text(lead.statusLabel,
                  style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
              ),
            ]),

            const SizedBox(height: 24),

            // ── Contact info ─────────────────────────────────────
            _sectionTitle('Contact Info'),
            const SizedBox(height: 12),
            if (lead.email != null)
              _infoRow(
                icon: Icons.email_outlined,
                label: 'Email',
                value: lead.email!,
                color: color,
                onTap: () => _launchUrl('mailto:${lead.email}'),
                onCopy: () {
                  Clipboard.setData(ClipboardData(text: lead.email!));
                  _showSnack('Email copied');
                },
              ),
            if (lead.phone != null)
              _infoRow(
                icon: Icons.phone_outlined,
                label: 'Phone',
                value: lead.phone!,
                color: color,
                onTap: () => _launchUrl('tel:${lead.phone}'),
                onCopy: () {
                  Clipboard.setData(ClipboardData(text: lead.phone!));
                  _showSnack('Phone copied');
                },
              ),
            if (lead.email == null && lead.phone == null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text('No contact info available',
                  style: const TextStyle(color: DarkColors.textMuted, fontSize: 14)),
              ),

            const SizedBox(height: 16),

            // ── Lead metadata ─────────────────────────────────────
            _sectionTitle('Lead Details'),
            const SizedBox(height: 12),
            _metaRow('Source', lead.sourceLabel),
            _metaRow('Status', lead.statusLabel),
            if (lead.score != null) _metaRow('Score', '${lead.score}'),
            _metaRow('Captured', _formatDate(lead.createdAt)),
            if (lead.notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: DarkColors.elevated,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: DarkColors.border),
                ),
                child: Text(lead.notes,
                  style: const TextStyle(fontSize: 13, color: DarkColors.textSecondary, height: 1.5)),
              ),
            ],

            const SizedBox(height: 28),

            // ── Quick actions ─────────────────────────────────────
            if (lead.email != null)
              _actionButton(
                icon: Icons.email_outlined,
                label: 'Send Email',
                color: DarkColors.info,
                onTap: () => _launchUrl('mailto:${lead.email}'),
              ),
            if (lead.phone != null) ...[
              const SizedBox(height: 10),
              _actionButton(
                icon: Icons.phone_outlined,
                label: 'Call',
                color: DarkColors.success,
                onTap: () => _launchUrl('tel:${lead.phone}'),
              ),
            ],
            const SizedBox(height: 10),

            // ── Save Contact button ───────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _saving ? null : _saveToContacts,
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: _saving
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.person_add_alt_1_outlined, size: 20),
                label: Text(
                  _saving ? 'Saving…' : 'Save to Contacts',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) => Text(
    title,
    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
        color: DarkColors.textMuted, letterSpacing: 1),
  );

  Widget _infoRow({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    required VoidCallback onTap,
    required VoidCallback onCopy,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: DarkColors.elevated,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: DarkColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        leading: Container(
          width: 38, height: 38,
          decoration: BoxDecoration(
            color: color.withAlpha(25),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        title: Text(label,
          style: const TextStyle(fontSize: 11, color: DarkColors.textMuted, fontWeight: FontWeight.w600)),
        subtitle: Text(value,
          style: const TextStyle(fontSize: 14, color: DarkColors.textPrimary, fontWeight: FontWeight.w600)),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          GestureDetector(
            onTap: onCopy,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: DarkColors.border.withAlpha(80), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.copy_outlined, size: 14, color: DarkColors.textMuted),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: color.withAlpha(25), borderRadius: BorderRadius.circular(8)),
              child: Icon(Icons.open_in_new, size: 14, color: color),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _metaRow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: const TextStyle(fontSize: 13, color: DarkColors.textMuted)),
      Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: DarkColors.textPrimary)),
    ]),
  );

  Widget _actionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton.icon(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: color,
          side: BorderSide(color: color.withAlpha(120)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        icon: Icon(icon, size: 18),
        label: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }
}
