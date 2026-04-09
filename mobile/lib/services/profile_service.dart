import 'dart:io';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/profile_model.dart';
import 'auth_service.dart';

class ProfileService {
  final Dio _dio;
  final AuthService _auth;

  ProfileService({Dio? dio, required AuthService auth})
      : _dio = dio ??
            Dio(BaseOptions(
              // Accept all status codes — we read success/error from the JSON body
              validateStatus: (_) => true,
              connectTimeout: const Duration(seconds: 15),
              receiveTimeout: const Duration(seconds: 15),
            )),
        _auth = auth;

  // ── Error helper ─────────────────────────────────────────────────────────

  String _err(dynamic data, String fallback) {
    if (data is Map) {
      return (data['error'] ?? data['message'] ?? fallback).toString();
    }
    return fallback;
  }

  // ── Profiles ──────────────────────────────────────────────────────────────

  Future<List<ProfileModel>> listProfiles() async {
    try {
      final headers = await _auth.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.profilesUrl,
        options: Options(headers: headers),
      );
      if (response.data['success'] == true) {
        final data = response.data['data'];
        if (data is List) {
          return data
              .map((json) => ProfileModel.fromJson(json as Map<String, dynamic>))
              .toList();
        }
        return [];
      }
      throw Exception(_err(response.data, 'Failed to fetch profiles'));
    } on DioException catch (e) {
      throw Exception(_err(e.response?.data, 'Could not reach server'));
    }
  }

  Future<ProfileModel> getProfile(String id) async {
    try {
      final headers = await _auth.getAuthHeaders();
      final response = await _dio.get(
        ApiConfig.profileUrl(id),
        options: Options(headers: headers),
      );
      if (response.data['success'] == true) {
        return ProfileModel.fromJson(
            response.data['data'] as Map<String, dynamic>);
      }
      throw Exception(_err(response.data, 'Profile not found'));
    } on DioException catch (e) {
      throw Exception(_err(e.response?.data, 'Could not reach server'));
    }
  }

  Future<ProfileModel> createProfile(ProfileModel profile) async {
    try {
      final headers = await _auth.getAuthHeaders();
      final response = await _dio.post(
        ApiConfig.profilesUrl,
        data: profile.toJson(),
        options: Options(headers: headers),
      );
      if (response.data['success'] == true) {
        return ProfileModel.fromJson(
            response.data['data'] as Map<String, dynamic>);
      }
      throw Exception(_err(response.data, 'Failed to create profile'));
    } on DioException catch (e) {
      throw Exception(_err(e.response?.data, 'Could not reach server'));
    }
  }

  Future<ProfileModel> updateProfile(String id, ProfileModel profile) async {
    try {
      final headers = await _auth.getAuthHeaders();
      final response = await _dio.put(
        ApiConfig.profileUrl(id),
        data: profile.toJson(),
        options: Options(headers: headers),
      );
      if (response.data['success'] == true) {
        return ProfileModel.fromJson(
            response.data['data'] as Map<String, dynamic>);
      }
      throw Exception(_err(response.data, 'Failed to update profile'));
    } on DioException catch (e) {
      throw Exception(_err(e.response?.data, 'Could not reach server'));
    }
  }

  Future<void> deleteProfile(String id) async {
    try {
      final headers = await _auth.getAuthHeaders();
      final response = await _dio.delete(
        ApiConfig.profileUrl(id),
        options: Options(headers: headers),
      );
      if (response.data['success'] != true) {
        throw Exception(_err(response.data, 'Failed to delete profile'));
      }
    } on DioException catch (e) {
      throw Exception(_err(e.response?.data, 'Could not reach server'));
    }
  }

  Future<bool> isUsernameAvailable(String username) async {
    try {
      final response =
          await _dio.get(ApiConfig.checkUsernameUrl(username));
      return response.data['data']?['available'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Uploads [file] to the backend and returns the CDN URL.
  /// [type] must be 'avatar', 'logo', or 'banner'.
  Future<String> uploadImage(File file, String type) async {
    try {
      final headers = await _auth.getAuthHeaders();
      // Remove Content-Type so Dio sets multipart boundary automatically
      headers.remove('Content-Type');

      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          file.path,
          filename: file.path.split('/').last,
        ),
        'type': type,
      });

      final response = await _dio.post(
        ApiConfig.uploadUrl,
        data: formData,
        options: Options(headers: headers),
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        if (data is Map && data['url'] != null) {
          return data['url'].toString();
        }
      }
      throw Exception(_err(response.data, 'Upload failed'));
    } on DioException catch (e) {
      throw Exception(_err(e.response?.data, 'Upload failed — check connection'));
    }
  }
}
