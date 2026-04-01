import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class AuthService {
  static const _tokenKey = 'lynq_auth_token';
  static const _userKey = 'lynq_user';

  final Dio _dio;
  final FlutterSecureStorage _storage;

  AuthService({Dio? dio, FlutterSecureStorage? storage})
      : _dio = dio ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage();

  /// Login and persist JWT token
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post(
      ApiConfig.loginUrl,
      data: {'email': email, 'password': password},
    );

    if (response.data['success'] == true) {
      final token = response.data['data']['token'] as String;
      final userData = response.data['data']['user'] as Map<String, dynamic>;

      await _storage.write(key: _tokenKey, value: token);
      await _storage.write(key: _userKey, value: jsonEncode(userData));

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

  /// Logout — clear stored credentials
  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
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
