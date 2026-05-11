import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ConfigProvider extends ChangeNotifier {
  static const _keyUrl = 'backendUrl';
  static const _keyMember = 'activeMember';
  static const _defaultUrl = 'http://192.168.1.114:3000';

  String _backendUrl = _defaultUrl;
  String _activeMember = 'J';
  bool _loaded = false;

  String get backendUrl => _backendUrl;
  String get activeMember => _activeMember;
  bool get loaded => _loaded;
  bool get needsSetup => _backendUrl == _defaultUrl && !_loaded;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _backendUrl = prefs.getString(_keyUrl) ?? _defaultUrl;
    _activeMember = prefs.getString(_keyMember) ?? 'J';
    _loaded = true;
    notifyListeners();
  }

  Future<void> setBackendUrl(String url) async {
    _backendUrl = url.trim().replaceAll(RegExp(r'/+$'), '');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUrl, _backendUrl);
    notifyListeners();
  }

  Future<void> setActiveMember(String member) async {
    _activeMember = member;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyMember, member);
    notifyListeners();
  }
}
