import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  final VoidCallback onGoSignup;

  const LoginScreen({
    super.key,
    required this.onLoginSuccess,
    required this.onGoSignup,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  bool _googleLoading = false;
  String? _error;
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      final auth = context.read<AuthService>();
      await auth.login(_emailCtrl.text.trim(), _passwordCtrl.text);
      widget.onLoginSuccess();
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      setState(() {
        _error = msg.contains('EMAIL_NOT_VERIFIED')
            ? 'Please verify your email before signing in.'
            : msg;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() { _googleLoading = true; _error = null; });
    try {
      final auth = context.read<AuthService>();
      await auth.loginWithGoogle();
      widget.onLoginSuccess();
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      if (msg != 'Google sign-in cancelled') {
        setState(() => _error = msg);
      }
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 48),
                Image.asset('assets/images/logo.png', width: 72, height: 72),
                const SizedBox(height: 28),
                const Text('Welcome back',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
                const SizedBox(height: 6),
                const Text('Sign in to your LynQ account',
                    style: TextStyle(fontSize: 15, color: Color(0xFF64748B))),
                const SizedBox(height: 32),

                // Google Sign-In button
                _GoogleButton(
                  loading: _googleLoading,
                  onTap: (_loading || _googleLoading) ? null : _signInWithGoogle,
                ),

                const SizedBox(height: 24),
                _Divider(),
                const SizedBox(height: 24),

                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: Row(children: [
                      const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!,
                          style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13))),
                    ]),
                  ),
                  const SizedBox(height: 20),
                ],

                _buildField('Email', _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null),
                const SizedBox(height: 16),
                _buildField('Password', _passwordCtrl,
                  obscure: _obscure,
                  suffix: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility,
                        size: 20, color: const Color(0xFF94A3B8)),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                  validator: (v) => v == null || v.length < 6 ? 'Minimum 6 characters' : null),
                const SizedBox(height: 28),

                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: (_loading || _googleLoading) ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3B82F6),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: _loading
                        ? const SizedBox(width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Sign In',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 20),

                Center(
                  child: TextButton(
                    onPressed: widget.onGoSignup,
                    child: const Text.rich(TextSpan(children: [
                      TextSpan(text: "Don't have an account? ",
                          style: TextStyle(color: Color(0xFF64748B))),
                      TextSpan(text: 'Sign up',
                          style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w600)),
                    ])),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {
    TextInputType? keyboardType,
    bool obscure = false,
    Widget? suffix,
    String? Function(String?)? validator,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(
          fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
      const SizedBox(height: 6),
      TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        obscureText: obscure,
        validator: validator,
        decoration: InputDecoration(
          suffixIcon: suffix,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    ]);
  }
}

// ── Shared widgets ─────────────────────────────────────────────────────────────

class _GoogleButton extends StatelessWidget {
  final bool loading;
  final VoidCallback? onTap;
  const _GoogleButton({required this.loading, this.onTap});

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
                width: 22, height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Color(0xFF3B82F6),
                ))
            : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                // Google 'G' logo drawn with CustomPaint
                const _GoogleLogo(size: 22),
                const SizedBox(width: 12),
                const Text('Continue with Google',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E293B))),
              ]),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(children: [
      const Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Text('or', style: TextStyle(
            color: Colors.grey.shade400,
            fontSize: 13,
            fontWeight: FontWeight.w500)),
      ),
      const Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
    ]);
  }
}

/// Draws the Google multicolour "G" using CustomPaint — no SVG asset needed.
class _GoogleLogo extends StatelessWidget {
  final double size;
  const _GoogleLogo({required this.size});

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
    final double cx = size.width / 2;
    final double cy = size.height / 2;
    final double r = size.width / 2;

    // Clip to circle
    canvas.clipPath(Path()..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r)));

    final bgPaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(cx, cy), r, bgPaint);

    // Draw the four coloured arc segments
    const sweepAngles = [
      // start, sweep, colour (in degrees, clockwise from 3 o'clock)
      [-30.0, 97.0, Color(0xFF4285F4)],  // blue (top-right)
      [67.0,  97.0, Color(0xFF34A853)],  // green (bottom-right)
      [164.0, 97.0, Color(0xFFFBBC05)],  // yellow (bottom-left)
      [261.0, 99.0, Color(0xFFEA4335)],  // red (top-left)
    ];

    const deg = 3.14159265 / 180;
    final arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = r * 0.42
      ..strokeCap = StrokeCap.butt;

    final arcR = r * 0.79;
    final arcRect = Rect.fromCircle(
        center: Offset(cx, cy), radius: arcR);

    for (final seg in sweepAngles) {
      arcPaint.color = seg[2] as Color;
      canvas.drawArc(
        arcRect,
        (seg[0] as double) * deg,
        (seg[1] as double) * deg,
        false,
        arcPaint,
      );
    }

    // White horizontal bar for the "G" cut-out
    final barPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = r * 0.42
      ..strokeCap = StrokeCap.butt;
    canvas.drawLine(
      Offset(cx, cy),
      Offset(cx + arcR, cy),
      barPaint,
    );

    // Inner white circle to create ring effect
    canvas.drawCircle(Offset(cx, cy), arcR - r * 0.21, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_GoogleLogoPainter old) => false;
}
