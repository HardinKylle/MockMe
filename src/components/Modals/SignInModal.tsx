'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/contexts/ModalContext'; // Using the name we discussed
import { Button } from '@/components/ui/Button'; // Using lowercase
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { X, Loader } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
type AuthMode = 'signIn' | 'signUp';

export const SignInModal = () => {
  const { isSignInModalOpen, closeSignInModal } = useModal();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Client-side validation for Sign Up ---
    if (mode === 'signUp') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      handleClose(); 
    } catch (err) {
      // --- Handle specific Firebase errors ---
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('This email address is already in use.');
            break;
          case 'auth/weak-password':
            setError('Password must be at least 6 characters.');
            break;
          case 'auth/invalid-credential':
            setError('Invalid email or password.');
            break;
          default:
            setError('An unknown error occurred. Please try again.');
        }
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword(''); 
    setMode('signIn');
    closeSignInModal();
  };

  if (!isSignInModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-sm rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50"
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h3 className="text-lg font-medium text-white">
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </h3>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            <X className="h-5 w-5 text-slate-400" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* --- 3. ADD CONFIRM PASSWORD & REQUIREMENTS  --- */}
            {mode === 'signUp' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                  <li className={password.length >= 6 ? 'text-green-400' : ''}>
                    At least 6 characters
                  </li>
                  <li className={password === confirmPassword && password.length > 0 ? 'text-green-400' : ''}>
                    Passwords must match
                  </li>
                </ul>
              </>
            )}


            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-700/50 flex flex-col items-center gap-3">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                mode === 'signIn' ? 'Sign In' : 'Create Account'
              )}
            </Button>
            
            <Button
              type="button"
              variant="link"
              className="text-sm text-slate-400"
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setError(null); 
              }}
              disabled={isLoading}
            >
              {mode === 'signIn'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
