import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/config_provider.dart';
import '../providers/shopping_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../widgets/orbs_background.dart';

const _units = ['ks', 'g', 'kg', 'ml', 'l', 'balení'];

class ShoppingScreen extends StatefulWidget {
  const ShoppingScreen({super.key});

  @override
  State<ShoppingScreen> createState() => _ShoppingScreenState();
}

class _ShoppingScreenState extends State<ShoppingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ShoppingProvider>().refresh();
    });
  }

  void _showAddSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddItemSheet(
        api: ApiService(context.read<ConfigProvider>().backendUrl),
        onAdd: (item) => context.read<ShoppingProvider>().add(item),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ShoppingProvider>();
    final groups = provider.grouped;
    final hasChecked = provider.items.any((i) => i.checked);

    return Scaffold(
      backgroundColor: kBackground,
      body: OrbsBackground(
        child: SafeArea(
          child: Stack(
            children: [
              CustomScrollView(
                slivers: [
                  SliverAppBar(
                    backgroundColor: Colors.white.withValues(alpha: 0.55),
                    elevation: 0,
                    floating: true,
                    title: const Row(children: [
                      Icon(Icons.shopping_cart_outlined, color: kPrimary),
                      SizedBox(width: 8),
                      Text('Nákupní seznam', style: TextStyle(fontWeight: FontWeight.w800, color: kOnSurface)),
                    ]),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                    sliver: provider.loading
                        ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: kPrimary)))
                        : provider.items.isEmpty
                            ? SliverFillRemaining(child: _emptyState())
                            : SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (_, i) {
                                    final entry = groups.entries.toList()[i];
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 16),
                                      child: GlassCard(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(entry.key.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kOnSurfaceVariant, letterSpacing: 1.5)),
                                            const SizedBox(height: 12),
                                            ...entry.value.map((item) => _ItemRow(
                                                  item: item,
                                                  onToggle: (v) => provider.toggle(item.id, v),
                                                  onDelete: () => provider.delete(item.id),
                                                )),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                  childCount: groups.length,
                                ),
                              ),
                  ),
                ],
              ),

              // Clear checked button
              if (hasChecked)
                Positioned(
                  bottom: 90,
                  left: 20,
                  right: 20,
                  child: GlassCard(
                    padding: EdgeInsets.zero,
                    child: TextButton.icon(
                      onPressed: () => provider.clearChecked(),
                      icon: const Icon(Icons.delete_sweep_outlined, color: Colors.red),
                      label: const Text('Vymazat nakoupené', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),

              // FAB
              Positioned(
                bottom: 24,
                right: 20,
                child: GestureDetector(
                  onTap: _showAddSheet,
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(gradient: kBrandGradient, shape: BoxShape.circle, boxShadow: [
                      BoxShadow(color: Color(0x4D30D158), blurRadius: 16, offset: Offset(0, 6)),
                    ]),
                    child: const Icon(Icons.add, color: Colors.white, size: 28),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _emptyState() => Center(
        child: GlassCard(
          padding: const EdgeInsets.all(40),
          child: const Column(mainAxisSize: MainAxisSize.min, children: [
            Text('🛒', style: TextStyle(fontSize: 56)),
            SizedBox(height: 12),
            Text('Prázdný seznam', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            SizedBox(height: 4),
            Text('Přidej položky přes tlačítko + níže', style: TextStyle(color: kOnSurfaceVariant)),
          ]),
        ),
      );
}

class _ItemRow extends StatelessWidget {
  final dynamic item;
  final ValueChanged<bool> onToggle;
  final VoidCallback onDelete;

  const _ItemRow({required this.item, required this.onToggle, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Checkbox(
          value: item.checked,
          onChanged: (v) => onToggle(v ?? false),
          activeColor: kPrimary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        ),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(
              item.name,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: item.checked ? kOutline : kOnSurface,
                decoration: item.checked ? TextDecoration.lineThrough : null,
              ),
            ),
            if (item.quantity != null || item.unit != null)
              Text(
                '${item.quantity?.toStringAsFixed(item.quantity % 1 == 0 ? 0 : 1) ?? ''}${item.unit != null ? ' ${item.unit}' : ''}',
                style: TextStyle(fontSize: 12, color: item.checked ? kOutline : kOnSurfaceVariant),
              ),
          ]),
        ),
        IconButton(
          icon: const Icon(Icons.delete_outline, size: 20, color: kOutline),
          onPressed: onDelete,
        ),
      ]),
    );
  }
}

class _AddItemSheet extends StatefulWidget {
  final ApiService api;
  final Future<void> Function(Map<String, dynamic>) onAdd;

