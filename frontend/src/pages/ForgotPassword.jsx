import { useState } from 'react';
import { Link,Navigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ForgotPassword = () => {
  const [mail, setMail] = useState('');
  const [success, setSuccess] = useState(false);
  const { forgotPassword,isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
        await forgotPassword(mail);
        setSuccess(true);
    } catch {}
  };

  const handleChange = (e) => {
    setMail(e.target.value);
    clearError();
  };

  return (
    <div className="glass rounded-2xl p-8 animate-slide-up">
      <h2 className="text-2xl font-bold mb-1">Forgot Password</h2>
      <p className="text-text-muted text-sm mb-6">Enter your email to receive a password reset link</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
          {error}
        </div>
      )}
        {success && (
        <div className="text-green-500 text-sm">
            Check your email for reset link
        </div>
        )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@college.edu"
          icon={Mail}
          value={mail}
          onChange={handleChange}
          required
        />
        
        

        <Button type="submit" variant="gradient" className="w-full" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

    </div>
  );
};

export default ForgotPassword;
