import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clipboard, ShieldCheck } from 'lucide-react';
import {
  completeStudentRegistration,
  getMembershipApplicationStatus,
  submitMembershipApplication,
} from '../../api/authService';
import '../publicPages.css';

const initialApplication = {
  student_id: '',
  full_name: '',
  email: '',
  year_of_study: '',
  course: '',
};

export function MembershipApplicationForm({ staffMode = false }) {
  const [application, setApplication] = useState(initialApplication);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copyError, setCopyError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (event) => {
    setApplication((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await submitMembershipApplication({
        ...application,
        year_of_study: application.year_of_study || null,
        course: Number(application.course),
      }, staffMode);
      setResult(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit the application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyActivationCode = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(result.activationCode);
      setCopyError('');
      setCopied(true);
    } catch {
      setCopyError('Copy failed. Select the code above and copy it manually.');
    }
  };

  return (
    <section className="membership-panel">
      <span className="public-eyebrow"><ShieldCheck size={16} /> Admin-approved membership</span>
      <h1>{result ? 'Application submitted' : staffMode ? 'Register a student' : 'Apply to join BUCoSA'}</h1>
      {result ? (
        <div className="application-success">
          <CheckCircle2 size={28} />
          <p>{result.message}</p>
          <div className="activation-code">
            <span>Student access code — save and share this securely</span>
            <code>{result.activationCode}</code>
            <button
              type="button"
              className="public-button public-button-secondary"
              onClick={copyActivationCode}
            >
              <Clipboard size={16} /> {copied ? 'Copied' : 'Copy access code'}
            </button>
          </div>
          {copyError && <p className="form-error" role="alert">{copyError}</p>}
          <p className="form-help">The student will use this code to check the decision and set a password after approval.</p>
          <Link to="/join/status" className="back-link">Go to application status</Link>
        </div>
      ) : (
        <>
          <p className="membership-intro">
            {staffMode
              ? 'Submit the student details for admin review. Share the access code shown after submission with the student.'
              : 'Send your student details for review. You can set your password after an admin approves the application.'}
          </p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <form className="membership-form" onSubmit={handleSubmit}>
            <label>Student ID<input name="student_id" value={application.student_id} onChange={handleChange} required autoComplete="off" /></label>
            <label>Full name<input name="full_name" value={application.full_name} onChange={handleChange} required autoComplete="name" /></label>
            <label>Email address<input name="email" type="email" value={application.email} onChange={handleChange} required autoComplete="email" /></label>
            <label>Year of study<input name="year_of_study" type="number" min="1" max="10" value={application.year_of_study} onChange={handleChange} /></label>
            <label>Course ID<input name="course" type="number" min="1" step="1" value={application.course} onChange={handleChange} required /></label>
            <button className="public-button public-button-primary form-submit" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export function MembershipStatusPage() {
  const [activationCode, setActivationCode] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [activating, setActivating] = useState(false);
  const navigate = useNavigate();

  const checkStatus = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setChecking(true);
    try {
      const result = await getMembershipApplicationStatus(activationCode.trim());
      setStatus(result.status);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to check the application.');
    } finally {
      setChecking(false);
    }
  };

  const activateAccount = async (event) => {
    event.preventDefault();
    setError('');
    setActivating(true);
    try {
      await completeStudentRegistration(activationCode.trim(), password);
      navigate('/login', { replace: true, state: { message: 'Your account is active. Sign in with your email and new password.' } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to activate the account.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <section className="membership-panel">
      <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to BUCoSA</Link>
      <span className="public-eyebrow"><ShieldCheck size={16} /> Membership application</span>
      <h1>Check your application</h1>
      <p className="membership-intro">Enter the access code shown when the application was submitted.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="membership-form" onSubmit={checkStatus}>
        <label>Application access code<input value={activationCode} onChange={(event) => setActivationCode(event.target.value)} required autoComplete="off" /></label>
        <button className="public-button public-button-primary form-submit" type="submit" disabled={checking}>
          {checking ? 'Checking…' : 'Check status'}
        </button>
      </form>
      {status && (
        <div className={`application-status status-${status}`}>
          <strong>Status: {status}</strong>
          {status === 'pending' && <p>Your application is waiting for admin review.</p>}
          {status === 'rejected' && <p>This application was not approved. Contact the association for more information.</p>}
          {status === 'completed' && <p>This application has already been used to activate an account. You can sign in.</p>}
          {status === 'approved' && (
            <form className="membership-form activation-form" onSubmit={activateAccount}>
              <p>Your application is approved. Set a password to activate your student account.</p>
              <label>Create password<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></label>
              <button className="public-button public-button-primary form-submit" type="submit" disabled={activating}>
                {activating ? 'Activating…' : 'Set password and continue'}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

export default function MembershipPage({ staffMode = false }) {
  return (
    <main className="membership-page">
      <Link className="public-brand membership-brand" to="/">
        <span className="public-brand-mark">B</span>
        <span><strong>BUCoSA</strong><small>Computing Students Association</small></span>
      </Link>
      <MembershipApplicationForm staffMode={staffMode} />
    </main>
  );
}
