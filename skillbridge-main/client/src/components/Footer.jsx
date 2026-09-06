
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="brand-mark">S</span>
            <span>SkillBridge</span>
          </Link>

          <p>
            A professional marketplace connecting customers with skilled
            service providers for reliable, practical solutions.
          </p>
        </div>

        <div className="footer-column">
          <h3>Platform</h3>

          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Get Started</Link>
        </div>

        <div className="footer-column">
          <h3>For Users</h3>

          <span>Discover Services</span>
          <span>Send Requests</span>
          <span>Offer Your Skills</span>
          <span>Grow Your Network</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} SkillBridge. All rights reserved.
        </p>

        <p>Connecting skills with opportunity.</p>
      </div>
    </footer>
  );
}

export default Footer;

