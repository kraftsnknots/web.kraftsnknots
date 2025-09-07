// src/components/Reveal.jsx
import { useInView } from "react-intersection-observer";
import "../styles/Reveal.css";

export default function Reveal({ children }) {
  const { ref, inView } = useInView({
    triggerOnce: true,  // animate only once
    threshold: 0.2,     // 20% visible before triggering
  });

  return (
    <div ref={ref} className={`reveal ${inView ? "show" : ""}`}>
      {children}
    </div>
  );
}
