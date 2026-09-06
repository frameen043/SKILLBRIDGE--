import { Link } from "react-router-dom";

function About() {
  return (
    <main>
      {/* =========================
          ABOUT INTRODUCTION
      ========================= */}
      <section className="section">
        <div className="section-heading">
          <span>ABOUT SKILLBRIDGE</span>

          <h1>Connecting Customers with Skilled Service Providers</h1>

          <p>
            SkillBridge is a professional service marketplace designed
            to connect customers with service providers in one place.
            Customers can explore available services and professionals,
            while providers can offer their services through the
            SkillBridge marketplace.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>

            <div className="step-icon">C</div>

            <h3>For Customers</h3>

            <p>
              Customers can explore available services and discover
              approved professionals who provide the services they
              need.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>

            <div className="step-icon">P</div>

            <h3>For Service Providers</h3>

            <p>
              Service providers can create and manage their services
              and make them available to customers through the
              SkillBridge marketplace.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>

            <div className="step-icon">S</div>

            <h3>One Marketplace</h3>

            <p>
              SkillBridge brings customers and service providers
              together through a single platform for discovering
              services and managing service requests.
            </p>
          </article>
        </div>
      </section>

      {/* =========================
          HOW SKILLBRIDGE WORKS
      ========================= */}
      <section className="section how-section">
        <div className="section-heading">
          <span>HOW IT WORKS</span>

          <h2>A Simple Service Marketplace</h2>

          <p>
            SkillBridge keeps the process straightforward so customers
            and service providers can focus on finding and delivering
            the right services.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>

            <div className="step-icon">1</div>

            <h3>Explore Services</h3>

            <p>
              Customers browse the services available on SkillBridge
              and review the information provided by service providers.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>

            <div className="step-icon">2</div>

            <h3>Choose a Provider</h3>

            <p>
              Customers can view approved professionals and choose a
              service that matches their requirements.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>

            <div className="step-icon">3</div>

            <h3>Submit a Request</h3>

            <p>
              Customers can submit a service request with a message
              describing what they need from the provider.
            </p>
          </article>
        </div>
      </section>

      {/* =========================
          BENEFITS
      ========================= */}
      <section className="section why-section">
        <div className="why-content">
          <span>WHY SKILLBRIDGE</span>

          <h2>A Clearer Way to Find and Offer Services</h2>

          <p>
            SkillBridge provides a structured marketplace where
            customers can discover services and professionals while
            providers can present their services to potential
            customers.
          </p>

          <Link to="/services" className="text-link">
            Explore Services →
          </Link>
        </div>

        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">✓</div>

            <div>
              <h3>Service Discovery</h3>

              <p>
                Find available services through the SkillBridge
                marketplace.
              </p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">✓</div>

            <div>
              <h3>Professional Directory</h3>

              <p>
                Explore approved service providers and their available
                services.
              </p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">✓</div>

            <div>
              <h3>Service Requests</h3>

              <p>
                Customers can communicate their requirements through
                service requests.
              </p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">✓</div>

            <div>
              <h3>Organized Marketplace</h3>

              <p>
                Customers and providers have dedicated functionality
                for managing their marketplace activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT CTA
      ========================= */}
      <section className="cta-section">
        <div className="cta-content">
          <span>GET IN TOUCH</span>

          <h2>Have a Question About SkillBridge?</h2>

          <p>
            Contact us through the SkillBridge contact form and send
            your message for review.
          </p>

          <div className="cta-actions">
            <Link to="/contact" className="cta-light-button">
              Contact SkillBridge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;