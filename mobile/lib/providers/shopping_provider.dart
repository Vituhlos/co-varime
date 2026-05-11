import 'package:flutter/foundation.dart';
import '../models/shopping_item.dart';
import '../services/api_service.dart';
import '../services/ws_service.dart';

class ShoppingProvider extends ChangeNotifier {
  final ApiService api;
  final WsService ws;

  List<ShoppingItem> _items = [];
  bool _loading = false;

  ShoppingProvider(this.api, this.ws) {
    ws.events.listen((event) {
      const syncEvents = ['item_added', 'item_checked', 'item_deleted', 'list_cleared'];
      if (syncEvents.contains(event['type'])) refresh();
    });
  }

  List<ShoppingItem> get items => _items;
  bool get loading => _loading;

  Map<String, List<ShoppingItem>> get grouped {
    final map = <String, List<ShoppingItem>>{};
    for (final item in _items) {
      (map[item.group] ??= []).add(item);
    }
    return map;
  }

  Future<void> refresh() async {
    _loading = true;
    notifyListeners();
    try {
      _items = await api.getShoppingList();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> toggle(String id, bool checked) async {
    final idx = _items.indexWhere((i) => i.id == id);
    if (idx == -1) return;
    _items[idx].checked = checked;
    notifyListeners();
    await api.updateShoppingItem(id, checked);
  }

  Future<void> delete(String id) async {
    _items.removeWhere((i) => i.id == id);
    notifyListeners();
    await api.deleteShoppingItem(id);
  }

  Future<void> add(Map<String, dynamic> item) async {
    final newItem = await api.addShoppingItem(item);
    if (newItem != null) {
      _items.add(newItem);
      notifyListeners();
    }
  }

  Future<void> clearChecked() async {
    final toDelete = _items.where((i) => i.checked).map((i) => i.id).toList();
    _items.removeWhere((i) => i.checked);
    notifyListeners();
    for (final id in toDelete) {
      await api.deleteShoppingItem(id);
    }
  }
}
