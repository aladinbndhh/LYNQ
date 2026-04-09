class BrandingModel {
  final String primaryColor;
  final String? logo;       // company logo URL
  final String? bannerUrl;  // company banner image URL (cards + signatures)
  final String? customDomain;
  final String theme; // light | dark | gradient | glass | neon

  BrandingModel({
    this.primaryColor = '#3b82f6',
    this.logo,
    this.bannerUrl,
    this.customDomain,
    this.theme = 'light',
  });

  factory BrandingModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    final logo      = json['logo']?.toString();
    final bannerUrl = json['bannerUrl']?.toString();
    return BrandingModel(
      primaryColor: json['primaryColor']?.toString() ?? '#3b82f6',
      logo:         (logo      != null && logo.isNotEmpty)      ? logo      : null,
      bannerUrl:    (bannerUrl != null && bannerUrl.isNotEmpty) ? bannerUrl : null,
      customDomain: json['customDomain']?.toString(),
      theme:        json['theme']?.toString() ?? 'light',
    );
  }

  Map<String, dynamic> toJson() => {
        'primaryColor': primaryColor,
        if (logo != null) 'logo': logo,
        if (bannerUrl != null) 'bannerUrl': bannerUrl,
        if (customDomain != null) 'customDomain': customDomain,
        'theme': theme,
      };

  BrandingModel copyWith({
    String? primaryColor,
    String? logo,
    String? bannerUrl,
    String? customDomain,
    String? theme,
  }) =>
      BrandingModel(
        primaryColor: primaryColor ?? this.primaryColor,
        logo: logo ?? this.logo,
        bannerUrl: bannerUrl ?? this.bannerUrl,
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

  factory ContactInfoModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    return ContactInfoModel(
      email:    json['email']?.toString(),
      phone:    json['phone']?.toString(),
      linkedin: json['linkedin']?.toString(),
      twitter:  json['twitter']?.toString(),
    );
  }

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

  factory AiConfigModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    return AiConfigModel(
      enabled:     json['enabled']     is bool ? json['enabled']     : true,
      personality: json['personality']?.toString() ?? 'professional and friendly',
      greeting:    json['greeting']?.toString()    ?? 'Hello! How can I help you today?',
      autoBooking: json['autoBooking'] is bool ? json['autoBooking'] : true,
    );
  }

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

  factory ProfileModel.fromJson(dynamic raw) {
    // Guard: if the server returns a List instead of a Map, take the first item
    final Map<String, dynamic> json;
    if (raw is List) {
      json = raw.isNotEmpty && raw.first is Map<String, dynamic>
          ? raw.first as Map<String, dynamic>
          : {};
    } else if (raw is Map<String, dynamic>) {
      json = raw;
    } else {
      json = {};
    }

    final avatar     = json['avatar']?.toString();
    final coverImage = json['coverImage']?.toString();
    return ProfileModel(
      id:          json['_id']?.toString() ?? json['id']?.toString(),
      username:    json['username']?.toString()    ?? '',
      displayName: json['displayName']?.toString() ?? '',
      title:       json['title']?.toString()       ?? '',
      company:     json['company']?.toString()     ?? '',
      bio:         json['bio']?.toString()         ?? '',
      avatar:      (avatar     != null && avatar.isNotEmpty)     ? avatar     : null,
      coverImage:  (coverImage != null && coverImage.isNotEmpty) ? coverImage : null,
      branding:    BrandingModel.fromJson(json['branding']),
      contactInfo: ContactInfoModel.fromJson(json['contactInfo']),
      aiConfig:    AiConfigModel.fromJson(json['aiConfig']),
      qrCode:      json['qrCode']?.toString(),
      isPublic:    json['isPublic'] is bool ? json['isPublic'] : true,
      createdAt:   json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

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
