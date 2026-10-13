import { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, RefreshCw, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPendingMembershipApplications, reviewMembershipApplication } from '../../api/authService';
import { useAuth } from '../../hooks/useAuth';
import '../publicPages.css';

export default function MembershipApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const role = String(user?.role || user?.userType || '').toLowerCase();
  const canApprove = role === 'admin' || role === 'super_admin';

  const fetchApplications = useCallback(() => getPendingMembershipApplications(), []);

  const loadApplications = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const result = await fetchApplications();
      setApplications(result.applications || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load pending applications.');
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  useEffect(() => {
    if (!canApprove) return undefined;

    let active = true;
    fetchApplications()
      .then((result) => {
        if (active) setApplications(result.applications || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load pending applications.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canApprove, fetchApplications]);

  const review = async (applicationId, decision) => {
    setReviewingId(applicationId);
    setError('');
    try {
      await reviewMembershipApplication(applicationId, decision);
      setApplications((current) => current.filter((application) => application.id !== applicationId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this application.');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <main className="admin-applications-page">
      <header className="admin-applications-header">
        <div>
          <span className="public-eyebrow"><Clock3 size={16} /> Member management</span>
          <h1>Membership applications</h1>
          <p>Review student applications before their accounts can be activated.</p>
        </div>
        <div className="admin-application-actions">
          <Link className="public-button public-button-primary" to="/admin/memberships/new"><UserPlus size={17} /> Register student</Link>
          {canApprove && <button className="public-button public-button-secondary" type="button" onClick={loadApplications} disabled={loading}><RefreshCw size={16} /> Refresh</button>}
          <Link className="public-button public-button-secondary" to="/dashboard">Dashboard</Link>
        </div>
      </header>

      {!canApprove ? (
        <section className="application-list-empty">
          <h2>Admin approval required</h2>
          <p>Executives can submit an application on a student’s behalf, but only an admin can review applications.</p>
        </section>
      ) : error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : loading ? (
        <p className="application-list-empty">Loading applications…</p>
      ) : applications.length === 0 ? (
        <section className="application-list-empty">
          <Check size={24} />
          <h2>All caught up</h2>
          <p>There are no membership applications waiting for review.</p>
        </section>
      ) : (
        <section className="application-list" aria-label="Pending membership applications">
          {applications.map((application) => (
            <article className="application-row" key={application.id}>
              <div className="application-student">
                <span className="application-avatar">{application.full_name?.charAt(0)?.toUpperCase() || 'S'}</span>
                <div>
                  <h2>{application.full_name}</h2>
                  <p>{application.email}</p>
                </div>
              </div>
              <dl className="application-details">
                <div><dt>Student ID</dt><dd>{application.student_id}</dd></div>
                <div><dt>Year</dt><dd>{application.year_of_study || 'Not provided'}</dd></div>
                <div><dt>Course ID</dt><dd>{application.course}</dd></div>
                <div><dt>Submitted</dt><dd>{new Date(application.created_at).toLocaleDateString()}</dd></div>
              </dl>
              {canApprove && (
                <div className="application-review-actions">
                  <button type="button" className="approve-button" onClick={() => review(application.id, 'approved')} disabled={reviewingId === application.id} aria-label={`Approve ${application.full_name}`}>
                    <Check size={17} /> Approve
                  </button>
                  <button type="button" className="reject-button" onClick={() => review(application.id, 'rejected')} disabled={reviewingId === application.id} aria-label={`Reject ${application.full_name}`}>
                    <X size={17} /> Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
