import 'dart:convert';
import 'package:http/http.dart' as http;

class Danmaku {
  final double time;
  final String content;
  final String type;
  final String color;
  final String source;

  Danmaku({
    required this.time,
    required this.content,
    required this.type,
    required this.color,
    required this.source,
  });

  factory Danmaku.fromJson(Map<String, dynamic> json) {
    return Danmaku(
      time: json['time']?.toDouble() ?? 0.0,
      content: json['content'] ?? '',
      type: json['type'] ?? 'scroll',
      color: json['color'] ?? '#ffffff',
      source: json['source'] ?? 'bilibili',
    );
  }
}

class VideoInfo {
  final int id;
  final String videoId;
  final String cid;
  final String? title;
  final String source;
  final String createdAt;

  VideoInfo({
    required this.id,
    required this.videoId,
    required this.cid,
    this.title,
    required this.source,
    required this.createdAt,
  });

  factory VideoInfo.fromJson(Map<String, dynamic> json) {
    return VideoInfo(
      id: json['id'] ?? 0,
      videoId: json['video_id'] ?? '',
      cid: json['cid'] ?? '',
      title: json['title'],
      source: json['source'] ?? 'bilibili',
      createdAt: json['created_at'] ?? '',
    );
  }
}

class ApiClient {
  final String baseUrl;

  ApiClient({
    this.baseUrl = 'http://10.0.2.2:3000',
  }); // Android emulator uses 10.0.2.2 for localhost

  Future<List<VideoInfo>> getVideos() async {
    final response = await http.get(Uri.parse('$baseUrl/api/videos'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final videos = data['videos'] as List;
      return videos.map((v) => VideoInfo.fromJson(v)).toList();
    } else {
      throw Exception('Failed to load videos');
    }
  }

  Future<List<Danmaku>> getDanmakus(String videoId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/videos/$videoId/danmakus'),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final danmakus = data['danmakus'] as List;
      return danmakus.map((d) => Danmaku.fromJson(d)).toList();
    } else {
      throw Exception('Failed to load danmakus');
    }
  }

  Future<List<Danmaku>> getDanmakusInRange(
    String videoId,
    double from,
    double to,
  ) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/videos/$videoId/danmakus/range?from=$from&to=$to',
      ),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final danmakus = data['danmakus'] as List;
      return danmakus.map((d) => Danmaku.fromJson(d)).toList();
    } else {
      throw Exception('Failed to load danmakus');
    }
  }
}
