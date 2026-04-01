import 'dart:async';
import 'dart:convert';
import 'package:app_links/app_links.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/api_config.dart';

class AuthService {
  static const _tokenKey = 'lynq_auth_token';
  static const _userKey = 'lynq_user';

  final Dio _dio;
  final FlutterSecureStorage _storage;
  final AppLinks _appLinks = AppLinks();

  AuthService({Dio? dio, FlutterSecureStorage? storage})
      : _dio = dio ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage();

  // ── Email / Password ────────────────────────────────────────────────────────

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

  Future<void> verifyOtp({required String email, required String code}) async {
    final response = await _dio.post(
      ApiConfig.verifyOtpUrl,
      data: {'email': email, 'code': code},
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Verification failed');
    }
  }

  Future<void> resendOtp({required String email}) async {
    final response = await _dio.post(
      ApiConfig.resendOtpUrl,
      data: {'email': email},
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Failed to resend code');
    }
  }

  // ── Google Sign-In (browser OAuth, same flow as the website) ───────────────

  /// Opens Google OAuth in the system browser — exactly like the website.
  /// When Google redirects back to the backend, the backend issues a JWT and
  /// redirects to  lynq://auth?token=...  which this method catches.
  Future<Map<String, dynamic>> loginWithGoogle() async {
    // 1. Ask the backend for the Google OAuth URL
    final resp = await _dio.get(ApiConfig.googleStartUrl);
    final oauthUrl = resp.data['url'] as String?;
    if (oauthUrl == null) {
      throw Exception(resp.data['error'] ?? 'Failed to start Google sign-in');
    }

    // 2. Bridge between the deep-link stream and this async call
    final completer = Completer<Map<String, dynamic>>();
    StreamSubscription<Uri>? sub;

    sub = _appLinks.uriLinkStream.listen((uri) async {
      // Only handle lynq://auth deep links
      if (uri.scheme != 'lynq' || uri.host != 'auth') return;
      await sub?.cancel();

      final error = uri.queryParameters['error'];
      if (error != null) {
        completer.completeError(Exception(
          error == 'cancelled'
              ? 'Google sign-in cancelled'
              : 'Google sign-in failed: $error',
        ));
        return;
      }

      final token = uri.queryParameters['token'];
      if (token == null) {
        completer.completeError(Exception('No token received'));
        return;
      }

      final userData = {
        'id': '',
        'name': uri.queryParameters['name'] ?? '',
        'email': uri.queryParameters['email'] ?? '',
        'role': uri.queryParameters['role'] ?? 'admin',
        'tenantId': uri.queryParameters['tenantId'] ?? '',
        'avatar': uri.queryParameters['avatar'],
      };

      await _persistSession({'token': token, 'user': userData});
      completer.complete({'token': token, 'user': userData});
    });

    // 3. Open the Google OAuth page in the system browser
    final uri = Uri.parse(oauthUrl);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      await sub.cancel();
      throw Exception('Could not open browser for Google sign-in');
    }

    // 4. Wait for deep link (5 minute timeout)
    return completer.future.timeout(
      const Duration(minutes: 5),
      onTimeout: () {
        sub?.cancel();
        throw Exception('Google sign-in timed out');
      },
    );
  }

  // ── Session helpers ─────────────────────────────────────────────────────────

  Future<void> _persistSession(Map<String, dynamic> data) async {
    final token = data['token'] as String;
    final userData = data['user'] as Map<String, dynamic>;
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(userData));
  }

  Future<String?> getToken() => _storage.read(key: _tokenKey);

  Future<Map<String, dynamic>?> getUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await Future.wait([
      _storage.delete(key: _tokenKey),
      _storage.delete(key: _userKey),
    ]);
  }

  Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }
}
