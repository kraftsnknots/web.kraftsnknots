import React from "react";
import { FaStar } from "react-icons/fa"; // ⭐ import FontAwesome star
import "./styles/StarRating.css"

export default function StarRating({ rating, setRating }) {
  return (
    <div className="star-rating d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar
          key={n}
          size={28}
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
          color={n <= rating ? "#ff5100ff" : "#ccc"} // filled if <= rating
          onClick={() => setRating(n)} // update rating when clicked
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        />
      ))}
    </div>
  );
}
