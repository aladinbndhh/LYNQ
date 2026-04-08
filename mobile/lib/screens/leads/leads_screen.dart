import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _loading = false; });
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
                          border: Border.all(
                            color: active ? DarkColors.primary : DarkColors.border,
                          ),
                        ),
                        child: Text(
                          s[0].toUpperCase() + s.substring(1),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
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
              : 'No "${_filterStatus}" leads found',
          style: const TextStyle(color: DarkColors.textSecondary, fontSize: 14),
          textAlign: TextAlign.center,
        ),
      ]),
    );
  }

  Widget _buildLeadCard(LeadModel lead) {
    final color = _statusColor(lead.status);
    return Container(
      decoration: BoxDecoration(
        color: DarkColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DarkColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        leading: Container(
          width: 46, height: 46,
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              lead.name.isNotEmpty ? lead.name[0].toUpperCase() : '?',
              style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 18),
            ),
          ),
        ),
        title: Text(
          lead.name,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: DarkColors.textPrimary),
        ),
        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (lead.company != null) ...[
            const SizedBox(height: 2),
            Text(lead.company!, style: const TextStyle(fontSize: 12, color: DarkColors.textSecondary)),
          ],
          const SizedBox(height: 6),
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                lead.statusLabel,
                style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.3),
              ),
            ),
            const SizedBox(width: 6),
            Text(lead.sourceLabel, style: const TextStyle(fontSize: 11, color: DarkColors.textMuted)),
          ]),
        ]),
        trailing: lead.score != null
            ? Container(
                width: 38, height: 38,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: color.withOpacity(0.3)),
                ),
                child: Center(
                  child: Text(
                    '${lead.score}',
                    style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w800),
                  ),
                ),
              )
            : null,
      ),
    );
  }
}