  const _AddItemSheet({required this.api, required this.onAdd});

  @override
  State<_AddItemSheet> createState() => _AddItemSheetState();
}

class _AddItemSheetState extends State<_AddItemSheet> {
  int _step = 1;
  final _ctrl = TextEditingController();
  Map<String, dynamic>? _selected;
  double _qty = 1;
  String _unit = 'ks';
  List<Map<String, dynamic>> _suggestions = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _ctrl.addListener(_onQueryChange);
  }

  void _onQueryChange() async {
    final q = _ctrl.text;
    if (q.length < 2) { setState(() => _suggestions = []); return; }
    final results = await widget.api.searchProducts(q);
    if (mounted) setState(() => _suggestions = results);
  }

  Future<void> _add() async {
    setState(() => _loading = true);
    try {
      await widget.onAdd({
        'name': _selected?['name'] ?? _ctrl.text,
        'quantity': _qty,
        'unit': _unit,
        'group': 'Ostatní',
      });
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: Color(0xF2FFFFFF),
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: kOutline.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            Text(_step == 1 ? 'Přidat položku' : 'Nastavit množství', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: kOnSurface)),
            const SizedBox(height: 16),
            if (_step == 1) ...[
              TextField(
                controller: _ctrl,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Název položky...',
                  prefixIcon: const Icon(Icons.search, color: kOutline),
                  filled: true,
                  fillColor: kSurfaceContainerLow,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: kPrimary, width: 2)),
                ),
                onSubmitted: (v) { if (v.isNotEmpty) setState(() { _selected = {'name': v}; _step = 2; }); },
              ),
              const SizedBox(height: 8),
              ..._suggestions.map((s) => ListTile(
                    leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10)), child: Center(child: Text(s['emoji'] ?? '🛒', style: const TextStyle(fontSize: 20)))),
                    title: Text(s['name'], style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(s['category'] ?? '', style: const TextStyle(fontSize: 12, color: kOnSurfaceVariant)),
                    onTap: () => setState(() { _selected = s; _step = 2; }),
                  )),
              if (_ctrl.text.length >= 2 && _suggestions.isEmpty)
                ListTile(
                  leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: kSurfaceContainer, borderRadius: BorderRadius.circular(10)), child: const Center(child: Text('➕', style: TextStyle(fontSize: 20)))),
                  title: Text('Přidat „${_ctrl.text}"', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Vlastní položka', style: TextStyle(fontSize: 12, color: kOnSurfaceVariant)),
                  onTap: () => setState(() { _selected = {'name': _ctrl.text}; _step = 2; }),
                ),
            ] else ...[
              GlassCard(
                padding: const EdgeInsets.all(12),
                child: Row(children: [
                  Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8)), child: Center(child: Text(_selected?['emoji'] ?? '🛒', style: const TextStyle(fontSize: 18)))),
                  const SizedBox(width: 12),
                  Expanded(child: Text(_selected?['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w700))),
                  GestureDetector(onTap: () => setState(() => _step = 1), child: const Icon(Icons.edit_outlined, size: 18, color: kOutline)),
                ]),
              ),
              const SizedBox(height: 16),
              const Text('MNOŽSTVÍ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOutline, letterSpacing: 1.5)),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                _qtyBtn(Icons.remove, () => setState(() => _qty = (_qty > 1 ? _qty - 1 : 0.5).clamp(0.5, 999))),
                const SizedBox(width: 20),
                Text('${_qty % 1 == 0 ? _qty.toInt() : _qty}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                const SizedBox(width: 20),
                _qtyBtn(Icons.add, () => setState(() => _qty = _qty >= 1 ? _qty + 1 : 1)),
              ]),
              const SizedBox(height: 16),
              const Text('JEDNOTKA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOutline, letterSpacing: 1.5)),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: _units.map((u) {
                  final active = _unit == u;
                  return GestureDetector(
                    onTap: () => setState(() => _unit = u),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: active ? kBrandGradient : null,
                        color: active ? null : Colors.white.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
                      ),
                      child: Text(u, style: TextStyle(fontWeight: FontWeight.w700, color: active ? Colors.white : kOnSurfaceVariant)),
                    ),
                  );
                }).toList()),
              ),
              const SizedBox(height: 20),
              GradientButton(label: 'Přidat do seznamu', loading: _loading, onPressed: _loading ? null : _add),
            ],
          ],
        ),
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            gradient: icon == Icons.add ? kBrandGradient : null,
            color: icon == Icons.remove ? Colors.white.withValues(alpha: 0.6) : null,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
          ),
          child: Icon(icon, color: icon == Icons.add ? Colors.white : kOnSurface),
        ),
      );

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
}
