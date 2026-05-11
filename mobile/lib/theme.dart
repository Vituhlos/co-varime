import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const kPrimary = Color(0xFF0058BC);
const kSecondary = Color(0xFF006E26);
const kOnSurface = Color(0xFF191C1E);
const kOnSurfaceVariant = Color(0xFF414755);
const kOutline = Color(0xFF717786);
const kBackground = Color(0xFFF7F9FB);
const kSurfaceContainer = Color(0xFFECEEF0);
const kSurfaceContainerLow = Color(0xFFF2F4F6);
const kSurfaceContainerLowest = Color(0xFFFFFFFF);

const kGradientStart = Color(0xFF32ADE6);
const kGradientEnd = Color(0xFF30D158);

const kBrandGradient = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [kGradientStart, kGradientEnd],
);

ThemeData buildTheme() {
  return ThemeData(
    colorScheme: ColorScheme.light(
      primary: kPrimary,
      secondary: kSecondary,
      surface: kBackground,
      onSurface: kOnSurface,
    ),
    scaffoldBackgroundColor: kBackground,
    textTheme: GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
      displayMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
      displaySmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
      headlineLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
      headlineMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
      headlineSmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
      titleLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
      titleMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600),
      bodyLarge: GoogleFonts.inter(fontWeight: FontWeight.w400),
      bodyMedium: GoogleFonts.inter(fontWeight: FontWeight.w400),
      labelSmall: GoogleFonts.inter(fontWeight: FontWeight.w700, letterSpacing: 1.5),
    ),
    useMaterial3: true,
  );
}
