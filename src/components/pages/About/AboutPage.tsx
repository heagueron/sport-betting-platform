import React from 'react';
import './AboutPage.css';
import Card, { CardBody } from '../../common/Card/Card';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Us</h1>
        <p className="page-description">
          Learn more about Sports Betting Platform and our mission.
        </p>
      </div>

      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          Sports Betting Platform was founded in 2025 with a simple mission: to create the most user-friendly and
          transparent sports betting experience on the web. We believe that betting should be fun, fair, and accessible
          to everyone.
        </p>
        <p>
          Our team of sports enthusiasts and technology experts has worked tirelessly to build a platform that offers
          competitive odds, a wide range of sports and events, and a seamless user experience.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <Card className="value-card">
            <CardBody>
              <h3>Transparency</h3>
              <p>
                We believe in complete transparency in all our operations. From our odds calculation to our fees,
                everything is clearly explained and accessible to our users.
              </p>
            </CardBody>
          </Card>

          <Card className="value-card">
            <CardBody>
              <h3>Fairness</h3>
              <p>
                We are committed to providing fair odds and ensuring that all bets are settled accurately and promptly.
                Our platform is designed to be fair to all users, regardless of their betting experience.
              </p>
            </CardBody>
          </Card>

          <Card className="value-card">
            <CardBody>
              <h3>Responsibility</h3>
              <p>
                We promote responsible gambling and provide tools to help our users maintain control over their betting
                activities. We believe that betting should be enjoyable and not harmful.
              </p>
            </CardBody>
          </Card>

          <Card className="value-card">
            <CardBody>
              <h3>Innovation</h3>
              <p>
                We are constantly innovating and improving our platform to provide the best possible experience for our
                users. We embrace new technologies and ideas to stay ahead of the curve.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="about-section">
        <h2>Contact Us</h2>
        <p>
          If you have any questions, feedback, or concerns, please don't hesitate to contact us. We're always happy to
          hear from our users.
        </p>
        <div className="contact-info">
          <p><strong>Email:</strong> support@sbp.com</p>
          <p><strong>Phone:</strong> +1 (234) 567-890</p>
          <p><strong>Address:</strong> 123 Main Street, Anytown, USA</p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
