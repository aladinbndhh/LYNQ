import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/lead_service.dart';

class DashboardScreen extends StatefulWidget {
  final VoidCallback onNavigateToCards;
  final VoidCallback onNavigateToLeads;
  final VoidCallback onNavigateToScanner;
  final VoidCallback onNavigateToSettings;

  const DashboardScreen({
    super.key,
    required this.onNavigateToCards,
    required this.onNavigateToLeads,
    required this.onNavigateToScanner,
    required this.onNavigateToSettings,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final leads = context.read<LeadService>();
      final stats = await leads.getLeadStats();
      if (mounted) setState(() { _stats = stats; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 160,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF3B82F6),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF3B82F6)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(
                    children: [
                      Image.asset('assets/images/logo.png', width: 40, height: 40),
                      const SizedBox(width: 10),
                      const Text('LynQ', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                      const Spacer(),
                      IconButton(icon: const Icon(Icons.settings_outlined, color: Colors.white), onPressed: widget.onNavigateToSettings),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('Dashboard', style: TextStyle(color: Colors.white70, fontSize: 13)),
                ]),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Stats row
                if (!_loading && _stats != null) ...[
                  Row(children: [
                    _statCard('Total Leads', '${_stats!['total'] ?? 0}', const Color(0xFF3B82F6), Icons.people),
                    const SizedBox(width: 12),
                    _statCard('New', '${_stats!['byStatus']?['new'] ?? 0}', const Color(0xFF10B981), Icons.fiber_new),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    _statCard('Qualified', '${_stats!['byStatus']?['qualified'] ?? 0}', const Color(0xFF8B5CF6), Icons.star),
                    const SizedBox(width: 12),
                    _statCard('Converted', '${_stats!['byStatus']?['converted'] ?? 0}', const Color(0xFFF59E0B), Icons.check_circle),
                  ]),
                  const SizedBox(height: 24),
                ],

                // Quick actions
                const Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                  children: [
                    _actionCard('My Cards', Icons.credit_card, const Color(0xFF3B82F6), widget.onNavigateToCards),
                    _actionCard('Leads', Icons.people_outline, const Color(0xFF8B5CF6), widget.onNavigateToLeads),
                    _actionCard('Scan QR / NFC', Icons.qr_code_scanner, const Color(0xFF10B981), widget.onNavigateToScanner),
                    _actionCard('Settings', Icons.tune, const Color(0xFFF59E0B), widget.onNavigateToSettings),
                  ],
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))]),
        child: Row(children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: color, size: 20)),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
            Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
          ]),
        ]),
      ),
    );
  }

  Widget _actionCard(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(width: 48, height: 48, decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(14)), child: Icon(icon, color: color, size: 24)),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
        ]),
      ),
    );
  }
}
