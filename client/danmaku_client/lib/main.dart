import 'package:flutter/material.dart';
import 'api_client.dart';

void main() {
  runApp(const DanmakuApp());
}

class DanmakuApp extends StatelessWidget {
  const DanmakuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Danmaku Client',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const VideoListPage(),
    );
  }
}

class VideoListPage extends StatefulWidget {
  const VideoListPage({super.key});

  @override
  State<VideoListPage> createState() => _VideoListPageState();
}

class _VideoListPageState extends State<VideoListPage> {
  final ApiClient _apiClient = ApiClient();
  List<VideoInfo> _videos = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadVideos();
  }

  Future<void> _loadVideos() async {
    try {
      final videos = await _apiClient.getVideos();
      setState(() {
        _videos = videos;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danmaku Videos'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text('Error: $_error'))
          : ListView.builder(
              itemCount: _videos.length,
              itemBuilder: (context, index) {
                final video = _videos[index];
                return ListTile(
                  title: Text(video.videoId),
                  subtitle: Text('CID: ${video.cid}'),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            DanmakuPage(videoId: video.videoId),
                      ),
                    );
                  },
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadVideos,
        child: const Icon(Icons.refresh),
      ),
    );
  }
}

class DanmakuPage extends StatefulWidget {
  final String videoId;

  const DanmakuPage({super.key, required this.videoId});

  @override
  State<DanmakuPage> createState() => _DanmakuPageState();
}

class _DanmakuPageState extends State<DanmakuPage> {
  final ApiClient _apiClient = ApiClient();
  List<Danmaku> _danmakus = [];
  bool _isLoading = true;
  String? _error;
  double _selectedTime = 0.0;
  double _maxTime = 0.0;

  @override
  void initState() {
    super.initState();
    _loadDanmakus();
  }

  Future<void> _loadDanmakus() async {
    try {
      final danmakus = await _apiClient.getDanmakus(widget.videoId);
      double maxTime = 0.0;
      for (final danmaku in danmakus) {
        if (danmaku.time > maxTime) {
          maxTime = danmaku.time;
        }
      }
      setState(() {
        _danmakus = danmakus;
        _maxTime = maxTime;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _parseColor(String hexColor) {
    try {
      hexColor = hexColor.replaceAll('#', '');
      if (hexColor.length == 6) {
        hexColor = 'FF$hexColor';
      }
      return Color(int.parse(hexColor, radix: 16));
    } catch (e) {
      return Colors.white;
    }
  }

  List<Danmaku> get _filteredDanmakus {
    if (_selectedTime == 0.0) {
      return _danmakus;
    }
    // Show danmakus within 5 seconds of selected time
    return _danmakus
        .where((d) => (d.time - _selectedTime).abs() <= 5.0)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Danmakus - ${widget.videoId}'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text('Error: $_error'))
          : Column(
              children: [
                // Time slider
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Text(
                        'Time: ${_selectedTime.toStringAsFixed(1)}s',
                        style: const TextStyle(fontSize: 16),
                      ),
                      Slider(
                        value: _selectedTime,
                        min: 0.0,
                        max: _maxTime > 0 ? _maxTime : 1.0,
                        divisions: _maxTime > 0 ? (_maxTime * 10).toInt() : 10,
                        onChanged: (value) {
                          setState(() {
                            _selectedTime = value;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                // Danmaku list
                Expanded(
                  child: ListView.builder(
                    itemCount: _filteredDanmakus.length,
                    itemBuilder: (context, index) {
                      final danmaku = _filteredDanmakus[index];
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 60,
                              alignment: Alignment.centerRight,
                              child: Text(
                                '${danmaku.time.toStringAsFixed(1)}s',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                danmaku.content,
                                style: TextStyle(
                                  color: _parseColor(danmaku.color),
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                danmaku.type,
                                style: TextStyle(
                                  color: Colors.grey[700],
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadDanmakus,
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
