import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/recipe.dart';
import '../models/shopping_item.dart';

class ApiService {
  final String baseUrl;

  ApiService(this.baseUrl);

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Map<String, String> get _headers => {'Content-Type': 'application/json'};

  Future<List<Recipe>> searchRecipes(String query, List<String> moods, Map<String, dynamic> filters) async {
    final res = await http.post(
      _uri('/api/search'),
      headers: _headers,
      body: jsonEncode({'query': query, 'moods': moods, 'filters': filters}),
    );
    if (res.statusCode != 200) throw Exception('Chyba při hledání: ${res.statusCode}');
    final data = jsonDecode(res.body) as List;
    return data.map((j) => Recipe.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<ShoppingItem>> getShoppingList() async {
    final res = await http.get(_uri('/api/mealie/shopping'));
    if (res.statusCode != 200) return [];
    final data = jsonDecode(res.body) as List;
    return data.map((j) => ShoppingItem.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<ShoppingItem?> addShoppingItem(Map<String, dynamic> item) async {
    final res = await http.post(
      _uri('/api/mealie/shopping'),
      headers: _headers,
      body: jsonEncode(item),
    );
    if (res.statusCode != 200) return null;
    return ShoppingItem.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<void> updateShoppingItem(String id, bool checked) async {
    await http.put(
      _uri('/api/mealie/shopping/$id'),
      headers: _headers,
      body: jsonEncode({'checked': checked}),
    );
  }

  Future<void> deleteShoppingItem(String id) async {
    await http.delete(_uri('/api/mealie/shopping/$id'));
  }

  Future<List<Map<String, dynamic>>> getRecentHistory() async {
    final res = await http.get(_uri('/api/mealie/history'));
    if (res.statusCode != 200) return [];
    final data = jsonDecode(res.body) as List;
    return data.take(2).map((j) => j as Map<String, dynamic>).toList();
  }

  Future<List<Map<String, dynamic>>> searchProducts(String query) async {
    final res = await http.get(_uri('/api/products/search?q=${Uri.encodeComponent(query)}'));
    if (res.statusCode != 200) return [];
    final data = jsonDecode(res.body) as List;
    return data.map((j) => j as Map<String, dynamic>).toList();
  }

  Future<void> saveToMealie(String url) async {
    await http.post(
      _uri('/api/mealie/recipes'),
      headers: _headers,
      body: jsonEncode({'url': url}),
    );
  }

  Future<void> proposeRecipe(Recipe recipe, String member) async {
    await http.post(
      _uri('/api/vote/propose'),
      headers: _headers,
      body: jsonEncode({'recipe': {'title': recipe.title, 'url': recipe.url, 'image': recipe.image}, 'proposedBy': member}),
    );
  }
}
