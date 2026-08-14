/**
 * 🚗 CAR RENTAL BOOKING WEBSITE — Beginner-Friendly React Tutorial
 *
 * STEP 1: IMPORTS
 * We bring in React tools we need:
 * - useState: lets us store and update data (like selected car, form inputs)
 * - useEffect: runs code when the page loads or data changes
 */
import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// STEP 2: DATA — Our car inventory
// This is an ARRAY of OBJECTS. Each object = one car.
// Arrays hold lists. Objects hold related info with key:value pairs.
// ─────────────────────────────────────────────
const CARS = [
  {
    id: 1,
    name: "BMW M5 Competition",
    brand: "BMW",
    category: "Luxury Sedan",
    price: 189,
    seats: 5,
    fuel: "Petrol",
    transmission: "Automatic",
    // Unsplash images — free to use
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    badge: "Premium",
    badgeColor: "#0066cc",
    features: ["Sunroof", "Heated Seats", "360° Camera"],
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    name: "Audi RS7 Sportback",
    brand: "Audi",
    category: "Sports Sedan",
    price: 210,
    seats: 5,
    fuel: "Petrol",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    badge: "Hot Pick",
    badgeColor: "#cc0000",
    features: ["Virtual Cockpit", "Matrix LED", "Bang & Olufsen"],
    rating: 4.8,
    reviews: 95,
  },
  {
    id: 3,
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes",
    category: "Executive Sedan",
    price: 245,
    seats: 5,
    fuel: "Hybrid",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    badge: "Top Rated",
    badgeColor: "#1a1a2e",
    features: ["MBUX AI", "Burmester Audio", "Massage Seats"],
    rating: 5.0,
    reviews: 214,
  },
  {
    id: 4,
    name: "Toyota Fortuner Legender",
    brand: "Toyota",
    category: "SUV",
    price: 120,
    seats: 7,
    fuel: "Diesel",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
    badge: "Family Pick",
    badgeColor: "#008000",
    features: ["4WD", "7 Seats", "Hill Assist"],
    rating: 4.7,
    reviews: 310,
  },
  {
    id: 5,
    name: "Honda City ZX",
    brand: "Honda",
    category: "Compact Sedan",
    price: 75,
    seats: 5,
    fuel: "Petrol",
    transmission: "CVT",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    badge: "Best Value",
    badgeColor: "#e65c00",
    features: ["Honda Sensing", "LaneWatch", "Eco Mode"],
    rating: 4.6,
    reviews: 420,
  },
  {
    id: 6,
    name: "Ford Mustang GT500",
    brand: "Ford",
    category: "Sports Coupe",
    price: 195,
    seats: 4,
    fuel: "Petrol",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80",
    badge: "Icon",
    badgeColor: "#8b0000",
    features: ["760HP V8", "Track Mode", "Launch Control"],
    rating: 4.9,
    reviews: 178,
  },
];

