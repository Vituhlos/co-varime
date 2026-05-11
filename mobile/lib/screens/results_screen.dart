import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/recipe.dart';
import '../providers/config_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/orbs_background.dart';
import '../widgets/recipe_card.dart';

class ResultsScreen extends StatefulWidget {
  final String query;
  final List<String> moods;

  const ResultsScreen({super.key, required this.query, required this.moods});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  List<Recipe> _recipes = [];
  bool _loading = true;
  String? _error;
  int? _timeFilter;
  int? _servingsFilter;
  String? _typeFilter;

  @override
  void initState() {
    super.initState();
    _search();
  }

  Future<void> _search() async {
    setState(() { _loading = true; _error = null; });
    final cfg = context.read<ConfigProvider>();
    try {
      final results = await ApiService(cfg.backendUrl).searchRecipes(
        widget.query,
        widget.moods,
        {
          if (_timeFilter != null) 'time': _timeFilter,
          if (_servingsFilter != null) 'servings': _servingsFilter,
          if (_typeFilter != null) 'type': _typeFilter,
        },
      );
      if (mounted) setState(() { _recipes = results; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Widget _filterChip(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          gradient: active ? const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF2563EB)]) : null,
          color: active ? null : Colors.white.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
        ),
        child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: active ? Colors.white : kOnSurfaceVariant)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.query.isNotEmpty ? '„${widget.query}"' : widget.moods.join(', ');
    return Scaffold(
      backgroundColor: kBackground,
      body: OrbsBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Container(
                color: Colors.white.withValues(alpha: 0.55),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.arrow_back, color: kPrimary), onPressed: () => context.pop()),
                    Expanded(
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(children: [
                          const Icon(Icons.search, color: kPrimary, size: 18),
                          const SizedBox(width: 8),
                          Expanded(child: Text(widget.query.isNotEmpty ? widget.query : widget.moods.join(', '), style: const TextStyle(fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis)),
                        ]),
                      ),
                    ),
                  ],
                ),
              ),
              // Filter chips
              SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  children: [
                    _filterChip('Vše', _timeFilter == null, () => setState(() { _timeFilter = null; _search(); })),
                    _filterChip('Do 30 min', _timeFilter == 30, () => setState(() { _timeFilter = _timeFilter == 30 ? null : 30; _search(); })),
                    _filterChip('Do 60 min', _timeFilter == 60, () => setState(() { _timeFilter = _timeFilter == 60 ? null : 60; _search(); })),
                    _filterChip('Pro 2', _servingsFilter == 2, () => setState(() { _servingsFilter = _servingsFilter == 2 ? null : 2; _search(); })),
                    _filterChip('Pro 4', _servingsFilter == 4, () => setState(() { _servingsFilter = _servingsFilter == 4 ? null : 4; _search(); })),
                    _filterChip('Vegetariánské', _typeFilter == 'vegetarian', () => setState(() { _typeFilter = _typeFilter == 'vegetarian' ? null : 'vegetarian'; _search(); })),
                  ],
                ),
              ),
              // Title
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('VÝSLEDKY HLEDÁNÍ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOutline, letterSpacing: 1.5)),
                      Text(title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: kOnSurface)),
                    ],
                  ),
                ),
              ),
              // Content
              Expanded(
                child: _loading
                    ? _skeleton()
                    : _error != null
                        ? _errorState()
                        : _recipes.isEmpty
                            ? _emptyState()
                            : ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 20),
                                itemCount: _recipes.length,
                                separatorBuilder: (_, _) => const SizedBox(height: 16),
                                itemBuilder: (_, i) => RecipeCard(
                                  recipe: _recipes[i],
                                  onTap: () => context.push('/recipe', extra: _recipes[i]),
                                ),
                              ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _skeleton() => ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 3,
        separatorBuilder: (_, _) => const SizedBox(height: 16),
        itemBuilder: (_, _) => GlassCard(
          child: Column(children: [
            Container(height: 200, color: kSurfaceContainer),
            const Padding(padding: EdgeInsets.all(16), child: Column(children: [
              _SkeletonLine(width: 0.7),
              SizedBox(height: 8),
              _SkeletonLine(width: 0.4),
            ])),
          ]),
        ),
      );

  Widget _errorState() => Center(
        child: GlassCard(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('😕', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            const Text('Něco se pokazilo', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 4),
            Text(_error ?? '', style: const TextStyle(color: kOnSurfaceVariant, fontSize: 13), textAlign: TextAlign.center),
          ]),
        ),
      );

  Widget _emptyState() => Center(
        child: GlassCard(
          padding: const EdgeInsets.all(32),
          child: const Column(mainAxisSize: MainAxisSize.min, children: [
            Text('🔍', style: TextStyle(fontSize: 48)),
            SizedBox(height: 12),
            Text('Žádné výsledky', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            SizedBox(height: 4),
            Text('Zkus jiné ingredience nebo náladu', style: TextStyle(color: kOnSurfaceVariant)),
          ]),
        ),
      );
}

class _SkeletonLine extends StatelessWidget {
  final double width;
  const _SkeletonLine({required this.width});

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: width,
      child: Container(height: 16, decoration: BoxDecoration(color: kSurfaceContainer, borderRadius: BorderRadius.circular(8))),
    );
  }
}
