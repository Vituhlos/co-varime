import 'dart:ui';
import 'package:flutter/material.dart';

class OrbsBackground extends StatelessWidget {
  final Widget child;
  const OrbsBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: -100,
          left: -100,
          child: _orb(400, const Color(0xFF7DD3FC), 0.3),
        ),
        Positioned(
          bottom: -150,
          right: -100,
          child: _orb(500, const Color(0xFFD8B4FE), 0.3),
        ),
        child,
      ],
    );
  }

  Widget _orb(double size, Color color, double opacity) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withValues(alpha: opacity),
        ),
      ),
    );
  }
}
