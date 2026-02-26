'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { sendEmailVerification } from 'firebase/auth';
import { Loader, MailCheck } from 'lucide-react';

/**
 * VerifyEmailPage
 *
 * Shown to users who need to verify their email.
 * - Displays the current user's email.
 * - Allows resending the verification email.
 * - Provides a sign-out action.
 */

export const VerifyEmailPage = () => {
  const { user, signOut } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    if (!user) return;
    setIsSending(true);
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('A new verification email has been sent.');
    } catch {
      // Resend failed — user sees error message below
      setMessage('Failed to send email. Please try again in a moment.');
    }
    setIsSending(false);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md text-center bg-slate-800 p-8 rounded-lg shadow-xl">
        <MailCheck className="h-16 w-16 text-blue-500 mx-auto" />
        <h1 className="mt-4 text-2xl font-semibold">Verify Your Email</h1>
        <p className="mt-2 text-slate-300">
          Hello <span className="font-medium text-white">{user?.email}</span>,
        </p>
        <p className="mt-1 text-slate-400">
          We&apos;ve sent a verification link to your email. {/* <-- FIXED */}
        </p>
        <p className="mt-1 text-slate-400">
          Please check your inbox (and spam folder) to continue. You can close this tab after verifying.
        </p>

        <div className="mt-6 space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleResendEmail}
            disabled={isSending}
          >
            {isSending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              'Resend Verification Email'
            )}
          </Button>
          <Button
            variant="link"
            className="text-sm text-slate-400"
            onClick={signOut}
          >
            Sign out
          </Button>
        </div>
        {/* Feedback message (success or error) */}
        {message && (
          <p className="mt-4 text-sm text-green-400">{message}</p>
        )}
      </div>
    </div>
  );
};

