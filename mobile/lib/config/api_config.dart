/// API configuration — update baseUrl for production
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );

  static const String apiVersion = '/api';

  // Auth endpoints
  static String get loginUrl => '$baseUrl$apiVersion/auth/mobile/login';
  static String get signupUrl => '$baseUrl$apiVersion/auth/signup';

  // Profile endpoints
  static String get profilesUrl => '$baseUrl$apiVersion/profiles';
  static String profileUrl(String id) => '$baseUrl$apiVersion/profiles/$id';
  static String profileSignatureUrl(String id) =>
      '$baseUrl$apiVersion/profiles/$id/signature';
  static String checkUsernameUrl(String username) =>
      '$baseUrl$apiVersion/profiles/check-username?username=$username';

  // Leads endpoints
  static String get leadsUrl => '$baseUrl$apiVersion/leads';
  static String leadUrl(String id) => '$baseUrl$apiVersion/leads/$id';
  static String get leadStatsUrl => '$baseUrl$apiVersion/leads/stats';

  // Analytics
  static String get analyticsUrl => '$baseUrl$apiVersion/analytics/dashboard';

  // Billing
  static String get billingStatusUrl => '$baseUrl$apiVersion/billing/status';
  static String get stripePortalUrl => '$baseUrl$apiVersion/stripe/portal';

  // Public card URL
  static String publicCardUrl(String username) => '$baseUrl/$username';
}
