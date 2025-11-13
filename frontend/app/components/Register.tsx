'use client';

import React, { useState } from 'react';
import { authAPI } from '../services/api';

interface RegisterProps {
  onSuccess: (token: string, user: { id: number; email: string; name: string }, player: { id: number; name: string } | null) => void;
  onSwitchToLogin: () => void;
}

interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&]/.test(pwd),
    };
  };

  const passwordStrength = checkPasswordStrength(password);
  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({ name, email, password });
      onSuccess(response.access_token, response.user, response.player);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (isValid: boolean) => {
    return isValid ? 'var(--success)' : 'var(--gray-400)';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-lg shadow-xl p-8"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-primary)',
              }}
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-medium)',
                color: 'var(--text-primary)',
              }}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: isPasswordValid
                  ? 'var(--success)'
                  : 'var(--border-medium)',
                color: 'var(--text-primary)',
              }}
              placeholder="••••••••"
            />
            
            {/* Indicador de força da senha */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs">
                  <span
                    style={{
                      color: getStrengthColor(passwordStrength.length),
                    }}
                  >
                    {passwordStrength.length ? '✓' : '○'}
                  </span>
                  <span
                    className="ml-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    style={{
                      color: getStrengthColor(passwordStrength.uppercase),
                    }}
                  >
                    {passwordStrength.uppercase ? '✓' : '○'}
                  </span>
                  <span
                    className="ml-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    1 uppercase letter
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    style={{
                      color: getStrengthColor(passwordStrength.lowercase),
                    }}
                  >
                    {passwordStrength.lowercase ? '✓' : '○'}
                  </span>
                  <span
                    className="ml-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    1 lowercase letter
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    style={{
                      color: getStrengthColor(passwordStrength.number),
                    }}
                  >
                    {passwordStrength.number ? '✓' : '○'}
                  </span>
                  <span
                    className="ml-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    1 number
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span
                    style={{
                      color: getStrengthColor(passwordStrength.special),
                    }}
                  >
                    {passwordStrength.special ? '✓' : '○'}
                  </span>
                  <span
                    className="ml-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    1 special character (@$!%*?&)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: passwordsMatch
                  ? 'var(--success)'
                  : confirmPassword
                  ? 'var(--danger)'
                  : 'var(--border-medium)',
                color: 'var(--text-primary)',
              }}
              placeholder="••••••••"
            />
            {confirmPassword && !passwordsMatch && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'var(--danger)' }}
              >
                Passwords do not match
              </p>
            )}
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
            className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)',
            }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


