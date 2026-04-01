import 'dart:async';
import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  final Future<bool> authFuture;
  final void Function(bool isLoggedIn) onComplete;

  const SplashScreen({
    super.key,
    required this.authFuture,
    required this.onComplete,
  });

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _logoController;
  late final AnimationController _textController;
  late final AnimationController _dotsController;

  late final Animation<double> _logoScale;
  late final Animation<double> _logoOpacity;
  late final Animation<Offset> _taglineSlide;
  late final Animation<double> _taglineOpacity;
  late final Animation<double> _dotsOpacity;

  bool _authDone = false;
  bool _isLoggedIn = false;
  bool _animationDone = false;

  @override
  void initState() {
    super.initState();

    // Logo: scale from 0.6 → 1.0 and fade in
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _logoScale = Tween<double>(begin: 0.55, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: Curves.easeOutBack),
    );
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    // Text: slides up and fades in after logo
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _taglineSlide = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _textController, curve: Curves.easeOut));
    _taglineOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _textController, curve: Curves.easeOut),
    );

    // Pulsing dots
    _dotsController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _dotsOpacity = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(parent: _dotsController, curve: Curves.easeInOut),
    );

    _startSequence();
  }

  Future<void> _startSequence() async {
    // Wait a tiny bit before starting (frame warm-up)
    await Future.delayed(const Duration(milliseconds: 100));
    if (!mounted) return;

    // Kick off logo animation
    _logoController.forward();

    // After logo peaks, start text
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    _textController.forward();

    // Run both: auth check AND a minimum 2.2s display time
    final results = await Future.wait([
      widget.authFuture,
      Future.delayed(const Duration(milliseconds: 2200)),
    ]);

    _isLoggedIn = results[0] as bool;
    _authDone = true;
    _animationDone = true;

    // Fade everything out then call onComplete
    if (!mounted) return;
    await Future.wait([
      _logoController.reverse(),
      _textController.reverse(),
    ]);

    if (mounted) widget.onComplete(_isLoggedIn);
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    _dotsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060D1A),
      body: Stack(
        children: [
          // Background gradient mesh
          Positioned.fill(
            child: CustomPaint(painter: _BackgroundPainter()),
          ),

          // Main content
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo with glow
                AnimatedBuilder(
                  animation: _logoController,
                  builder: (_, __) => Opacity(
                    opacity: _logoOpacity.value,
                    child: Transform.scale(
                      scale: _logoScale.value,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Glow ring
                          Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF3B82F6).withOpacity(0.35 * _logoOpacity.value),
                                  blurRadius: 60,
                                  spreadRadius: 10,
                                ),
                              ],
                            ),
                          ),
                          // Logo image
                          ClipRRect(
                            borderRadius: BorderRadius.circular(28),
                            child: Image.asset(
                              'assets/images/logo.png',
                              width: 110,
                              height: 110,
                              fit: BoxFit.contain,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // App name + tagline
                SlideTransition(
                  position: _taglineSlide,
                  child: FadeTransition(
                    opacity: _taglineOpacity,
                    child: Column(
                      children: [
                        const Text(
                          'LynQ',
                          style: TextStyle(
                            fontSize: 38,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 2.0,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Your digital identity, everywhere.',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: Colors.white.withOpacity(0.5),
                            letterSpacing: 0.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 60),

                // Pulsing dots loader
                FadeTransition(
                  opacity: _taglineOpacity,
                  child: _DotsLoader(pulseAnim: _dotsOpacity),
                ),
              ],
            ),
          ),

          // Bottom branding
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _taglineOpacity,
              child: Center(
                child: Text(
                  'lynq.cards',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.25),
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Three pulsing dots
class _DotsLoader extends StatelessWidget {
  final Animation<double> pulseAnim;
  const _DotsLoader({required this.pulseAnim});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulseAnim,
      builder: (_, __) => Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (i) {
          // Stagger each dot slightly
          final offset = i * 0.15;
          final t = ((pulseAnim.value + offset) % 1.0);
          final opacity = 0.2 + 0.8 * (t < 0.5 ? t * 2 : (1 - t) * 2);
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 5),
            child: Opacity(
              opacity: opacity.clamp(0.2, 1.0),
              child: Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: Color(0xFF3B82F6),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// Subtle dark radial background with a soft blue gradient
class _BackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Deep dark base is handled by Scaffold color.
    // Draw a soft radial glow in the center-top area.
    final paint = Paint()
      ..shader = RadialGradient(
        center: const Alignment(0, -0.3),
        radius: 0.85,
        colors: [
          const Color(0xFF1E3A5F).withOpacity(0.55),
          const Color(0xFF060D1A).withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
  }

  @override
  bool shouldRepaint(_BackgroundPainter old) => false;
}