// ─────────────────────────────────────────────
// STEP 3: HELPER — Star Rating Display
// A small COMPONENT that takes a rating number and shows stars
// Props = parameters passed into a component (like rating={4.9})
// ─────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <span style={{ color: "#f5c518", fontSize: "0.85rem" }}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span style={{ color: "#555", marginLeft: "4px", fontSize: "0.75rem" }}>
        ({rating})
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────
// STEP 4: NAVBAR COMPONENT
// A function that returns JSX (HTML-like syntax in React)
// ─────────────────────────────────────────────
function Navbar({ onBookingClick }) {
  // useState gives us a variable + a function to update it
  // [value, setValue] = useState(initialValue)
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // useEffect runs side-effects (like event listeners)
  // The [] at the end means "run this only once when page loads"
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    // Cleanup: remove the listener when component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled
          ? "rgba(5, 5, 15, 0.97)"
          : "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.6rem" }}>🏎</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "1px",
            }}
          >
            DRIVEELITE
          </span>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "center",
          }}
          className="nav-links"
        >
          {["Fleet", "Services", "Locations", "About"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: "rgba(255,255,255,0.8)",
                textDecoration: "none",
                fontSize: "0.9rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
                transition: "color 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#d4a843")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.8)")}
            >
              {item}
            </a>
          ))}
          <button
            onClick={onBookingClick}
            style={{
              background: "linear-gradient(135deg, #d4a843, #f0c060)",
              border: "none",
              color: "#000",
              padding: "10px 24px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 20px rgba(212,168,67,0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// STEP 5: HERO SECTION COMPONENT
// The big banner at the top of the page
// ─────────────────────────────────────────────
function HeroSection({ onScrollToFleet }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Background images for the hero slideshow
  const heroImages = [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=90",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=90",
    "https://images.unsplash.com/photo-1493238792000-8113da705763?w=1600&q=90",
  ];

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Functional update: use previous state to calculate next
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer); // Cleanup timer
  }, []);

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: "600px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* BACKGROUND IMAGE with transition */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${heroImages[currentSlide]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease",
          filter: "brightness(0.45)",
        }}
      />

      {/* GRADIENT OVERLAY for better text contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(5,5,30,0.3) 100%)",
        }}
      />

      {/* HERO CONTENT — sits on top of background */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "0 20px",
          maxWidth: "900px",
        }}
      >
        {/* Tagline badge */}
        <div
          style={{
            display: "inline-block",
            background: "rgba(212,168,67,0.15)",
            border: "1px solid rgba(212,168,67,0.5)",
            color: "#d4a843",
            padding: "6px 20px",
            borderRadius: "50px",
            fontSize: "0.8rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "24px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Premium Car Rental Service
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)", // Responsive font size
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "20px",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          Drive Your
          <span
            style={{
              display: "block",
              color: "#d4a843",
              fontStyle: "italic",
            }}
          >
            Dream Car Today
          </span>
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "1.1rem",
            maxWidth: "500px",
            margin: "0 auto 40px",
            lineHeight: 1.8,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Choose from our premium fleet of luxury vehicles. No hidden charges.
          Free cancellation up to 24 hours.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onScrollToFleet}
            style={{
              background: "linear-gradient(135deg, #d4a843, #f0c060)",
              border: "none",
              color: "#000",
              padding: "16px 40px",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 15px 35px rgba(212,168,67,0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Explore Fleet
          </button>
          <button
            style={{
              background: "transparent",
              border: "2px solid rgba(255,255,255,0.5)",
              color: "#fff",
              padding: "16px 40px",
              borderRadius: "4px",
              fontWeight: 600,
              fontSize: "1rem",
              letterSpacing: "1px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#d4a843";
              e.target.style.color = "#d4a843";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.5)";
              e.target.style.color = "#fff";
            }}
          >
            Learn More
          </button>
        </div>

        {/* STATS ROW */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
            marginTop: "60px",
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "500+", label: "Premium Cars" },
            { num: "50K+", label: "Happy Clients" },
            { num: "15+", label: "Cities" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#d4a843",
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDE DOTS */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            style={{
              width: i === currentSlide ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              border: "none",
              background: i === currentSlide ? "#d4a843" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// STEP 6: CAR CARD COMPONENT
// Displays one single car's information
// Receives a car object as a PROP and a booking function
// ─────────────────────────────────────────────
function CarCard({ car, onBookNow }) {
  // Track whether mouse is hovering (for hover effect)
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0d0d1a",
        border: `1px solid ${hovered ? "#d4a843" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "all 0.4s ease",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 25px 50px rgba(212,168,67,0.15), 0 0 0 1px rgba(212,168,67,0.2)"
          : "0 4px 20px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      {/* CAR IMAGE CONTAINER */}
      <div style={{ position: "relative", overflow: "hidden", height: "220px" }}>
        <img
          src={imgError ? `https://placehold.co/800x500/0d0d1a/d4a843?text=${car.brand}` : car.image}
          alt={car.name}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s ease",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
        />

        {/* DARK GRADIENT over image */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(0deg, rgba(13,13,26,0.9) 0%, transparent 100%)",
          }}
        />

        {/* BADGE — e.g. "Premium", "Hot Pick" */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            background: car.badgeColor,
            color: "#fff",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {car.badge}
        </div>

        {/* PRICE overlay at bottom of image */}
        <div
          style={{
            position: "absolute",
            bottom: "14px",
            right: "14px",
            textAlign: "right",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#d4a843",
            }}
          >
            ${car.price}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.8rem",
              display: "block",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            per day
          </span>
        </div>
      </div>

      {/* CARD BODY — car details */}
      <div style={{ padding: "20px" }}>
        {/* Category label */}
        <div
          style={{
            color: "#d4a843",
            fontSize: "0.7rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "6px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {car.category}
        </div>

        {/* Car Name */}
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.2rem",
            color: "#fff",
            margin: "0 0 8px",
          }}
        >
          {car.name}
        </h3>

        {/* Star rating */}
        <div style={{ marginBottom: "16px" }}>
          <StarRating rating={car.rating} />
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.75rem",
              marginLeft: "6px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {car.reviews} reviews
          </span>
        </div>

        {/* SPECS ROW — seats, fuel, transmission */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            padding: "12px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
          }}
        >
          {[
            { icon: "👥", value: `${car.seats} Seats` },
            { icon: "⛽", value: car.fuel },
            { icon: "⚙️", value: car.transmission },
          ].map((spec) => (
            <div key={spec.value} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "1rem", marginBottom: "2px" }}>{spec.icon}</div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.7rem",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {spec.value}
              </div>
            </div>
          ))}
        </div>

        {/* FEATURES TAGS */}
        <div
          style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px" }}
        >
          {car.features.map((feature) => (
            <span
              key={feature}
              style={{
                background: "rgba(212,168,67,0.1)",
                border: "1px solid rgba(212,168,67,0.25)",
                color: "#d4a843",
                padding: "3px 10px",
                borderRadius: "50px",
                fontSize: "0.68rem",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {feature}
            </span>
          ))}
        </div>

        {/* BOOK NOW BUTTON */}
        {/* onClick passes the full car object to the parent function */}
        <button
          onClick={() => onBookNow(car)}
          style={{
            width: "100%",
            padding: "12px",
            background: hovered
              ? "linear-gradient(135deg, #d4a843, #f0c060)"
              : "transparent",
            border: `2px solid ${hovered ? "#d4a843" : "rgba(255,255,255,0.15)"}`,
            color: hovered ? "#000" : "#fff",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "0.85rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.3s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Book Now →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 7: BOOKING FORM MODAL
// A popup overlay with a form to collect booking info
// Receives selectedCar as a prop to pre-fill the car selection
// ─────────────────────────────────────────────
function BookingModal({ car, onClose, onConfirm }) {
  // formData holds all the form field values as one object
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupDate: "",
    returnDate: "",
    location: "",
    selectedCar: car ? car.id : "",
  });

  const [errors, setErrors] = useState({});

  // When a form field changes, update formData
  // The "name" attribute on the input matches the key in formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Spread operator (...) copies all existing fields, then overrides the changed one
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form before submission
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Valid email required";
    if (!formData.phone || formData.phone.length < 10)
      newErrors.phone = "Valid phone required";
    if (!formData.pickupDate) newErrors.pickupDate = "Pick-up date required";
    if (!formData.returnDate) newErrors.returnDate = "Return date required";
    if (!formData.location) newErrors.location = "Location required";
    if (formData.pickupDate && formData.returnDate) {
      if (new Date(formData.returnDate) <= new Date(formData.pickupDate)) {
        newErrors.returnDate = "Return must be after pick-up";
      }
    }
    return newErrors;
  };

  // Calculate total cost when both dates are filled
  const calculateTotal = () => {
    if (!formData.pickupDate || !formData.returnDate || !formData.selectedCar) return null;
    const selectedCarData = CARS.find((c) => c.id === parseInt(formData.selectedCar));
    if (!selectedCarData) return null;
    const days = Math.ceil(
      (new Date(formData.returnDate) - new Date(formData.pickupDate)) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return null;
    return { days, total: days * selectedCarData.price, car: selectedCarData };
  };

  const costInfo = calculateTotal();

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop if there are errors
    }
    onConfirm({ ...formData, costInfo }); // Pass form data to parent
  };

  const inputStyle = (field) => ({
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${errors[field] ? "#e74c3c" : "rgba(255,255,255,0.12)"}`,
    color: "#fff",
    padding: "12px 14px",
    borderRadius: "6px",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.75rem",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    // MODAL OVERLAY — clicking outside closes the modal
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* MODAL BOX — stopPropagation prevents click from closing when clicking inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(212,168,67,0.3)",
          borderRadius: "16px",
          padding: "36px",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                color: "#d4a843",
                fontSize: "0.7rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                margin: "0 0 6px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Reserve Your Ride
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#fff",
                fontSize: "1.6rem",
                margin: 0,
              }}
            >
              {car ? `Book ${car.name}` : "Book a Car"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* PRE-SELECTED CAR BANNER */}
        {car && (
          <div
            style={{
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.3)",
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "#d4a843",
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {car.name}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {car.category}
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.4rem",
                color: "#d4a843",
                fontWeight: 700,
              }}
            >
              ${car.price}/day
            </div>
          </div>
        )}

        {/* FORM FIELDS */}
        <div style={{ display: "grid", gap: "18px" }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle("name")}
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email + Phone side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle("email")}
                name="email"
                type="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input
                style={inputStyle("phone")}
                name="phone"
                type="tel"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Pick-up + Return dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Pick-up Date *</label>
              <input
                style={{ ...inputStyle("pickupDate"), colorScheme: "dark" }}
                name="pickupDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.pickupDate}
                onChange={handleChange}
              />
              {errors.pickupDate && (
                <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                  {errors.pickupDate}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Return Date *</label>
              <input
                style={{ ...inputStyle("returnDate"), colorScheme: "dark" }}
                name="returnDate"
                type="date"
                min={formData.pickupDate || new Date().toISOString().split("T")[0]}
                value={formData.returnDate}
                onChange={handleChange}
              />
              {errors.returnDate && (
                <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                  {errors.returnDate}
                </p>
              )}
            </div>
          </div>

          {/* Car selector (if not pre-selected) */}
          {!car && (
            <div>
              <label style={labelStyle}>Select Car *</label>
              <select
                style={{ ...inputStyle("selectedCar"), cursor: "pointer" }}
                name="selectedCar"
                value={formData.selectedCar}
                onChange={handleChange}
              >
                <option value="" style={{ background: "#0d0d1a" }}>
                  Choose a vehicle
                </option>
                {CARS.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: "#0d0d1a" }}>
                    {c.name} — ${c.price}/day
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pickup Location */}
          <div>
            <label style={labelStyle}>Pick-up Location *</label>
            <select
              style={{ ...inputStyle("location"), cursor: "pointer" }}
              name="location"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="" style={{ background: "#0d0d1a" }}>Select location</option>
              {["New York — JFK Airport", "Los Angeles — LAX", "Miami — Downtown", "Chicago — O'Hare", "Las Vegas — Strip", "San Francisco — Union Square"].map((loc) => (
                <option key={loc} value={loc} style={{ background: "#0d0d1a" }}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && (
              <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
                {errors.location}
              </p>
            )}
          </div>

          {/* COST SUMMARY — shown when dates are selected */}
          {costInfo && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(212,168,67,0.1), rgba(212,168,67,0.05))",
                border: "1px solid rgba(212,168,67,0.3)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.85rem",
                  lineHeight: 2,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Daily Rate</span>
                  <span style={{ color: "#fff" }}>${costInfo.car.price}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Duration</span>
                  <span style={{ color: "#fff" }}>{costInfo.days} day{costInfo.days > 1 ? "s" : ""}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid rgba(212,168,67,0.2)",
                    paddingTop: "8px",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#d4a843" }}>Total Estimate</span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.2rem",
                      color: "#d4a843",
                      fontWeight: 700,
                    }}
                  >
                    ${costInfo.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #d4a843, #f0c060)",
              border: "none",
              color: "#000",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.3s",
            }}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 8: CONFIRMATION POPUP
// Shown after a successful booking
// ─────────────────────────────────────────────
function ConfirmationPopup({ bookingData, onClose }) {
  // Generate a random booking ID using Date.now()
  const bookingId = `DE-${Date.now().toString().slice(-6)}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(10px)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(212,168,67,0.4)",
          borderRadius: "16px",
          padding: "48px 36px",
          width: "100%",
          maxWidth: "480px",
          textAlign: "center",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,67,0.08)",
        }}
      >
        {/* SUCCESS ICON */}
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #d4a843, #f0c060)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "2rem",
            boxShadow: "0 0 40px rgba(212,168,67,0.3)",
          }}
        >
          ✓
        </div>

        <p
          style={{
            color: "#d4a843",
            fontSize: "0.7rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            margin: "0 0 10px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Booking Confirmed
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            fontSize: "1.8rem",
            margin: "0 0 8px",
          }}
        >
          You're All Set!
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.9rem",
            margin: "0 0 28px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Confirmation has been sent to your email.
        </p>

        {/* BOOKING DETAILS TABLE */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "28px",
            textAlign: "left",
          }}
        >
          {[
            { label: "Booking ID", value: bookingId },
            { label: "Customer", value: bookingData.name },
            { label: "Pick-up", value: bookingData.pickupDate },
            { label: "Return", value: bookingData.returnDate },
            { label: "Location", value: bookingData.location },
            bookingData.costInfo && {
              label: "Total Amount",
              value: `$${bookingData.costInfo.total.toLocaleString()}`,
            },
          ]
            .filter(Boolean)
            .map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                  {item.label}
                </span>
                <span
                  style={{
                    color: item.label === "Total Amount" ? "#d4a843" : "#fff",
                    fontSize: "0.85rem",
                    fontWeight: item.label === "Total Amount" ? 700 : 400,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #d4a843, #f0c060)",
            border: "none",
            color: "#000",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 9: MAIN APP COMPONENT
// This is the ROOT of our app — everything connects here
// ─────────────────────────────────────────────
export default function App() {
  // STATE VARIABLES — the memory of our app
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // All brand filters for the fleet section
  const filters = ["All", "BMW", "Audi", "Mercedes", "Toyota", "Honda", "Ford"];

  // FILTER LOGIC: if "All" is selected, show all cars; otherwise filter by brand
  const filteredCars =
    activeFilter === "All"
      ? CARS
      : CARS.filter((car) => car.brand === activeFilter);

  // Opens the booking modal for a specific car
  const handleBookNow = (car) => {
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  // Called when user submits the booking form
  const handleConfirmBooking = (formData) => {
    setConfirmedBooking(formData);
    setShowBookingModal(false); // Hide booking form
    setShowConfirmation(true);  // Show success popup
  };

  // Scroll smoothly to the fleet section
  const scrollToFleet = () => {
    document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070710",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* LOAD GOOGLE FONTS via a style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070710; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #d4a843; border-radius: 3px; }

        /* Responsive: hide nav links on mobile */
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .fleet-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .fleet-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <Navbar onBookingClick={() => { setSelectedCar(null); setShowBookingModal(true); }} />

      {/* ── HERO ── */}
      <HeroSection onScrollToFleet={scrollToFleet} />

      {/* ── SERVICES STRIP ── */}
      <section style={{ background: "#0a0a18", padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "24px" }}>
          {[
            { icon: "🔑", title: "Instant Booking", desc: "Confirm in seconds" },
            { icon: "🛡️", title: "Full Insurance", desc: "100% covered" },
            { icon: "📍", title: "24/7 Support", desc: "Always available" },
            { icon: "🚗", title: "Free Delivery", desc: "To your location" },
          ].map((s) => (
            <div key={s.title} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "1.8rem" }}>{s.icon}</span>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{s.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAR FLEET SECTION ── */}
      <section id="fleet" style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 24px" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <p style={{ color: "#d4a843", fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
              Our Fleet
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "16px" }}>
              Choose Your Perfect Ride
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.8 }}>
              From fuel-efficient commuters to jaw-dropping supercars — we have the right vehicle for every journey.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: "8px 22px",
                  borderRadius: "50px",
                  border: `1px solid ${activeFilter === filter ? "#d4a843" : "rgba(255,255,255,0.15)"}`,
                  background: activeFilter === filter ? "rgba(212,168,67,0.15)" : "transparent",
                  color: activeFilter === filter ? "#d4a843" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                  fontWeight: activeFilter === filter ? 600 : 400,
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* CAR GRID — maps over filteredCars array to render a CarCard for each */}
          {/* .map() is like "for each car in the array, create a CarCard component" */}
          <div
            className="fleet-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "28px",
            }}
          >
            {filteredCars.map((car) => (
              // key prop is required by React to track list items efficiently
              <CarCard key={car.id} car={car} onBookNow={handleBookNow} />
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "60px 0", fontFamily: "'DM Sans', sans-serif" }}>
              No cars found for this filter.
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#050510", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#d4a843", marginBottom: "8px" }}>
          🏎 DRIVEELITE
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif" }}>
          © 2025 DriveElite. All rights reserved. Premium Car Rental Service.
        </p>
      </footer>

      {/* ── MODALS — rendered conditionally with && ── */}
      {/* The && means: "only render this if showBookingModal is true" */}
      {showBookingModal && (
        <BookingModal
          car={selectedCar}
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleConfirmBooking}
        />
      )}

      {showConfirmation && confirmedBooking && (
        <ConfirmationPopup
          bookingData={confirmedBooking}
          onClose={() => {
            setShowConfirmation(false);
            setConfirmedBooking(null);
          }}
        />
      )}
    </div>
  );
}
