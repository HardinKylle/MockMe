' use client'

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button'; 
import { sendEmailVerification } from 'firebase/auth';
import { Loader, MailCheck } from 'lucide-react';

export const VerifyEmailPage = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage(null);
    try {
      await sendEmailVerification(user);
      setMessage('A new verification email has been sent.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to send email. Please try again later.');
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center rounded-lg border shadow-xl bg-linear-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/80 border border-blue-700">
          <MailCheck className="h-6 w-6 text-blue-300" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-white">
          Verify Your Email
        </h2>
        <p className="mt-2 text-slate-300">
          We've sent a verification link to{' '}
          <strong className="text-white">{user?.email}</strong>.
        </p>
        <p className="mt-1 text-slate-400">
          Please check your inbox (and spam folder) to continue. You can close this tab after verifying.
        </p>

        <div className="mt-6 space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleResendEmail}
            disabled={isLoading}
          >
            {isLoading ? (
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
            Sign out and use a different account
          </Button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-green-400">{message}</p>
        )}
      </div>
    </div>
  );
};

