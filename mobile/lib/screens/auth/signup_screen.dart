import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/google_auth_widgets.dart';

class SignupScreen extends StatefulWidget {
  final VoidCallback onSignupSuccess;
  final VoidCallback onGoLogin;

  const SignupScreen({super.key, required this.onSignupSuccess, required this.onGoLogin});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  bool _otpStep = false;
  String _pendingEmail = '';
  String _pendingPassword = '';
  final _otpCtrl = TextEditingController();
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  bool _loading = false;
  bool _googleLoading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _companyCtrl.dispose();
    _passwordCtrl.dispose();
    _otpCtrl.dispose();
    _cooldownTimer?.cancel();
    super.dispose();
  }

  void _startCooldown(int seconds) {
    setState(() => _resendCooldown = seconds);
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendCooldown <= 1) {
        t.cancel();
        if (mounted) setState(() => _resendCooldown = 0);
      } else {
        if (mounted) setState(() => _resendCooldown--);
      }
    });
  }

  Future<void> _signInWithGoogle() async {
    setState(() { _googleLoading = true; _error = null; });
    try {
      await context.read<AuthService>().loginWithGoogle();
      widget.onSignupSuccess();
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      if (msg != 'Google sign-in cancelled') setState(() => _error = msg);
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  Future<void> _submitSignup() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await context.read<AuthService>().signup(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        companyName: _companyCtrl.text.trim(),
      );
      _pendingEmail = _emailCtrl.text.trim();
      _pendingPassword = _passwordCtrl.text;
      _startCooldown(60);
      setState(() => _otpStep = true);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final code = _otpCtrl.text.trim();
    if (code.length != 6) {
      setState(() => _error = 'Please enter the 6-digit code');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final auth = context.read<AuthService>();
      await auth.verifyOtp(email: _pendingEmail, code: code);
      await auth.login(_pendingEmail, _pendingPassword);
      widget.onSignupSuccess();
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (_resendCooldown > 0) return;
    setState(() { _loading = true; _error = null; });
    try {
      await context.read<AuthService>().resendOtp(email: _pendingEmail);
      _startCooldown(60);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
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
            child: _otpStep ? _buildOtpStep() : _buildSignupForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildSignupForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              width: 52, height: 52,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                gradient: const LinearGradient(colors: [DarkColors.gradient1, DarkColors.gradient2]),
              ),
              padding: const EdgeInsets.all(8),
              child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
            ),
            const SizedBox(width: 12),
            const Text('LynQ', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: DarkColors.textPrimary, letterSpacing: -0.5)),
          ]),
          const SizedBox(height: 40),

          const Text('Create account', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: DarkColors.textPrimary, letterSpacing: -0.5)),
          const SizedBox(height: 6),
          const Text('Start sharing your digital business card', style: TextStyle(fontSize: 15, color: DarkColors.textSecondary)),
          const SizedBox(height: 32),

          GoogleSignInButton(
            loading: _googleLoading,
            onTap: (_loading || _googleLoading) ? null : _signInWithGoogle,
          ),
          const SizedBox(height: 24),
          const OrDivider(),
          const SizedBox(height: 24),

          if (_error != null) ...[
            _ErrorBanner(message: _error!),
            const SizedBox(height: 20),
          ],

          _DarkField(label: 'Full Name', controller: _nameCtrl,
              validator: (v) => v == null || v.isEmpty ? 'Required' : null),
          const SizedBox(height: 16),
          _DarkField(label: 'Email', controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null),
          const SizedBox(height: 16),
          _DarkField(label: 'Company Name', controller: _companyCtrl,
              validator: (v) => v == null || v.isEmpty ? 'Required' : null),
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
              onPressed: (_loading || _googleLoading) ? null : _submitSignup,
              child: _loading
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Create Account'),
            ),
          ),
          const SizedBox(height: 20),

          Center(
            child: TextButton(
              onPressed: widget.onGoLogin,
              child: const Text.rich(TextSpan(children: [
                TextSpan(text: 'Already have an account? ', style: TextStyle(color: DarkColors.textSecondary)),
                TextSpan(text: 'Sign in', style: TextStyle(color: DarkColors.primary, fontWeight: FontWeight.w600)),
              ])),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Back button
        GestureDetector(
          onTap: () => setState(() { _otpStep = false; _error = null; }),
          child: const Row(children: [
            Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: DarkColors.textSecondary),
            SizedBox(width: 4),
            Text('Back to sign up', style: TextStyle(color: DarkColors.textSecondary, fontSize: 14)),
          ]),
        ),
        const SizedBox(height: 40),

        // Icon
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [DarkColors.gradient1, DarkColors.gradient2]),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(Icons.mark_email_unread_outlined, color: Colors.white, size: 32),
        ),
        const SizedBox(height: 24),

        const Text('Check your email', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: DarkColors.textPrimary, letterSpacing: -0.5)),
        const SizedBox(height: 8),
        Text.rich(TextSpan(children: [
          const TextSpan(text: 'We sent a 6-digit code to\n', style: TextStyle(fontSize: 15, color: DarkColors.textSecondary)),
          TextSpan(text: _pendingEmail, style: const TextStyle(fontSize: 15, color: DarkColors.textPrimary, fontWeight: FontWeight.w600)),
        ])),
        const SizedBox(height: 32),

        if (_error != null) ...[
          _ErrorBanner(message: _error!),
          const SizedBox(height: 20),
        ],

        // OTP field
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Verification Code', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: DarkColors.textSecondary, letterSpacing: 0.3)),
          const SizedBox(height: 8),
          TextField(
            controller: _otpCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: 12, color: DarkColors.textPrimary),
            decoration: InputDecoration(
              counterText: '',
              filled: true,
              fillColor: DarkColors.elevated,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: DarkColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: DarkColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: DarkColors.primary, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              hintText: '000000',
              hintStyle: const TextStyle(color: DarkColors.textMuted, fontSize: 28, letterSpacing: 12),
            ),
          ),
        ]),
        const SizedBox(height: 28),

        SizedBox(
          width: double.infinity, height: 54,
          child: ElevatedButton(
            onPressed: _loading ? null : _verifyOtp,
            child: _loading
                ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Verify Email'),
          ),
        ),
        const SizedBox(height: 20),

        Center(
          child: _resendCooldown > 0
              ? Text('Resend code in ${_resendCooldown}s',
                  style: const TextStyle(color: DarkColors.textMuted, fontSize: 14))
              : TextButton(
                  onPressed: _loading ? null : _resendOtp,
                  child: const Text('Resend code',
                    style: TextStyle(color: DarkColors.primary, fontWeight: FontWeight.w600)),
                ),
        ),
      ],
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
