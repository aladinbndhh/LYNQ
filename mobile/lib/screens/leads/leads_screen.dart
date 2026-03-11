import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/lead_model.dart';
import '../../services/lead_service.dart';

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
      final service = context.read<LeadService>();
      final leads = await service.listLeads(status: _filterStatus == 'all' ? null : _filterStatus);
      if (mounted) setState(() { _leads = leads; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _loading = false; });
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'new': return const Color(0xFF3B82F6);
      case 'contacted': return const Color(0xFF8B5CF6);
      case 'qualified': return const Color(0xFF10B981);
      case 'converted': return const Color(0xFFF59E0B);
      case 'lost': return const Color(0xFFEF4444);
      default: return const Color(0xFF94A3B8);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Leads', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
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
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: active ? const Color(0xFF3B82F6) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: active ? const Color(0xFF3B82F6) : const Color(0xFFE2E8F0)),
                      ),
                      child: Text(s[0].toUpperCase() + s.substring(1),
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: active ? Colors.white : const Color(0xFF64748B))),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6)))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Color(0xFFEF4444))))
              : _leads.isEmpty
                  ? const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Icon(Icons.people_outline, size: 64, color: Color(0xFFCBD5E1)),
                      SizedBox(height: 12),
                      Text('No leads yet', style: TextStyle(fontSize: 16, color: Color(0xFF94A3B8))),
                    ]))
                  : RefreshIndicator(
                      onRefresh: _loadLeads,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _leads.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (ctx, i) {
                          final lead = _leads[i];
                          final color = _statusColor(lead.status);
                          return Container(
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: CircleAvatar(
                                backgroundColor: color.withOpacity(0.12),
                                child: Text(lead.name.isNotEmpty ? lead.name[0].toUpperCase() : '?', style: TextStyle(color: color, fontWeight: FontWeight.w700)),
                              ),
                              title: Text(lead.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF1E293B))),
                              subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                if (lead.company != null) Text(lead.company!, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                const SizedBox(height: 4),
                                Row(children: [
                                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)), child: Text(lead.statusLabel, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600))),
                                  const SizedBox(width: 6),
                                  Text(lead.sourceLabel, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                                ]),
                              ]),
                              trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                                if (lead.score != null) Container(
                                  width: 36, height: 36,
                                  decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                                  child: Center(child: Text('${lead.score}', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w800))),
                                ),
                              ]),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
