import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ── Dark colour palette ────────────────────────────────────────────────────
class DarkColors {
  // Backgrounds
  static const bg         = Color(0xFF060D1A); // deepest dark
  static const surface    = Color(0xFF0D1526); // cards / sheets
  static const elevated   = Color(0xFF162033); // elevated cards
  static const border     = Color(0xFF1E2D45); // subtle borders
  static const border2    = Color(0xFF243044); // slightly brighter border

  // Brand
  static const primary    = Color(0xFF6366F1); // indigo
  static const primaryLow = Color(0x266366F1); // 15 % opacity
  static const accent     = Color(0xFF818CF8); // lighter indigo
  static const pink       = Color(0xFFEC4899);
  static const gradient1  = Color(0xFF6366F1);
  static const gradient2  = Color(0xFFEC4899);

  // Text
  static const textPrimary   = Color(0xFFF1F5F9);
  static const textSecondary = Color(0xFF94A3B8);
  static const textMuted     = Color(0xFF475569);

  // Status
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const error   = Color(0xFFEF4444);
  static const info    = Color(0xFF3B82F6);
}

class AppTheme {
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: DarkColors.primary,
          secondary: DarkColors.accent,
          surface: DarkColors.surface,
          error: DarkColors.error,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: DarkColors.textPrimary,
          onError: Colors.white,
        ),
        scaffoldBackgroundColor: DarkColors.bg,
        cardColor: DarkColors.surface,

        // AppBar
        appBarTheme: const AppBarTheme(
          backgroundColor: DarkColors.bg,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.light,
          ),
          titleTextStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: DarkColors.textPrimary,
          ),
          iconTheme: IconThemeData(color: DarkColors.textPrimary),
        ),

        // Bottom navigation
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: DarkColors.surface,
          indicatorColor: DarkColors.primaryLow,
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: selected ? DarkColors.primary : DarkColors.textMuted,
            );
          }),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            final selected = states.contains(WidgetState.selected);
            return IconThemeData(
              color: selected ? DarkColors.primary : DarkColors.textMuted,
            );
          }),
          elevation: 0,
          surfaceTintColor: Colors.transparent,
        ),

        // Input
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: DarkColors.elevated,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: DarkColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: DarkColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: DarkColors.primary, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: DarkColors.error),
          ),
          hintStyle: const TextStyle(color: DarkColors.textMuted, fontSize: 14),
          labelStyle: const TextStyle(color: DarkColors.textSecondary, fontSize: 13),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          isDense: true,
        ),

        // ElevatedButton
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: DarkColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),

        // OutlinedButton
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: DarkColors.textPrimary,
            side: const BorderSide(color: DarkColors.border, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),

        // TextButton
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: DarkColors.primary,
          ),
        ),

        // Divider
        dividerTheme: const DividerThemeData(
          color: DarkColors.border,
          thickness: 1,
          space: 0,
        ),

        // ListTile
        listTileTheme: const ListTileThemeData(
          tileColor: Colors.transparent,
          textColor: DarkColors.textPrimary,
          iconColor: DarkColors.textSecondary,
        ),

        // Text
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            fontSize: 28, fontWeight: FontWeight.w800,
            color: DarkColors.textPrimary, letterSpacing: -0.5,
          ),
          headlineMedium: TextStyle(
            fontSize: 22, fontWeight: FontWeight.w700,
            color: DarkColors.textPrimary,
          ),
          titleLarge: TextStyle(
            fontSize: 18, fontWeight: FontWeight.w700,
            color: DarkColors.textPrimary,
          ),
          titleMedium: TextStyle(
            fontSize: 15, fontWeight: FontWeight.w600,
            color: DarkColors.textPrimary,
          ),
          bodyLarge: TextStyle(
            fontSize: 15, color: DarkColors.textSecondary,
          ),
          bodyMedium: TextStyle(
            fontSize: 14, color: DarkColors.textSecondary,
          ),
          bodySmall: TextStyle(
            fontSize: 12, color: DarkColors.textMuted,
          ),
          labelLarge: TextStyle(
            fontSize: 14, fontWeight: FontWeight.w600,
            color: DarkColors.textPrimary,
          ),
          labelSmall: TextStyle(
            fontSize: 11, color: DarkColors.textMuted,
            letterSpacing: 0.5,
          ),
        ),
      );
}
