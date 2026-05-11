class Ingredient {
  final String name;
  final String amount;
  final String unit;

  const Ingredient({required this.name, this.amount = '', this.unit = ''});

  factory Ingredient.fromJson(Map<String, dynamic> j) => Ingredient(
        name: j['name'] ?? '',
        amount: j['amount']?.toString() ?? '',
        unit: j['unit'] ?? '',
      );
}

class RecipeStep {
  final String title;
  final String description;
  final int? timer;

  const RecipeStep({this.title = '', required this.description, this.timer});

  factory RecipeStep.fromJson(Map<String, dynamic> j) => RecipeStep(
        title: j['title'] ?? '',
        description: j['description'] ?? '',
        timer: j['timer'] is int ? j['timer'] : null,
      );
}

class Recipe {
  final String title;
  final String? url;
  final String? image;
  final int? time;
  final String? difficulty;
  final int? servings;
  final String? source;
  final String? description;
  final List<Ingredient> ingredients;
  final List<RecipeStep> steps;

  const Recipe({
    required this.title,
    this.url,
    this.image,
    this.time,
    this.difficulty,
    this.servings,
    this.source,
    this.description,
    this.ingredients = const [],
    this.steps = const [],
  });

  factory Recipe.fromJson(Map<String, dynamic> j) => Recipe(
        title: j['title'] ?? '',
        url: j['url'],
        image: j['image'],
        time: j['time'] is int ? j['time'] : int.tryParse(j['time']?.toString() ?? ''),
        difficulty: j['difficulty'],
        servings: j['servings'] is int ? j['servings'] : int.tryParse(j['servings']?.toString() ?? ''),
        source: j['source'],
        description: j['description'],
        ingredients: (j['ingredients'] as List? ?? [])
            .map((i) => Ingredient.fromJson(i as Map<String, dynamic>))
            .toList(),
        steps: (j['steps'] as List? ?? [])
            .map((s) => RecipeStep.fromJson(s as Map<String, dynamic>))
            .toList(),
      );

  Recipe copyWith({int? servings}) => Recipe(
        title: title,
        url: url,
        image: image,
        time: time,
        difficulty: difficulty,
        servings: servings ?? this.servings,
        source: source,
        description: description,
        ingredients: ingredients,
        steps: steps,
      );
}
