class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;
  final String tenantId;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.tenantId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] ?? '',
        email: json['email'] ?? '',
        name: json['name'] ?? '',
        role: json['role'] ?? 'user',
        tenantId: json['tenantId'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role,
        'tenantId': tenantId,
      };
}

class TenantModel {
  final String id;
  final String name;
  final String email;
  final String subscriptionTier;

  TenantModel({
    required this.id,
    required this.name,
    required this.email,
    required this.subscriptionTier,
  });

  factory TenantModel.fromJson(Map<String, dynamic> json) => TenantModel(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        subscriptionTier: json['subscriptionTier'] ?? 'free',
      );
}
