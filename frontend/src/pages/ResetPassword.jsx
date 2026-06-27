import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ResetPassword = () => {
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const token = window.location.pathname.split('/').pop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    try {
      await resetPassword(
        token,
        form.password
      );

      navigate('/login');
    } catch {}
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearError();
    setValidationError('');
  };

  return (
    <div className="glass rounded-2xl p-8 animate-slide-up">
      <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
      <p className="text-text-muted text-sm mb-6">Enter your new password below</p>

      {(error || validationError) && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="relative">
          <Input
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 6 characters"
            icon={Lock}
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 bottom-2.5 text-text-muted hover:text-text"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button type="submit" variant="gradient" className="w-full" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
