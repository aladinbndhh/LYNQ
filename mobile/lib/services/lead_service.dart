import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/lead_model.dart';
import 'auth_service.dart';

class LeadService {
  final Dio _dio;
  final AuthService _auth;

  LeadService({Dio? dio, required AuthService auth})
      : _dio = dio ?? Dio(),
        _auth = auth;

  Future<List<LeadModel>> listLeads({
    String? profileId,
    String? status,
    String? source,
  }) async {
    final headers = await _auth.getAuthHeaders();
    final params = <String, String>{};
    if (profileId != null) params['profileId'] = profileId;
    if (status != null) params['status'] = status;
    if (source != null) params['source'] = source;

    final response = await _dio.get(
      ApiConfig.leadsUrl,
      queryParameters: params,
      options: Options(headers: headers),
    );
    if (response.data['success'] == true) {
      return (response.data['data'] as List)
          .map((json) => LeadModel.fromJson(json))
          .toList();
    }
    throw Exception(response.data['error'] ?? 'Failed to fetch leads');
  }

  Future<Map<String, dynamic>> getLeadStats() async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.get(ApiConfig.leadStatsUrl, options: Options(headers: headers));
    if (response.data['success'] == true) {
      return Map<String, dynamic>.from(response.data['data']);
    }
    throw Exception(response.data['error'] ?? 'Failed to fetch stats');
  }

  Future<LeadModel> updateLead(String id, Map<String, dynamic> data) async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.put(
      ApiConfig.leadUrl(id),
      data: data,
      options: Options(headers: headers),
    );
    if (response.data['success'] == true) {
      return LeadModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['error'] ?? 'Failed to update lead');
  }

  Future<void> deleteLead(String id) async {
    final headers = await _auth.getAuthHeaders();
    final response = await _dio.delete(ApiConfig.leadUrl(id), options: Options(headers: headers));
    if (response.data['success'] != true) {
      throw Exception(response.data['error'] ?? 'Failed to delete lead');
    }
  }
}
