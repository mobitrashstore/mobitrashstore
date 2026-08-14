/**
 * Utility to convert raw Firebase / technical auth errors into clean, user-friendly messages.
 * Never exposes Firebase, API keys, or raw exception codes to the public.
 */
export function formatAuthErrorMessage(err: any): string {
  if (!err) return 'An error occurred. Please try again.';

  const code = (err.code || err.message || String(err)).toLowerCase();

  // Incorrect Password / Invalid Credentials
  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/wrong-password') ||
    code.includes('invalid-credential') ||
    code.includes('wrong-password')
  ) {
    return 'Incorrect email or password. Please try again.';
  }

  // Account not found
  if (code.includes('auth/user-not-found') || code.includes('user-not-found')) {
    return 'No account found with this email. Please check your email or sign up.';
  }

  // Invalid email format
  if (code.includes('auth/invalid-email') || code.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }

  // Email already in use
  if (
    code.includes('auth/email-already-in-use') ||
    code.includes('email-already-in-use') ||
    code.includes('email already in use')
  ) {
    return 'An account with this email already exists. Please log in instead.';
  }

  // Weak password
  if (
    code.includes('auth/weak-password') ||
    code.includes('weak-password') ||
    code.includes('password should be at least')
  ) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  // Account disabled
  if (code.includes('auth/user-disabled') || code.includes('user-disabled')) {
    return 'This account has been disabled. Please contact customer support.';
  }

  // Rate limiting / too many failed attempts
  if (code.includes('auth/too-many-requests') || code.includes('too-many-requests')) {
    return 'Too many failed attempts. Please wait a few minutes before trying again.';
  }

  // Network connection error
  if (
    code.includes('auth/network-request-failed') ||
    code.includes('network-request-failed') ||
    code.includes('network error')
  ) {
    return 'Network connection problem. Please check your internet connection.';
  }

  // Popup cancelled or blocked
  if (code.includes('auth/popup-closed-by-user') || code.includes('popup-closed-by-user')) {
    return 'Sign-in was cancelled.';
  }
  if (code.includes('auth/popup-blocked') || code.includes('popup-blocked')) {
    return 'Pop-up window was blocked by your browser. Please allow popups and retry.';
  }

  // Filter out any technical Firebase / coding jargon
  if (
    code.includes('firebase') ||
    code.includes('auth/') ||
    code.includes('internal error') ||
    code.includes('api') ||
    code.includes('error (')
  ) {
    return 'Unable to sign in. Please verify your details and try again.';
  }

  return err.message || 'Authentication failed. Please verify your details.';
}
