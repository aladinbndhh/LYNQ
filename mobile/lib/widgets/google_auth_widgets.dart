import 'package:flutter/material.dart';

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
          side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF1E293B),
        ),
        child: loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Color(0xFF3B82F6),
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
                      color: Color(0xFF1E293B),
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
      const Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Text(
          'or',
          style: TextStyle(
            color: Colors.grey.shade400,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      const Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
    ]);
  }
}

/// Draws the Google multicolour "G" with CustomPaint — no image asset needed.
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
    canvas.drawCircle(
        Offset(cx, cy), r, Paint()..color = Colors.white);

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

    // White horizontal bar — creates the flat edge of the "G"
    canvas.drawLine(
      Offset(cx, cy),
      Offset(cx + arcR, cy),
      Paint()
        ..color = Colors.white
        ..strokeWidth = r * 0.42
        ..strokeCap = StrokeCap.butt,
    );

    // Inner white circle — creates the ring shape
    canvas.drawCircle(
        Offset(cx, cy), arcR - r * 0.21, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_GoogleLogoPainter old) => false;
}
