class LeadModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? company;
  final String? intent;
  final String source; // qr | nfc | link | chat
  final String status; // new | contacted | qualified | converted | lost
  final int? score;
  final List<String> tags;
  final String notes;
  final DateTime createdAt;

  LeadModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.company,
    this.intent,
    required this.source,
    required this.status,
    this.score,
    this.tags = const [],
    this.notes = '',
    required this.createdAt,
  });

  factory LeadModel.fromJson(Map<String, dynamic> json) => LeadModel(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
        name: json['name'] ?? '',
        email: json['email'],
        phone: json['phone'],
        company: json['company'],
        intent: json['intent'],
        source: json['source'] ?? 'link',
        status: json['status'] ?? 'new',
        score: json['score'],
        tags: List<String>.from(json['tags'] ?? []),
        notes: json['notes'] ?? '',
        createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      );

  String get statusLabel {
    switch (status) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'qualified': return 'Qualified';
      case 'converted': return 'Converted';
      case 'lost': return 'Lost';
      default: return status;
    }
  }

  String get sourceLabel {
    switch (source) {
      case 'qr': return 'QR Scan';
      case 'nfc': return 'NFC Tap';
      case 'link': return 'Link';
      case 'chat': return 'AI Chat';
      default: return source;
    }
  }
}
