import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/recipe.dart';
import '../providers/config_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../widgets/orbs_background.dart';

const _servingsOptions = [2, 4, 6, 8];

class DetailScreen extends StatefulWidget {
  final Recipe recipe;
  const DetailScreen({super.key, required this.recipe});

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  late int _servings;
  late int _baseServings;
  final Set<int> _checked = {};
  bool _saving = false;
  bool _saved = false;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _baseServings = widget.recipe.servings ?? 4;
    _servings = _baseServings;
  }

  double get _scale => _servings / _baseServings;

  String _scaleAmount(String amount) {
    final num = double.tryParse(amount);
    if (num == null) return amount;
    final scaled = num * _scale;
    return scaled == scaled.truncateToDouble() ? scaled.toInt().toString() : scaled.toStringAsFixed(1);
  }

  Future<void> _saveToMealie() async {
    if (widget.recipe.url == null) return;
    setState(() => _saving = true);
    try {
      final cfg = context.read<ConfigProvider>();
      await ApiService(cfg.backendUrl).saveToMealie(widget.recipe.url!);
      if (mounted) setState(() => _saved = true);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _proposeToFamily() async {
    final cfg = context.read<ConfigProvider>();
    try {
      await ApiService(cfg.backendUrl).proposeRecipe(widget.recipe, cfg.activeMember);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Recept navržen domácnosti!'), backgroundColor: kSecondary),
        );
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final recipe = widget.recipe;
    return Scaffold(
      backgroundColor: kBackground,
      body: OrbsBackground(
        child: Stack(
          children: [
            CustomScrollView(
              slivers: [
                // Hero
                SliverAppBar(
                  expandedHeight: 380,
                  pinned: true,
                  backgroundColor: Colors.white.withValues(alpha: 0.9),
                  leading: GestureDetector(
                    onTap: () => context.pop(),
                    child: const Padding(
                      padding: EdgeInsets.all(8),
                      child: GlassCard(child: Icon(Icons.arrow_back, color: kPrimary)),
                    ),
                  ),
                  actions: [
                    GestureDetector(
                      onTap: () => setState(() => _isFavorite = !_isFavorite),
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: GlassCard(
                          child: Icon(
                            _isFavorite ? Icons.favorite : Icons.favorite_border,
                            color: _isFavorite ? Colors.red : kOutline,
                          ),
                        ),
                      ),
                    ),
                  ],
                  flexibleSpace: FlexibleSpaceBar(
                    background: Stack(
                      fit: StackFit.expand,
                      children: [
                        recipe.image != null
                            ? CachedNetworkImage(imageUrl: recipe.image!, fit: BoxFit.cover)
                            : Container(color: kSurfaceContainer, child: const Center(child: Text('🍽️', style: TextStyle(fontSize: 80)))),
                        // Title overlay
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (recipe.source != null)
                                    Text(recipe.source!.toUpperCase(), style: const TextStyle(fontSize: 10, color: kOutline, letterSpacing: 1.5, fontWeight: FontWeight.w700)),
                                  Text(recipe.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: kOnSurface)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 200),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Meta pills
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (recipe.time != null) _metaPill(Icons.schedule_outlined, '${recipe.time} min'),
                          if (recipe.servings != null) _metaPill(Icons.group_outlined, '${recipe.servings} porce'),
                          if (recipe.difficulty != null) _metaPill(Icons.signal_cellular_alt, recipe.difficulty!),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Servings scaler
                      const Text('VAŘÍM PRO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOutline, letterSpacing: 1.5)),
                      const SizedBox(height: 8),
                      Row(
                        children: _servingsOptions.map((s) {
                          final active = _servings == s;
                          return Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _servings = s),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                margin: const EdgeInsets.only(right: 8),
                                height: 40,
                                decoration: BoxDecoration(
                                  gradient: active ? kBrandGradient : null,
                                  color: active ? null : Colors.white.withValues(alpha: 0.6),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
                                ),
                                child: Center(child: Text(s == 8 ? '8+' : '$s', style: TextStyle(fontWeight: FontWeight.w700, color: active ? Colors.white : kOnSurface))),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),

                      // Ingredients
                      if (recipe.ingredients.isNotEmpty) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Ingredience', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kOnSurface)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: kSurfaceContainer, borderRadius: BorderRadius.circular(20)),
                              child: Text('${recipe.ingredients.length} položek', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOnSurfaceVariant, letterSpacing: 1)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...recipe.ingredients.asMap().entries.map((e) {
                          final i = e.key;
                          final ing = e.value;
                          final isChecked = _checked.contains(i);
                          return GestureDetector(
                            onTap: () => setState(() => isChecked ? _checked.remove(i) : _checked.add(i)),
                            child: GlassCard(
                              padding: const EdgeInsets.all(14),
                              borderRadius: BorderRadius.circular(12),
                              child: Row(children: [
                                Checkbox(
                                  value: isChecked,
                                  onChanged: (_) => setState(() => isChecked ? _checked.remove(i) : _checked.add(i)),
                                  activeColor: kPrimary,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                ),
                                Expanded(
                                  child: Text(
                                    ing.name,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w500,
                                      color: isChecked ? kOutline : kOnSurface,
                                      decoration: isChecked ? TextDecoration.lineThrough : null,
                                    ),
                                  ),
                                ),
                                Text(
                                  '${_scaleAmount(ing.amount)}${ing.unit.isNotEmpty ? ' ${ing.unit}' : ''}',
                                  style: TextStyle(fontWeight: FontWeight.w700, color: isChecked ? kOutline : kPrimary),
                                ),
                              ]),
                            ),
                          );
                        }),
                        const SizedBox(height: 24),
                      ],

                      // Steps
                      if (recipe.steps.isNotEmpty) ...[
                        const Text('Postup přípravy', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kOnSurface)),
                        const SizedBox(height: 16),
                        ...recipe.steps.asMap().entries.map((e) {
                          final i = e.key;
                          final step = e.value;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 20),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: const BoxDecoration(gradient: kBrandGradient, shape: BoxShape.circle),
                                  child: Center(child: Text('${i + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (step.title.isNotEmpty)
                                        Text(step.title, style: const TextStyle(fontWeight: FontWeight.w700, color: kOnSurface)),
                                      Text(step.description, style: const TextStyle(color: kOnSurfaceVariant, height: 1.5)),
                                      if (step.timer != null) ...[
                                        const SizedBox(height: 8),
                                        _TimerButton(minutes: step.timer!),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ]),
                  ),
                ),
              ],
            ),

            // Fixed CTA buttons
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.85),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, -4))],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    GradientButton(
                      label: _saved ? 'Uloženo v Mealie!' : 'Přidat do Mealie',
                      icon: _saved ? Icons.check_circle : Icons.bookmark_add_outlined,
                      loading: _saving,
                      onPressed: _saved ? null : _saveToMealie,
                    ),
                    const SizedBox(height: 10),
                    Row(children: [
                      Expanded(
                        child: GlassCard(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: GestureDetector(
                            onTap: _proposeToFamily,
                            child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Icon(Icons.how_to_vote_outlined, size: 18, color: kOnSurface),
                              SizedBox(width: 6),
                              Text('Navrhnout rodině', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                            ]),
                          ),
                        ),
                      ),
                      if (recipe.url != null) ...[
                        const SizedBox(width: 10),
                        Expanded(
                          child: GlassCard(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: GestureDetector(
                              onTap: () => launchUrl(Uri.parse(recipe.url!)),
                              child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                Icon(Icons.open_in_new, size: 18, color: kOnSurface),
                                SizedBox(width: 6),
                                Text('Originál', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                              ]),
                            ),
                          ),
                        ),
                      ],
                    ]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _metaPill(IconData icon, String label) => GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        borderRadius: BorderRadius.circular(20),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 16, color: kOutline),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
        ]),
      );
}

class _TimerButton extends StatefulWidget {
  final int minutes;
  const _TimerButton({required this.minutes});

  @override
  State<_TimerButton> createState() => _TimerButtonState();
}

class _TimerButtonState extends State<_TimerButton> {
  Timer? _timer;
  late int _remaining;
  bool _running = false;

  @override
  void initState() {
    super.initState();
    _remaining = widget.minutes * 60;
  }

  void _toggle() {
    if (_running) {
      _timer?.cancel();
      setState(() => _running = false);
    } else {
      setState(() => _running = true);
      _timer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (_remaining <= 0) { t.cancel(); setState(() => _running = false); return; }
        setState(() => _remaining--);
      });
    }
  }

  String get _label {
    if (!_running && _remaining == widget.minutes * 60) return '⏱ ${widget.minutes} min';
    final m = _remaining ~/ 60;
    final s = _remaining % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: _toggle,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _running ? kPrimary.withValues(alpha: 0.1) : kSurfaceContainerLow,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _running ? kPrimary.withValues(alpha: 0.3) : Colors.transparent),
          ),
          child: Text(_label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _running ? kPrimary : kOnSurfaceVariant)),
        ),
      );
}
