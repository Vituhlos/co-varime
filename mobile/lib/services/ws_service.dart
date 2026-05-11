import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class WsService {
  final String baseUrl;
  WebSocketChannel? _channel;
  final _controller = StreamController<Map<String, dynamic>>.broadcast();
  bool _disposed = false;

  WsService(this.baseUrl);

  Stream<Map<String, dynamic>> get events => _controller.stream;

  void connect() {
    if (_disposed) return;
    final wsUrl = baseUrl.replaceFirst('http://', 'ws://').replaceFirst('https://', 'wss://');
    try {
      _channel = WebSocketChannel.connect(Uri.parse('$wsUrl/ws'));
      _channel!.stream.listen(
        (data) {
          try {
            final msg = jsonDecode(data as String) as Map<String, dynamic>;
            _controller.add(msg);
          } catch (_) {}
        },
        onDone: _reconnect,
        onError: (_) => _reconnect(),
      );
    } catch (_) {
      _reconnect();
    }
  }

  void _reconnect() {
    if (_disposed) return;
    Future.delayed(const Duration(seconds: 3), connect);
  }

  void dispose() {
    _disposed = true;
    _channel?.sink.close();
    _controller.close();
  }
}
