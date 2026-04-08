import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
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
      final stats = await context.read<LeadService>().getLeadStats();
      if (mounted) setState(() { _stats = stats; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── Header ──────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 180,
            floating: false,
            pinned: true,
            backgroundColor: DarkColors.bg,
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.parallax,
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // gradient mesh
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF1A0E35), Color(0xFF060D1A)],
                      ),
                    ),
                  ),
                  // glowing orb
                  Positioned(
                    top: -30, right: -30,
                    child: Container(
                      width: 200, height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(colors: [
                          DarkColors.primary.withOpacity(0.25),
                          Colors.transparent,
                        ]),
                      ),
                    ),
                  ),
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Row(children: [
                            Container(
                              width: 38, height: 38,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                gradient: const LinearGradient(colors: [DarkColors.gradient1, DarkColors.gradient2]),
                              ),
                              padding: const EdgeInsets.all(6),
                              child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
                            ),
                            const SizedBox(width: 10),
                            const Text('LynQ', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: DarkColors.textPrimary)),
                            const Spacer(),
                            GestureDetector(
                              onTap: widget.onNavigateToSettings,
                              child: Container(
                                width: 36, height: 36,
                                decoration: BoxDecoration(
                                  color: DarkColors.elevated,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: DarkColors.border),
                                ),
                                child: const Icon(Icons.settings_outlined, color: DarkColors.textSecondary, size: 18),
                              ),
                            ),
                          ]),
                          const SizedBox(height: 20),
                          const Text('Dashboard', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: DarkColors.textPrimary, letterSpacing: -0.5)),
                          const SizedBox(height: 4),
                          const Text('Welcome back to your workspace', style: TextStyle(fontSize: 13, color: DarkColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Body ──────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Stats
                if (!_loading && _stats != null) ...[
                  Row(children: [
                    _StatCard(label: 'Total Leads', value: '${_stats!['total'] ?? 0}', color: DarkColors.info, icon: Icons.people_alt_outlined),
                    const SizedBox(width: 12),
                    _StatCard(label: 'New', value: '${_stats!['byStatus']?['new'] ?? 0}', color: DarkColors.success, icon: Icons.fiber_new_outlined),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    _StatCard(label: 'Qualified', value: '${_stats!['byStatus']?['qualified'] ?? 0}', color: DarkColors.primary, icon: Icons.star_outline),
                    const SizedBox(width: 12),
                    _StatCard(label: 'Converted', value: '${_stats!['byStatus']?['converted'] ?? 0}', color: DarkColors.warning, icon: Icons.check_circle_outline),
                  ]),
                  const SizedBox(height: 28),
                ] else if (_loading) ...[
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(color: DarkColors.primary, strokeWidth: 2),
                    ),
                  ),
                ],

                // Section header
                const Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: DarkColors.textPrimary, letterSpacing: -0.2)),
                const SizedBox(height: 16),

                // Action grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.3,
                  children: [
                    _ActionCard(label: 'My Cards', subtitle: 'Manage your cards', icon: Icons.credit_card_outlined, color: DarkColors.primary, onTap: widget.onNavigateToCards),
                    _ActionCard(label: 'Leads', subtitle: 'View contacts', icon: Icons.people_outline, color: const Color(0xFF8B5CF6), onTap: widget.onNavigateToLeads),
                    _ActionCard(label: 'Scan QR / NFC', subtitle: 'Add new lead', icon: Icons.qr_code_scanner_outlined, color: DarkColors.success, onTap: widget.onNavigateToScanner),
                    _ActionCard(label: 'Settings', subtitle: 'App settings', icon: Icons.tune_outlined, color: DarkColors.warning, onTap: widget.onNavigateToSettings),
                  ],
                ),
                const SizedBox(height: 24),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _StatCard({required this.label, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: DarkColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: DarkColors.border),
        ),
        child: Row(children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 11, color: DarkColors.textMuted, fontWeight: FontWeight.w500)),
          ]),
        ]),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String label;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({required this.label, required this.subtitle, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: DarkColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: DarkColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: DarkColors.textPrimary)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: DarkColors.textMuted)),
            ]),
          ],
        ),
      ),
    );
  }
}
