import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/config_provider.dart';
import '../theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../widgets/orbs_background.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _urlCtrl;
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    _urlCtrl = TextEditingController(text: context.read<ConfigProvider>().backendUrl);
  }

  Future<void> _save() async {
    await context.read<ConfigProvider>().setBackendUrl(_urlCtrl.text);
    setState(() => _saved = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _saved = false);
  }

  @override
  Widget build(BuildContext context) {
    final cfg = context.watch<ConfigProvider>();
    return Scaffold(
      backgroundColor: kBackground,
      body: OrbsBackground(
        child: SafeArea(
          child: Column(
            children: [
              Container(
                color: Colors.white.withValues(alpha: 0.55),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(children: [
                  IconButton(icon: const Icon(Icons.arrow_back, color: kPrimary), onPressed: () => context.pop()),
                  const Text('Nastavení', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kOnSurface)),
                ]),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    const Text('KDO VAŘÍ TEĎ?', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOutline, letterSpacing: 1.5)),
                    const SizedBox(height: 10),
                    Row(children: [
                      for (final m in [('J', 'Já', Colors.blue), ('Z', 'Zlatěna', Colors.purple), ('N', 'Nelča', Colors.orange)])
                        Expanded(child: Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => cfg.setActiveMember(m.$1),
                            child: GlassCard(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              child: Column(children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: m.$3.withValues(alpha: cfg.activeMember == m.$1 ? 0.8 : 0.2),
                                    shape: BoxShape.circle,
                                    border: cfg.activeMember == m.$1 ? Border.all(color: kPrimary, width: 2) : null,
                                  ),
                                  child: Center(child: Text(m.$1, style: TextStyle(fontWeight: FontWeight.w800, color: cfg.activeMember == m.$1 ? Colors.white : kOnSurface))),
                                ),
                                const SizedBox(height: 6),
                                Text(m.$2, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                if (cfg.activeMember == m.$1)
                                  const Text('Aktivní', style: TextStyle(fontSize: 9, color: kPrimary, fontWeight: FontWeight.w700, letterSpacing: 1)),
                              ]),
                            ),
                          ),
                        )),
                    ]),
                    const SizedBox(height: 24),
                    const Text('PŘIPOJENÍ K BACKENDU', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOutline, letterSpacing: 1.5)),
                    const SizedBox(height: 10),
                    GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('URL backendu', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: kOnSurfaceVariant)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _urlCtrl,
                          decoration: InputDecoration(
                            hintText: 'http://192.168.1.114:3000',
                            filled: true,
                            fillColor: kSurfaceContainerLowest,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          ),
                          keyboardType: TextInputType.url,
                        ),
                        const SizedBox(height: 12),
                        GradientButton(label: _saved ? '✓ Uloženo' : 'Uložit', onPressed: _save),
                      ]),
                    ),
                    const SizedBox(height: 32),
                    const Center(child: Text('S láskou uvařeno v 2026 😄', style: TextStyle(fontSize: 11, color: kOutline, fontWeight: FontWeight.w700, letterSpacing: 1.5))),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() { _urlCtrl.dispose(); super.dispose(); }
}
