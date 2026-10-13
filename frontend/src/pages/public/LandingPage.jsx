import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Newspaper, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../publicPages.css';

const highlights = [
  {
    icon: CalendarDays,
    title: 'Campus events',
    description: 'Keep up with computing events, workshops, and association activities.',
  },
  {
    icon: BookOpen,
    title: 'Academic resources',
    description: 'Find learning resources and past papers shared with BUCoSA members.',
  },
  {
    icon: Newspaper,
    title: 'News and updates',
    description: 'Read association announcements and updates from the executive team.',
  },
];

export default function LandingPage() {
  return (
    <main className="public-site">
      <header className="public-nav">
        <Link className="public-brand" to="/" aria-label="BUCoSA home">
          <span className="public-brand-mark">B</span>
          <span><strong>BUCoSA</strong><small>Computing Students Association</small></span>
        </Link>
        <nav className="public-nav-links" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#member-benefits">Member access</a>
          <Link className="public-nav-login" to="/login">Member login</Link>
        </nav>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-eyebrow"><GraduationCap size={16} /> Busitema University</span>
          <h1>Build, learn, and belong with <span>BUCoSA.</span></h1>
          <p>
            The home of Busitema University computing students. Discover association updates,
            learning resources, and campus activities, then apply to become a registered member.
          </p>
          <div className="public-hero-actions">
            <Link className="public-button public-button-primary" to="/join">
              Apply for membership <ArrowRight size={18} />
            </Link>
            <Link className="public-button public-button-secondary" to="/join/status">
              Check an application
            </Link>
          </div>
          <p className="public-approval-note"><ShieldCheck size={16} /> Membership is confirmed by a BUCoSA admin.</p>
        </div>
        <div className="public-hero-card" aria-label="BUCoSA member portal overview">
          <div className="hero-card-top">
            <span className="hero-card-icon"><GraduationCap size={22} /></span>
            <span className="hero-card-label">YOUR STUDENT COMMUNITY</span>
          </div>
          <h2>Connect your curiosity to opportunity.</h2>
          <p>One community for computing students to learn together and stay informed.</p>
          <div className="hero-card-rule" />
          <div className="hero-card-footer"><span>Membership application</span><strong>Open to students</strong></div>
        </div>
      </section>

      <section className="public-highlights" id="member-benefits">
        <div className="public-section-heading">
          <span className="public-eyebrow">Explore BUCoSA</span>
          <h2>Stay connected to what matters</h2>
          <p>Access useful association information before you register. Member-only services require an approved account.</p>
        </div>
        <div className="public-highlight-grid">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article className="public-highlight-card" key={title}>
              <span className="highlight-icon"><Icon size={21} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-about" id="about">
        <div>
          <span className="public-eyebrow">About the association</span>
          <h2>A community for Busitema’s computing students</h2>
        </div>
        <p>
          BUCoSA brings computing students together around learning, collaboration, and campus life.
          Students can submit a membership application themselves, or an executive can submit it on
          their behalf. Every application is reviewed by an admin before an account can be activated.
        </p>
      </section>

      <footer className="public-footer">
        <span>BUCoSA · Busitema University Computing Students Association</span>
        <div><Link to="/join">Apply for membership</Link><Link to="/login">Member login</Link></div>
      </footer>
    </main>
  );
}
