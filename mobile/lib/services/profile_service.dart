import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/profile_model.dart';
import 'auth_service.dart';

class ProfileService {
  final Dio _dio;
  final AuthService _auth;

  ProfileService({Dio? dio, required AuthService auth})
      : _dio = dio ?? Dio(),
        _auth = auth;

  Future<List<ProfileModel>> listProfiles() async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.get(ApiConfig.profilesUrl, options: Options(headers: headers));
    if (response.data['success'] == true) {
      return (response.data['data'] as List)
          .map((json) => ProfileModel.fromJson(json))
          .toList();
    }
    throw Exception(response.data['error'] ?? 'Failed to fetch profiles');
  }

  Future<ProfileModel> getProfile(String id) async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.get(ApiConfig.profileUrl(id), options: Options(headers: headers));
    if (response.data['success'] == true) {
      return ProfileModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['error'] ?? 'Profile not found');
  }

  Future<ProfileModel> createProfile(ProfileModel profile) async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.post(
      ApiConfig.profilesUrl,
      data: profile.toJson(),
      options: Options(headers: headers),
    );
    if (response.data['success'] == true) {
      return ProfileModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['error'] ?? 'Failed to create profile');
  }

  Future<ProfileModel> updateProfile(String id, ProfileModel profile) async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.put(
      ApiConfig.profileUrl(id),
      data: profile.toJson(),
      options: Options(headers: headers),
    );
    if (response.data['success'] == true) {
      return ProfileModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['error'] ?? 'Failed to update profile');
  }

  Future<void> deleteProfile(String id) async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.delete(ApiConfig.profileUrl(id), options: Options(headers: headers));
    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Failed to delete profile');
    }
  }

  Future<bool> isUsernameAvailable(String username) async {
    final response = await _dio.get(ApiConfig.checkUsernameUrl(username));
    return response.data['data']?['available'] == true;
  }
}
