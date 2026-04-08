import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/google_auth_widgets.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  final VoidCallback onGoSignup;

  const LoginScreen({super.key, required this.onLoginSuccess, required this.onGoSignup});

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
      await context.read<AuthService>().login(_emailCtrl.text.trim(), _passwordCtrl.text);
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

  Future<void> _googleLogin() async {
    setState(() { _googleLoading = true; _error = null; });
    try {
      await context.read<AuthService>().loginWithGoogle();
      widget.onLoginSuccess();
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      if (msg != 'Google sign-in cancelled') setState(() => _error = msg);
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF060D1A), Color(0xFF0D1526), Color(0xFF060D1A)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(28, 40, 28, 28),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo + brand
                  Row(children: [
                    Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(
                          colors: [DarkColors.gradient1, DarkColors.gradient2],
                        ),
                      ),
                      padding: const EdgeInsets.all(8),
                      child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'LynQ',
                      style: TextStyle(
                        fontSize: 24, fontWeight: FontWeight.w800,
                        color: DarkColors.textPrimary, letterSpacing: -0.5,
                      ),
                    ),
                  ]),
                  const SizedBox(height: 40),

                  const Text('Welcome back', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: DarkColors.textPrimary, letterSpacing: -0.5)),
                  const SizedBox(height: 6),
                  const Text('Sign in to your LynQ account', style: TextStyle(fontSize: 15, color: DarkColors.textSecondary)),
                  const SizedBox(height: 32),

                  // Google
                  GoogleSignInButton(
                    loading: _googleLoading,
                    onTap: (_loading || _googleLoading) ? null : _googleLogin,
                  ),
                  const SizedBox(height: 24),
                  const OrDivider(),
                  const SizedBox(height: 24),

                  if (_error != null) ...[
                    _ErrorBanner(message: _error!),
                    const SizedBox(height: 20),
                  ],

                  _DarkField(
                    label: 'Email',
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
                  ),
                  const SizedBox(height: 16),
                  _DarkField(
                    label: 'Password',
                    controller: _passwordCtrl,
                    obscure: _obscure,
                    suffix: IconButton(
                      icon: Icon(
                        _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 20, color: DarkColors.textMuted,
                      ),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                    validator: (v) => v == null || v.length < 6 ? 'Minimum 6 characters' : null,
                  ),
                  const SizedBox(height: 28),

                  SizedBox(
                    width: double.infinity, height: 54,
                    child: ElevatedButton(
                      onPressed: (_loading || _googleLoading) ? null : _submit,
                      child: _loading
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Sign In'),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Center(
                    child: TextButton(
                      onPressed: widget.onGoSignup,
                      child: const Text.rich(TextSpan(children: [
                        TextSpan(text: "Don't have an account? ", style: TextStyle(color: DarkColors.textSecondary)),
                        TextSpan(text: 'Sign up', style: TextStyle(color: DarkColors.primary, fontWeight: FontWeight.w600)),
                      ])),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Shared dark widgets ────────────────────────────────────────────────────

class _DarkField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final bool obscure;
  final Widget? suffix;
  final String? Function(String?)? validator;
  final int maxLines;

  const _DarkField({
    required this.label,
    required this.controller,
    this.keyboardType,
    this.obscure = false,
    this.suffix,
    this.validator,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: DarkColors.textSecondary, letterSpacing: 0.3)),
      const SizedBox(height: 6),
      TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscure,
        validator: validator,
        maxLines: maxLines,
        style: const TextStyle(color: DarkColors.textPrimary, fontSize: 14),
        decoration: InputDecoration(suffixIcon: suffix),
      ),
    ]);
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: DarkColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DarkColors.error.withOpacity(0.3)),
      ),
      child: Row(children: [
        const Icon(Icons.error_outline, color: DarkColors.error, size: 16),
        const SizedBox(width: 8),
        Expanded(child: Text(message, style: const TextStyle(color: DarkColors.error, fontSize: 13))),
      ]),
    );
  }
}
