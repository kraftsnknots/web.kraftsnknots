import React from "react";
import "./styles/AboutUs.css";
import { Link } from "react-router-dom";
import ringImage from "../assets/images/text-img3.jpg";

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-text">
          <h2>Welcome to</h2>
          <h1>Krafts & Knots</h1>
          <p>
            Explore our lovingly handcrafted fully customized items made in Amritsar,
            India. We provide a wide range of collection of gifts
            suitable for any occasion.
          </p>
          <Link to="/shop" className="primary-btn">Let's take a look at the products</Link>
        </div>

        <div className="about-hero-image">
          <div className="image-container">
            <img src={ringImage} alt="Scented candles" />
            <div className="stats-card">
              <div>
                <h3>900+</h3>
                <p>Customers been served</p>
              </div>
              <div className="divider"></div>
              <div>
                <h3>5700+</h3>
                <p>Orders crafted with love</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="location-text">
          <h2>Location</h2>
          <p>
            Situated in Amritsar, India, Krafts & Knots focuses on bringing
            unique ideas to life to make you special occasion more special, addressing various customer tastes and
            custom requests.
          </p>

          <div className="location-details">
            <p>
              <strong>Krafts & Knots</strong>
              <br />
              Amritsar, Punjab, India
            </p>
            <p>
              <strong>Working Hours</strong>
              <br />
              7 AM – 11 PM
            </p>
          </div>
        </div>

        <div className="location-map">
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Model Town,Amritsar,India&z=14&output=embed"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
