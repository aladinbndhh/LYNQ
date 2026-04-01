import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../config/api_config.dart';

class AuthService {
  static const _tokenKey = 'lynq_auth_token';
  static const _userKey = 'lynq_user';

  final Dio _dio;
  final FlutterSecureStorage _storage;

  // Google Sign-In instance — serverClientId is needed to get an ID token
  // that the backend can verify via Google's tokeninfo endpoint.
  late final GoogleSignIn _googleSignIn;

  AuthService({Dio? dio, FlutterSecureStorage? storage})
      : _dio = dio ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage() {
    _googleSignIn = GoogleSignIn(
      serverClientId: ApiConfig.googleClientId.isNotEmpty
          ? ApiConfig.googleClientId
          : null,
      scopes: ['email', 'profile'],
    );
  }

  // ── Email / Password ────────────────────────────────────────────────────────

  /// Login with email + password and persist JWT token
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post(
      ApiConfig.loginUrl,
      data: {'email': email, 'password': password},
    );

    if (response.data['success'] == true) {
      await _persistSession(response.data['data']);
      return response.data['data'];
    } else {
      throw Exception(response.data['error'] ?? 'Login failed');
    }
  }

  /// Register a new account — returns after sending OTP (does NOT auto-login)
  Future<void> signup({
    required String name,
    required String email,
    required String password,
    required String companyName,
  }) async {
    final response = await _dio.post(
      ApiConfig.signupUrl,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'companyName': companyName,
      },
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Signup failed');
    }
  }

  /// Verify the OTP code sent to email
  Future<void> verifyOtp({required String email, required String code}) async {
    final response = await _dio.post(
      ApiConfig.verifyOtpUrl,
      data: {'email': email, 'code': code},
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Verification failed');
    }
  }

  /// Resend OTP to email
  Future<void> resendOtp({required String email}) async {
    final response = await _dio.post(
      ApiConfig.resendOtpUrl,
      data: {'email': email},
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Failed to resend code');
    }
  }

  // ── Google Sign-In ──────────────────────────────────────────────────────────

  /// Sign in with Google and exchange the ID token for a LynQ JWT.
  /// Returns the session data map on success.
  Future<Map<String, dynamic>> loginWithGoogle() async {
    // Trigger the Google account picker
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) {
      throw Exception('Google sign-in cancelled');
    }

    // Get the auth tokens (includes idToken)
    final googleAuth = await googleUser.authentication;
    final idToken = googleAuth.idToken;

    if (idToken == null) {
      // Sign out of Google so the user can try again cleanly
      await _googleSignIn.signOut();
      throw Exception(
        'Could not get Google ID token.\n'
        'Make sure your Google Cloud OAuth client is configured correctly.',
      );
    }

    // Exchange with LynQ backend
    final response = await _dio.post(
      ApiConfig.googleAuthUrl,
      data: {'idToken': idToken},
    );

    if (response.data['success'] == true) {
      await _persistSession(response.data['data']);
      return response.data['data'];
    } else {
      await _googleSignIn.signOut();
      throw Exception(response.data['error'] ?? 'Google sign-in failed');
    }
  }

  /// Disconnect Google account on logout
  Future<void> _disconnectGoogle() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
  }

  // ── Session helpers ─────────────────────────────────────────────────────────

  Future<void> _persistSession(Map<String, dynamic> data) async {
    final token = data['token'] as String;
    final userData = data['user'] as Map<String, dynamic>;
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(userData));
  }

  /// Get stored JWT token
  Future<String?> getToken() => _storage.read(key: _tokenKey);

  /// Get stored user data
  Future<Map<String, dynamic>?> getUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Logout — clear stored credentials and disconnect Google
  Future<void> logout() async {
    await Future.wait([
      _storage.delete(key: _tokenKey),
      _storage.delete(key: _userKey),
      _disconnectGoogle(),
    ]);
  }

  /// Build auth headers for API calls
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }
}
