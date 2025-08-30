import "../css/about.css";
import '../styles.css';

export default function About() {
  return (
    <main className="page-about">
      <section className="about-hero">
        <h1>من نحن</h1>
        <p>
          متجر FashionStore مشروع تعليمي للتجارة الإلكترونية. نوفّر تجربة شراء
          بسيطة، جودة عالية ودفع آمن.
        </p>
      </section>

      <section className="about-grid">
        <div className="about-card">
          <h3>خدماتنا</h3>
          <ul>
            <li>ملابس واكسسوارات</li>
            <li>شحن داخل أوروبا</li>
            <li>دعم عبر البريد</li>
          </ul>
        </div>

        <div className="about-card">
          <h3>تواصل</h3>
          <ul>
            <li>📧 support@fashionstore.demo</li>
            <li>📞 +49 30 123 456</li>
            <li>📍 Musterstraße 1, 10115 Berlin, Germany</li>
          </ul>
        </div>

        <div className="about-card">
          <h3>تابعنا</h3>
          <div className="about-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              X
            </a>
          </div>
        </div>
      </section>

      <figure className="about-map">
        <img
          alt="Berlin map"
          src="https://maps.googleapis.com/maps/api/staticmap?center=Berlin+Germany&zoom=12&size=600x250&scale=2&maptype=roadmap&markers=color:red|Berlin"
        />
      </figure>
    </main>
  );
}
