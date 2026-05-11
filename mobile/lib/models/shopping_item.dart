class ShoppingItem {
  final String id;
  final String name;
  final double? quantity;
  final String? unit;
  final String group;
  bool checked;

  ShoppingItem({
    required this.id,
    required this.name,
    this.quantity,
    this.unit,
    this.group = 'Ostatní',
    this.checked = false,
  });

  factory ShoppingItem.fromJson(Map<String, dynamic> j) => ShoppingItem(
        id: j['id']?.toString() ?? '',
        name: j['note'] ?? j['name'] ?? '',
        quantity: j['quantity'] is num ? (j['quantity'] as num).toDouble() : null,
        unit: j['unit'],
        group: j['group'] ?? j['label']?['name'] ?? 'Ostatní',
        checked: j['checked'] == true,
      );
}
