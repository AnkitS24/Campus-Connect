import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
    } catch {}
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearError();
    setValidationError('');
  };

  return (
    <div className="glass rounded-2xl p-8 animate-slide-up">
      <h2 className="text-2xl font-bold mb-1">Create account</h2>
      <p className="text-text-muted text-sm mb-6">Join the CampusConnect community</p>

      {(error || validationError) && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-sm text-error">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@college.edu"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          required
        />
        <div className="relative">
          <Input
            label="Password"
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
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary-light font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
