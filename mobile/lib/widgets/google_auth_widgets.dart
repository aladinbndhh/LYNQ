import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// "Continue with Google" outlined button with built-in loading state.
class GoogleSignInButton extends StatelessWidget {
  final bool loading;
  final VoidCallback? onTap;

  const GoogleSignInButton({super.key, required this.loading, this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton(
        onPressed: loading ? null : onTap,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: DarkColors.border2, width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          backgroundColor: DarkColors.elevated,
          foregroundColor: DarkColors.textPrimary,
        ),
        child: loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: DarkColors.primary,
                ),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GoogleLogo(size: 22),
                  SizedBox(width: 12),
                  Text(
                    'Continue with Google',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: DarkColors.textPrimary,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

/// "── or ──" divider row.
class OrDivider extends StatelessWidget {
  const OrDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      const Expanded(child: Divider(color: DarkColors.border, thickness: 1)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Text(
          'or',
          style: TextStyle(
            color: DarkColors.textMuted,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      const Expanded(child: Divider(color: DarkColors.border, thickness: 1)),
    ]);
  }
}

/// Google multicolour "G" drawn with CustomPaint.
class GoogleLogo extends StatelessWidget {
  final double size;
  const GoogleLogo({super.key, required this.size});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2;

    canvas.clipPath(
        Path()..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r)));
    canvas.drawCircle(Offset(cx, cy), r, Paint()..color = Colors.white);

    const deg = 3.14159265 / 180;
    final arcR = r * 0.79;
    final arcRect = Rect.fromCircle(center: Offset(cx, cy), radius: arcR);

    final segments = [
      (-30.0, 97.0, const Color(0xFF4285F4)),
      (67.0,  97.0, const Color(0xFF34A853)),
      (164.0, 97.0, const Color(0xFFFBBC05)),
      (261.0, 99.0, const Color(0xFFEA4335)),
    ];

    final arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = r * 0.42
      ..strokeCap = StrokeCap.butt;

    for (final (start, sweep, color) in segments) {
      arcPaint.color = color;
      canvas.drawArc(arcRect, start * deg, sweep * deg, false, arcPaint);
    }

    canvas.drawLine(
      Offset(cx, cy),
      Offset(cx + arcR, cy),
      Paint()
        ..color = Colors.white
        ..strokeWidth = r * 0.42
        ..strokeCap = StrokeCap.butt,
    );

    canvas.drawCircle(
        Offset(cx, cy), arcR - r * 0.21, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_GoogleLogoPainter old) => false;
}
