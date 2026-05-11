import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'models/recipe.dart';
import 'providers/config_provider.dart';
import 'providers/shopping_provider.dart';
import 'screens/detail_screen.dart';
import 'screens/home_screen.dart';
import 'screens/placeholder_screen.dart';
import 'screens/results_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/shopping_screen.dart';
import 'services/api_service.dart';
import 'services/ws_service.dart';
import 'theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final config = ConfigProvider();
  await config.load();
  runApp(CoVarimeApp(config: config));
}

class CoVarimeApp extends StatefulWidget {
  final ConfigProvider config;
  const CoVarimeApp({super.key, required this.config});

  @override
  State<CoVarimeApp> createState() => _CoVarimeAppState();
}

class _CoVarimeAppState extends State<CoVarimeApp> {
  late final WsService _ws;
  late final ShoppingProvider _shopping;

  @override
  void initState() {
    super.initState();
    _ws = WsService(widget.config.backendUrl);
    _ws.connect();
    _shopping = ShoppingProvider(ApiService(widget.config.backendUrl), _ws);
  }

  @override
  void dispose() {
    _ws.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: widget.config),
        ChangeNotifierProvider.value(value: _shopping),
      ],
      child: MaterialApp.router(
        title: 'Co vaříme?',
        theme: buildTheme(),
        routerConfig: _router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

final _router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) => _AppShell(child: child),
      routes: [
        GoRoute(path: '/', builder: (_, _) => const HomeScreen()),
        GoRoute(
          path: '/results',
          builder: (context, state) {
            final extra = state.extra as Map<String, dynamic>? ?? {};
            return ResultsScreen(
              query: extra['query'] as String? ?? '',
              moods: (extra['moods'] as List?)?.cast<String>() ?? [],
            );
          },
        ),
        GoRoute(
          path: '/recipe',
          builder: (context, state) => DetailScreen(recipe: state.extra as Recipe),
        ),
        GoRoute(path: '/shopping', builder: (_, _) => const ShoppingScreen()),
        GoRoute(path: '/oblibene', builder: (_, _) => const PlaceholderScreen(title: 'Oblíbené', emoji: '❤️')),
        GoRoute(path: '/historie', builder: (_, _) => const PlaceholderScreen(title: 'Historie', emoji: '📖')),
        GoRoute(path: '/settings', builder: (_, _) => const SettingsScreen()),
      ],
    ),
  ],
);

class _AppShell extends StatelessWidget {
  final Widget child;
  const _AppShell({required this.child});

  int _navIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.path;
    if (loc.startsWith('/oblibene')) return 1;
    if (loc.startsWith('/shopping')) return 2;
    if (loc.startsWith('/historie')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final loc = GoRouterState.of(context).uri.path;
    final hideNav = loc.startsWith('/recipe') || loc.startsWith('/results') || loc.startsWith('/settings');

    return Scaffold(
      body: child,
      bottomNavigationBar: hideNav
          ? null
          : NavigationBar(
              selectedIndex: _navIndex(context),
              backgroundColor: Colors.white.withValues(alpha: 0.85),
              elevation: 0,
              onDestinationSelected: (i) {
                switch (i) {
                  case 0: context.go('/');
                  case 1: context.go('/oblibene');
                  case 2: context.go('/shopping');
                  case 3: context.go('/historie');
                }
              },
              destinations: const [
                NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: 'Hledej'),
                NavigationDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: 'Oblíbené'),
                NavigationDestination(icon: Icon(Icons.shopping_cart_outlined), selectedIcon: Icon(Icons.shopping_cart), label: 'Nákup'),
                NavigationDestination(icon: Icon(Icons.history_outlined), selectedIcon: Icon(Icons.history), label: 'Historie'),
              ],
            ),
    );
  }
}
