import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2, Mail, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
        setMessage('This verification link is missing its token.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        if (!cancelled) {
          setStatus('success');
          setMessage('Your email address has been verified. You can return to the dashboard or sign in again.');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setMessage(handleApiError(error, 'verify the email address'));
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-display font-bold text-primary-foreground">ALERA</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            Confirm your email<br />to finish account setup
          </h1>
          <p className="text-sidebar-foreground/70 text-lg max-w-md">
            Verifying your email keeps account recovery secure and ensures system notifications reach the right inbox.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-display font-bold text-card-foreground mb-1">Verify email</h2>
          <p className="text-muted-foreground mb-6">We are checking your verification link now</p>

          {status === 'loading' && (
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Verifying your email address...
            </div>
          )}

          {status !== 'loading' && (
            <div className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${status === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
              {status === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">Back to sign in</Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">Go to dashboard</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
