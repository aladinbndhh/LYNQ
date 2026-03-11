class BrandingModel {
  final String primaryColor;
  final String? logo;
  final String? customDomain;
  final String theme; // light | dark | gradient | glass | neon

  BrandingModel({
    this.primaryColor = '#3b82f6',
    this.logo,
    this.customDomain,
    this.theme = 'light',
  });

  factory BrandingModel.fromJson(Map<String, dynamic> json) => BrandingModel(
        primaryColor: json['primaryColor'] ?? '#3b82f6',
        logo: json['logo'],
        customDomain: json['customDomain'],
        theme: json['theme'] ?? 'light',
      );

  Map<String, dynamic> toJson() => {
        'primaryColor': primaryColor,
        if (logo != null) 'logo': logo,
        if (customDomain != null) 'customDomain': customDomain,
        'theme': theme,
      };

  BrandingModel copyWith({
    String? primaryColor,
    String? logo,
    String? customDomain,
    String? theme,
  }) =>
      BrandingModel(
        primaryColor: primaryColor ?? this.primaryColor,
        logo: logo ?? this.logo,
        customDomain: customDomain ?? this.customDomain,
        theme: theme ?? this.theme,
      );
}

class ContactInfoModel {
  final String? email;
  final String? phone;
  final String? linkedin;
  final String? twitter;

  ContactInfoModel({this.email, this.phone, this.linkedin, this.twitter});

  factory ContactInfoModel.fromJson(Map<String, dynamic> json) =>
      ContactInfoModel(
        email: json['email'],
        phone: json['phone'],
        linkedin: json['linkedin'],
        twitter: json['twitter'],
      );

  Map<String, dynamic> toJson() => {
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (linkedin != null) 'linkedin': linkedin,
        if (twitter != null) 'twitter': twitter,
      };
}

class AiConfigModel {
  final bool enabled;
  final String personality;
  final String greeting;
  final bool autoBooking;

  AiConfigModel({
    this.enabled = true,
    this.personality = 'professional and friendly',
    this.greeting = 'Hello! How can I help you today?',
    this.autoBooking = true,
  });

  factory AiConfigModel.fromJson(Map<String, dynamic> json) => AiConfigModel(
        enabled: json['enabled'] ?? true,
        personality: json['personality'] ?? 'professional and friendly',
        greeting: json['greeting'] ?? 'Hello! How can I help you today?',
        autoBooking: json['autoBooking'] ?? true,
      );

  Map<String, dynamic> toJson() => {
        'enabled': enabled,
        'personality': personality,
        'greeting': greeting,
        'autoBooking': autoBooking,
      };
}

class ProfileModel {
  final String? id;
  final String username;
  final String displayName;
  final String title;
  final String company;
  final String bio;
  final String? avatar;
  final String? coverImage;
  final BrandingModel branding;
  final ContactInfoModel contactInfo;
  final AiConfigModel aiConfig;
  final String? qrCode;
  final bool isPublic;
  final DateTime? createdAt;

  ProfileModel({
    this.id,
    required this.username,
    required this.displayName,
    this.title = '',
    this.company = '',
    this.bio = '',
    this.avatar,
    this.coverImage,
    BrandingModel? branding,
    ContactInfoModel? contactInfo,
    AiConfigModel? aiConfig,
    this.qrCode,
    this.isPublic = true,
    this.createdAt,
  })  : branding = branding ?? BrandingModel(),
        contactInfo = contactInfo ?? ContactInfoModel(),
        aiConfig = aiConfig ?? AiConfigModel();

  factory ProfileModel.fromJson(Map<String, dynamic> json) => ProfileModel(
        id: json['_id']?.toString() ?? json['id']?.toString(),
        username: json['username'] ?? '',
        displayName: json['displayName'] ?? '',
        title: json['title'] ?? '',
        company: json['company'] ?? '',
        bio: json['bio'] ?? '',
        avatar: json['avatar'],
        coverImage: json['coverImage'],
        branding: json['branding'] != null
            ? BrandingModel.fromJson(json['branding'])
            : BrandingModel(),
        contactInfo: json['contactInfo'] != null
            ? ContactInfoModel.fromJson(json['contactInfo'])
            : ContactInfoModel(),
        aiConfig: json['aiConfig'] != null
            ? AiConfigModel.fromJson(json['aiConfig'])
            : AiConfigModel(),
        qrCode: json['qrCode'],
        isPublic: json['isPublic'] ?? true,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'])
            : null,
      );

  Map<String, dynamic> toJson() => {
        'username': username,
        'displayName': displayName,
        'title': title,
        'company': company,
        'bio': bio,
        if (avatar != null) 'avatar': avatar,
        if (coverImage != null) 'coverImage': coverImage,
        'branding': branding.toJson(),
        'contactInfo': contactInfo.toJson(),
        'aiConfig': aiConfig.toJson(),
        'isPublic': isPublic,
      };
}
