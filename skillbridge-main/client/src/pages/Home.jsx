
import { Link } from "react-router-dom";

function Home() {
  const categories = [
    {
      icon: "WD",
      title: "Web Development",
      description: "Websites, frontend applications, and digital solutions.",
    },
    {
      icon: "GD",
      title: "Graphic Design",
      description: "Creative design services for brands, products, and content.",
    },
    {
      icon: "TU",
      title: "Tutoring",
      description: "Learn from skilled people across different subjects.",
    },
    {
      icon: "WR",
      title: "Writing",
      description: "Professional writing and content support for your needs.",
    },
    {
      icon: "TS",
      title: "Tech Support",
      description: "Practical technical help for everyday digital challenges.",
    },
    {
      icon: "HR",
      title: "Home Repair",
      description: "Connect with providers for useful home-related services.",
    },
  ];

  return (
    <main className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="eyebrow">THE SKILL MARKETPLACE</span>

            <h1>
              Find the right skills.
              <span> Get things done.</span>
            </h1>

            <p>
              SkillBridge connects customers with skilled service providers,
              making it easier to discover useful services, send requests,
              and build meaningful professional connections.
            </p>

            <div className="hero-actions">
              <Link to="/services" className="primary-button">
                Find Services
                <span aria-hidden="true">→</span>
              </Link>

              <Link to="/signup" className="secondary-button">
                Become a Provider
              </Link>
            </div>

            <div className="hero-note">
              <span className="status-dot"></span>
              Built for customers and skilled professionals
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-card main-card">
              <div className="visual-card-top">
                <div className="visual-icon">S</div>
                <div>
                  <span className="visual-label">SKILLBRIDGE</span>
                  <strong>Skills that move work forward.</strong>
                </div>
              </div>

              <div className="connection-line">
                <div className="connection-node">
                  <span>Customer</span>
                </div>

                <div className="connection-path">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="connection-node provider-node">
                  <span>Provider</span>
                </div>
              </div>

              <div className="visual-footer">
                <span>Discover</span>
                <span>Request</span>
                <span>Connect</span>
              </div>
            </div>

            <div className="floating-card floating-card-one">
              <span className="floating-icon">✓</span>
              <div>
                <strong>Approved Providers</strong>
                <small>Professional marketplace</small>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <span className="floating-icon">↗</span>
              <div>
                <strong>Share your skills</strong>
                <small>Offer your services</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-section">
        <div className="section-heading">
          <span className="eyebrow">HOW IT WORKS</span>

          <h2>A simpler way to connect skills and needs.</h2>

          <p>
            Whether you need a service or want to offer your expertise,
            SkillBridge keeps the process straightforward.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon">⌕</div>
            <h3>Discover a service</h3>
            <p>
              Explore services and find an option that matches what you need.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon">↗</div>
            <h3>Send a request</h3>
            <p>
              Contact a provider with a clear request and explain what you
              need.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon">✓</div>
            <h3>Get connected</h3>
            <p>
              Providers can review requests and respond to customers through
              the platform.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="section-heading section-heading-row">
          <div>
            <span className="eyebrow">EXPLORE CATEGORIES</span>

            <h2>Skills for everyday needs.</h2>

            <p>
              Discover different areas of expertise available through the
              SkillBridge marketplace.
            </p>
          </div>

          <Link to="/services" className="text-link">
            Explore services →
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div className="category-card" key={category.title}>
              <div className="category-icon">{category.icon}</div>

              <h3>{category.title}</h3>

              <p>{category.description}</p>

              <Link to="/services" className="category-link">
                Explore <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why SkillBridge */}
      <section className="section why-section">
        <div className="why-content">
          <span className="eyebrow">WHY SKILLBRIDGE</span>

          <h2>Built around useful connections.</h2>

          <p>
            SkillBridge is designed to make service discovery and professional
            connections clear, accessible, and straightforward.
          </p>

          <Link to="/services" className="primary-button">
            Explore Services
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">✓</div>
            <div>
              <h3>Approved providers</h3>
              <p>
                Providers can go through an approval process before offering
                services on the platform.
              </p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">⌕</div>
            <div>
              <h3>Easy service discovery</h3>
              <p>
                Customers can browse service categories and search for
                services that match their needs.
              </p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">↗</div>
            <div>
              <h3>Simple requests</h3>
              <p>
                Customers can send service requests directly to the relevant
                provider.
              </p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">◎</div>
            <div>
              <h3>Professional experience</h3>
              <p>
                A focused marketplace experience designed around skills,
                services, and real connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <span className="eyebrow">READY TO GET STARTED?</span>

          <h2>Your next opportunity starts with a skill.</h2>

          <p>
            Find a service for your next task or join SkillBridge and turn
            your skills into opportunities.
          </p>

          <div className="cta-actions">
            <Link to="/services" className="cta-light-button">
              Find a Service
            </Link>

            <Link to="/signup" className="cta-outline-button">
              Become a Provider
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;

