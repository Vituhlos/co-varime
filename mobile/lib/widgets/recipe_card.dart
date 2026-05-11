import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../models/recipe.dart';
import '../theme.dart';
import 'glass_card.dart';

class RecipeCard extends StatelessWidget {
  final Recipe recipe;
  final VoidCallback? onTap;

  const RecipeCard({super.key, required this.recipe, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: GlassCard(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: SizedBox(
                height: 200,
                width: double.infinity,
                child: recipe.image != null && recipe.image!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: recipe.image!,
                        fit: BoxFit.cover,
                        placeholder: (_, _) => Container(color: kSurfaceContainer),
                        errorWidget: (_, _, _) => _placeholder(),
                      )
                    : _placeholder(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (recipe.source != null)
                    Text(
                      recipe.source!.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: kOutline,
                        letterSpacing: 1.5,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    recipe.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: kOnSurface,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    children: [
                      if (recipe.time != null) _meta(Icons.schedule_outlined, '${recipe.time} min'),
                      if (recipe.difficulty != null) _meta(Icons.signal_cellular_alt, recipe.difficulty!),
                      if (recipe.servings != null) _meta(Icons.group_outlined, '${recipe.servings} porce'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() => Container(
        color: kSurfaceContainer,
        child: const Center(child: Text('🍽️', style: TextStyle(fontSize: 48))),
      );

  Widget _meta(IconData icon, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: kOutline),
          const SizedBox(width: 4),
          Text(
            label.toUpperCase(),
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: kOnSurfaceVariant, letterSpacing: 1.2),
          ),
        ],
      );
}
