import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const initialForm = {
  identifier: '',
  password: '',
  role: 'student',
};

export default function LoginPage() {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const identifier = formData.identifier.trim();
    const nextFieldErrors = {};

    if (!identifier) {
      nextFieldErrors.identifier = formData.role === 'admin'
        ? 'Enter your admin username or email.'
        : 'Enter your student email address.';
    } else if (formData.role === 'student' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      nextFieldErrors.identifier = 'Enter a valid email address.';
    }

    if (!formData.password) {
      nextFieldErrors.password = 'Enter your password.';
    }

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({
        identifier,
        password: formData.password,
        role: formData.role,
      });
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Invalid credentials. Check your username/email and password, then try again.');
      } else if (status === 400) {
        setError(err.response?.data?.message || 'Please check the information you entered.');
      } else if (status >= 500) {
        setError('The server could not complete your login. Please try again shortly.');
      } else if (!err.response) {
        setError('Cannot reach the server. Check that the backend is running and try again.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#1d4ed8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '12px' }}>BUCoSA Portal</p>
          <h2 style={{ margin: '8px 0 0', fontSize: '2rem', color: '#0f172a' }}>Welcome back</h2>
          {location.state?.message && <p style={{ margin: '10px 0 0', color: '#15803d' }}>{location.state.message}</p>}
        </div>

        {error && (
          <div role="alert" aria-live="polite" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '10px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Login as</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-label="Login as"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            >
              <option value="student">Student</option>
              <option value="admin">Admin / Executive</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="identifier" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
              {formData.role === 'admin' ? 'Admin username or email' : 'Student email'}
            </label>
            <input
              id="identifier"
              type={formData.role === 'student' ? 'email' : 'text'}
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder={formData.role === 'admin' ? 'Enter your username or email' : 'Enter your student email'}
              autoComplete={formData.role === 'admin' ? 'username' : 'email'}
              aria-invalid={Boolean(fieldErrors.identifier)}
              aria-describedby={fieldErrors.identifier ? 'identifier-error' : undefined}
              disabled={isSubmitting}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            {fieldErrors.identifier && <p id="identifier-error" role="alert" style={{ margin: '6px 0 0', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.identifier}</p>}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            {fieldErrors.password && <p id="password-error" role="alert" style={{ margin: '6px 0 0', color: '#b91c1c', fontSize: '13px' }}>{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px 16px', border: 'none', borderRadius: '10px', background: '#1d4ed8', color: '#fff', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ margin: '20px 0 0', color: '#64748b', textAlign: 'center' }}>
          Not a registered member? <Link to="/join" style={{ color: '#1d4ed8', fontWeight: 700 }}>Apply to join BUCoSA</Link>
        </p>
      </div>
    </div>
  );
}