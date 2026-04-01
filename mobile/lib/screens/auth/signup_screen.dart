import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import 'login_screen.dart' show _GoogleButton, _Divider;

class SignupScreen extends StatefulWidget {
  final VoidCallback onSignupSuccess;
  final VoidCallback onGoLogin;

  const SignupScreen({
    super.key,
    required this.onSignupSuccess,
    required this.onGoLogin,
  });

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  // OTP step state
  bool _otpStep = false;
  String _pendingEmail = '';
  String _pendingPassword = '';
  final _otpCtrl = TextEditingController();
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  bool _loading = false;
  bool _googleLoading = false;
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
      final auth = context.read<AuthService>();
      await auth.loginWithGoogle();
      widget.onSignupSuccess();
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      if (msg != 'Google sign-in cancelled') {
        setState(() => _error = msg);
      }
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  Future<void> _submitSignup() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      final auth = context.read<AuthService>();
      await auth.signup(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        companyName: _companyCtrl.text.trim(),
      );
      _pendingEmail = _emailCtrl.text.trim();
      _pendingPassword = _passwordCtrl.text;
      _startCooldown(60);
      setState(() { _otpStep = true; });
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
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
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (_resendCooldown > 0) return;
    setState(() { _loading = true; _error = null; });
    try {
      final auth = context.read<AuthService>();
      await auth.resendOtp(email: _pendingEmail);
      _startCooldown(60);
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: _otpStep ? _buildOtpStep() : _buildSignupForm(),
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
          const SizedBox(height: 32),
          Image.asset('assets/images/logo.png', width: 72, height: 72),
          const SizedBox(height: 24),
          const Text('Create account', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
          const SizedBox(height: 6),
          const Text('Start sharing your digital business card', style: TextStyle(fontSize: 15, color: Color(0xFF64748B))),
          const SizedBox(height: 28),

          // Google Sign-In
          _GoogleButton(
            loading: _googleLoading,
            onTap: (_loading || _googleLoading) ? null : _signInWithGoogle,
          ),

          const SizedBox(height: 24),
          _Divider(),
          const SizedBox(height: 24),

          if (_error != null) ...[
            _errorBanner(_error!),
            const SizedBox(height: 16),
          ],

          _field('Full Name', _nameCtrl, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
          const SizedBox(height: 12),
          _field('Email', _emailCtrl, keyboardType: TextInputType.emailAddress, validator: (v) => v == null || !v.contains('@') ? 'Enter valid email' : null),
          const SizedBox(height: 12),
          _field('Company Name', _companyCtrl, validator: (v) => v == null || v.isEmpty ? 'Required' : null),
          const SizedBox(height: 12),
          _field('Password', _passwordCtrl, obscure: true, validator: (v) => v == null || v.length < 6 ? 'Min 6 characters' : null),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
                    onPressed: (_loading || _googleLoading) ? null : _submitSignup,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3B82F6),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _loading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(height: 16),

          Center(
            child: TextButton(
              onPressed: widget.onGoLogin,
              child: const Text.rich(TextSpan(children: [
                TextSpan(text: 'Already have an account? ', style: TextStyle(color: Color(0xFF64748B))),
                TextSpan(text: 'Sign in', style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w600)),
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
        const SizedBox(height: 32),
        Image.asset('assets/images/logo.png', width: 72, height: 72),
        const SizedBox(height: 24),
        const Text('Check your email', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
        const SizedBox(height: 6),
        Text('We sent a 6-digit code to $_pendingEmail', style: const TextStyle(fontSize: 15, color: Color(0xFF64748B))),
        const SizedBox(height: 28),

        if (_error != null) ...[
          _errorBanner(_error!),
          const SizedBox(height: 16),
        ],

        // OTP field
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Verification Code', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
          const SizedBox(height: 4),
          TextField(
            controller: _otpCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 8),
            decoration: InputDecoration(
              counterText: '',
              filled: true, fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
              hintText: '000000',
              hintStyle: const TextStyle(color: Color(0xFFCBD5E1), letterSpacing: 8),
            ),
          ),
        ]),
        const SizedBox(height: 24),

        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: _loading ? null : _verifyOtp,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3B82F6),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: _loading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Verify Email', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
        ),
        const SizedBox(height: 16),

        Center(
          child: _resendCooldown > 0
              ? Text('Resend code in ${_resendCooldown}s', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14))
              : TextButton(
                  onPressed: _loading ? null : _resendOtp,
                  child: const Text('Resend code', style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w600)),
                ),
        ),
        const SizedBox(height: 8),
        Center(
          child: TextButton(
            onPressed: () => setState(() { _otpStep = false; _error = null; }),
            child: const Text('← Back to sign up', style: TextStyle(color: Color(0xFF64748B))),
          ),
        ),
      ],
    );
  }

  Widget _errorBanner(String message) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Text(message, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
    );
  }

  Widget _field(String label, TextEditingController ctrl, {
    TextInputType? keyboardType,
    bool obscure = false,
    String? Function(String?)? validator,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
      const SizedBox(height: 4),
      TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        obscureText: obscure,
        validator: validator,
        decoration: InputDecoration(
          filled: true, fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 2)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    ]);
  }
}
