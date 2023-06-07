import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const ScrollSection = ({ children }) => {
  return (
    <section className="overflow-hidden">
      <div>
        <div className="flex flex-row relative">
          <div className="">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default ScrollSection;
