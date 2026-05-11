import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/orbs_background.dart';

class PlaceholderScreen extends StatelessWidget {
  final String title;
  final String emoji;

  const PlaceholderScreen({super.key, required this.title, required this.emoji});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBackground,
      body: OrbsBackground(
        child: SafeArea(
          child: Center(
            child: GlassCard(
              padding: const EdgeInsets.all(40),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Text(emoji, style: const TextStyle(fontSize: 56)),
                const SizedBox(height: 16),
                Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: kOnSurface)),
                const SizedBox(height: 8),
                const Text('Připravujeme...', style: TextStyle(color: kOnSurfaceVariant)),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
