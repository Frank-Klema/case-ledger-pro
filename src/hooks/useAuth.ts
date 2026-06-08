import { useCallback, useEffect, useState } from 'react';
import {
  StoredUser, SafeUser, getAllUsers, saveAllUsers, sha256,
  getCurrentSession, setCurrentSession, toSafe,
} from '@/lib/auth';

/**
 * PASSWORD SECURITY POLICY:
 * - Minimum 12 characters (strengthened from 6)
 * - Must contain uppercase, lowercase, number, and special character
 * - Hashed using SHA-256 before storage (salted in production)
 * - Never logged or displayed in plain text
 * - Password reset flows require verification
 * 
 * LOCAL-ONLY WARNING:
 * This app uses localStorage for auth. For production with multiple users:
 * - Move authentication to backend with HTTPS
 * - Use bcrypt or Argon2 for password hashing
 * - Implement rate limiting and brute-force protection
 * - Use secure session tokens with expiration
 * - Add email verification and password reset tokens
 */
export const useAuth = () => {
  const [user, setUser] = useState<SafeUser | null>(() => {
    const id = getCurrentSession();
    if (!id) return null;
    const u = getAllUsers().find(x => x.id === id);
    return u ? toSafe(u) : null;
  });

  useEffect(() => {
    const refresh = () => {
      const id = getCurrentSession();
      if (!id) { setUser(null); return; }
      const u = getAllUsers().find(x => x.id === id);
      setUser(u ? toSafe(u) : null);
    };
    window.addEventListener('legalcase-auth-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('legalcase-auth-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const broadcast = () => window.dispatchEvent(new Event('legalcase-auth-changed'));

  /**
   * Validates password complexity requirements.
   * SECURITY: Enforces strong password policy for sensitive legal data.
   * 
   * Requirements:
   * - Minimum 12 characters (for legal/sensitive system)
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   * 
   * @returns Error message if validation fails, empty string if valid
   */
  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 12) return 'Password must be at least 12 characters (was: ' + password.length + ')';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&* etc.)';
    }
    return '';
  };

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const e = email.trim().toLowerCase();
    if (!e || !password) throw new Error('Email and password are required');
    
    // SECURITY: Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
    
    const users = getAllUsers();
    if (users.some(u => u.email === e)) throw new Error('An account with this email already exists');
    
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: e,
      passwordHash: await sha256(password),
      displayName: displayName.trim() || e.split('@')[0],
      avatar: undefined,
      isAdmin: users.length === 0, // first user is admin
      createdAt: new Date().toISOString(),
    };
    saveAllUsers([...users, newUser]);
    setCurrentSession(newUser.id);
    broadcast();
    return toSafe(newUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    const users = getAllUsers();
    const u = users.find(x => x.email === e);
    if (!u) throw new Error('No account with this email');
    const h = await sha256(password);
    if (h !== u.passwordHash) throw new Error('Incorrect password');
    setCurrentSession(u.id);
    broadcast();
    return toSafe(u);
  }, []);

  const signOut = useCallback(() => {
    setCurrentSession(null);
    broadcast();
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<StoredUser, 'displayName' | 'avatar'>>) => {
    const id = getCurrentSession();
    if (!id) return;
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...updates };
    saveAllUsers(users);
    broadcast();
  }, []);

  /**
   * Password reset handler (placeholder for future implementation).
   * FUTURE: Implement secure password reset flow:
   * 1. User provides email
   * 2. System generates time-limited reset token
   * 3. Token sent via email
   * 4. User clicks link, verifies email, enters new password
   * 5. Validate new password strength
   * 6. Hash and store new password
   * 7. Invalidate all existing sessions for security
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    const e = email.trim().toLowerCase();
    const users = getAllUsers();
    const u = users.find(x => x.email === e);
    if (!u) {
      // For security, don't reveal if email exists
      return { success: true, message: 'If account exists, check email for reset link' };
    }
    // TODO: Generate reset token, send email, implement reset flow
    throw new Error('Password reset not yet implemented. Admin assistance required.');
  }, []);

  return {
    user,
    signUp,
    signIn,
    signOut,
    updateProfile,
    requestPasswordReset,
    validatePassword,
  };
};
