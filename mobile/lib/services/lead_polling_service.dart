import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/lead_model.dart';
import 'auth_service.dart';
import 'lead_service.dart';

class LeadPollingService extends ChangeNotifier {
  final LeadService _leadService;
  final AuthService _authService;

  Timer? _timer;
  List<LeadModel> _leads = [];
  int _newLeadCount = 0;
  Set<String> _knownIds = {};
  bool _started = false;
  String _filterStatus = 'all';

  List<LeadModel> get leads => _leads;
  int get newLeadCount => _newLeadCount;

  static final _notifs = FlutterLocalNotificationsPlugin();

  static const _androidChannel = AndroidNotificationDetails(
    'lynq_leads',
    'New Leads',
    channelDescription: 'Alerts when a new lead is captured on your card',
    importance: Importance.high,
    priority: Priority.high,
    icon: '@mipmap/ic_launcher',
    playSound: true,
  );

  static const _iosDetails = DarwinNotificationDetails(
    presentAlert: true,
    presentBadge: true,
    presentSound: true,
  );

  LeadPollingService({
    required LeadService leadService,
    required AuthService authService,
  })  : _leadService = leadService,
        _authService = authService;

  // ── Initialise notifications (call once in main()) ────────────────────────

  static Future<void> initNotifications() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: false, // we request manually below
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    await _notifs.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
    );

    // Request iOS permission at runtime
    await _notifs
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(alert: true, badge: true, sound: true);

    // Request Android 13+ permission
    await _notifs
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  Future<void> start() async {
    if (_started) return;
    _started = true;
    await _poll(); // immediate first fetch
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _poll());
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _started = false;
  }

  // ── Public helpers ────────────────────────────────────────────────────────

  /// Called when the user opens the Leads tab — clears the badge.
  void markSeen() {
    if (_newLeadCount > 0) {
      _newLeadCount = 0;
      notifyListeners();
    }
  }

  /// Force an immediate refresh (e.g. pull-to-refresh).
  Future<void> refresh({String? status}) async {
    _filterStatus = status ?? 'all';
    await _poll();
  }

  void setFilter(String status) {
    _filterStatus = status;
    _poll();
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  Future<void> _poll() async {
    final loggedIn = await _authService.isLoggedIn();
    if (!loggedIn) return;

    try {
      final status = _filterStatus == 'all' ? null : _filterStatus;
      final fresh = await _leadService.listLeads(status: status);

      if (_knownIds.isNotEmpty) {
        final newOnes = fresh.where((l) => !_knownIds.contains(l.id)).toList();
        if (newOnes.isNotEmpty) {
          _newLeadCount += newOnes.length;
          await _notify(newOnes);
        }
      }

      // Always update known IDs from the full unfiltered set
      if (status == null) {
        _knownIds = fresh.map((l) => l.id).toSet();
      }

      _leads = fresh;
      notifyListeners();
    } catch (_) {
      // Silent — background polling should never crash the app
    }
  }

  Future<void> _notify(List<LeadModel> newLeads) async {
    final count = newLeads.length;
    final title = count == 1
        ? '🎯 New Lead: ${newLeads.first.name}'
        : '🎯 $count New Leads Captured!';
    final body = count == 1
        ? newLeads.first.email ??
            newLeads.first.company ??
            'Tap to view details'
        : newLeads.map((l) => l.name).take(3).join(', ') +
            (count > 3 ? ' +${count - 3} more' : '');

    await _notifs.show(
      1001,
      title,
      body,
      const NotificationDetails(
        android: _androidChannel,
        iOS: _iosDetails,
      ),
    );
  }

  @override
  void dispose() {
    stop();
    super.dispose();
  }
}
