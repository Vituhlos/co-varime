import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/config_provider.dart';
import '../services/api_service.dart';
import '../theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../widgets/orbs_background.dart';

const _moods = [
  ('Maso', '🥩'), ('Lehké', '🥗'), ('Těstoviny', '🍝'), ('Polévka', '🍲'),
  ('Veggie', '🥦'), ('Rychlé', '⚡'), ('Na víkend', '🎉'), ('Dezert', '🍰'),
];

String _greeting() {
  final h = DateTime.now().hour;
  if (h >= 6 && h < 11) return 'Dobré ráno! ☀️\nCo dnes uvaříme?';
  if (h >= 11 && h < 14) return 'Čas na oběd 🍽️\nCo si dáme?';
  if (h >= 14 && h < 18) return 'Dobré odpoledne 👋\nCo vaříme k večeři?';
  if (h >= 18 && h < 23) return 'Dobrý večer 🌙\nCo k večeři?';
  return 'Pozdní noc 🌙\nJeště vaříme?';
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _queryCtrl = TextEditingController();
  final Set<String> _selectedMoods = {};
  List<Map<String, dynamic>> _recent = [];

  @override
  void initState() {
    super.initState();
    _loadRecent();
  }

  Future<void> _loadRecent() async {
    final cfg = context.read<ConfigProvider>();
    try {
      final api = ApiService(cfg.backendUrl);
      final data = await api.getRecentHistory();
      if (mounted) setState(() => _recent = data);
    } catch (_) {}
  }

  void _search() {
    final q = _queryCtrl.text.trim();
    if (q.isEmpty && _selectedMoods.isEmpty) return;
    context.push('/results', extra: {'query': q, 'moods': _selectedMoods.toList()});
  }

  @override
  Widget build(BuildContext context) {
    final greeting = _greeting().split('\n');
    final canSearch = _queryCtrl.text.trim().isNotEmpty || _selectedMoods.isNotEmpty;

    return Scaffold(
      backgroundColor: kBackground,
      body: OrbsBackground(
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                backgroundColor: Colors.white.withValues(alpha: 0.55),
                elevation: 0,
                floating: true,
                title: Row(
                  children: [
                    const Icon(Icons.restaurant_menu, color: kPrimary),
                    const SizedBox(width: 8),
                    ShaderMask(
                      shaderCallback: (b) => kBrandGradient.createShader(b),
                      child: const Text('Co vaříme?', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
                    ),
                  ],
                ),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.settings_outlined, color: kOnSurfaceVariant),
                    onPressed: () => context.push('/settings'),
                  ),
                ],
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    const SizedBox(height: 24),
                    Text(greeting[0], style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: kOnSurface)),
                    const SizedBox(height: 4),
                    Text(greeting[1], style: const TextStyle(fontSize: 14, color: kOnSurfaceVariant, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 24),

                    // Search card
                    GlassCard(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('INGREDIENCE NEBO NÁZEV', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOnSurfaceVariant, letterSpacing: 1.5)),
                          const SizedBox(height: 10),
                          TextField(
                            controller: _queryCtrl,
                            onChanged: (_) => setState(() {}),
                            onSubmitted: (_) => _search(),
                            decoration: InputDecoration(
                              hintText: 'Kuřecí prsa, těstoviny...',
                              hintStyle: TextStyle(color: kOutline.withValues(alpha: 0.6)),
                              prefixIcon: const Icon(Icons.search, color: kOutline),
                              filled: true,
                              fillColor: kSurfaceContainerLowest,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: kPrimary, width: 2)),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text('NEBO VYBER NÁLADU', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOnSurfaceVariant, letterSpacing: 1.5)),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _moods.map((m) {
                              final label = m.$1;
                              final emoji = m.$2;
                              final active = _selectedMoods.contains(label);
                              return GestureDetector(
                                onTap: () => setState(() {
                                  active ? _selectedMoods.remove(label) : _selectedMoods.add(label);
                                }),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    gradient: active ? kBrandGradient : null,
                                    color: active ? null : Colors.white.withValues(alpha: 0.6),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.6)),
                                  ),
                                  child: Text('$label $emoji', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: active ? Colors.white : kOnSurface)),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 16),
                          GradientButton(
                            label: 'Najít recepty',
                            icon: Icons.search,
                            onPressed: canSearch ? _search : null,
                          ),
                        ],
                      ),
                    ),

                    // Recently cooked
                    if (_recent.isNotEmpty) ...[
                      const SizedBox(height: 28),
                      const Text('NEDÁVNO VAŘENO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOnSurfaceVariant, letterSpacing: 1.5)),
                      const SizedBox(height: 12),
                      Row(
                        children: _recent.map((r) => Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(right: r == _recent.last ? 0 : 8),
                            child: GlassCard(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  AspectRatio(
                                    aspectRatio: 1,
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: r['image'] != null
                                          ? Image.network(r['image'], fit: BoxFit.cover, errorBuilder: (_, _, _) => _placeholder())
                                          : _placeholder(),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(r['name'] ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: kOnSurface), maxLines: 2, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          ),
                        )).toList(),
                      ),
                    ],
                    const SizedBox(height: 24),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholder() => Container(color: kSurfaceContainer, child: const Center(child: Text('🍽️', style: TextStyle(fontSize: 32))));

  @override
  void dispose() {
    _queryCtrl.dispose();
    super.dispose();
  }
}
