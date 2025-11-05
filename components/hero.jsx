"use client";

import React, { useEffect, useRef } from "react";
import Button from "@/components/button";
import Link from "next/link";
import './hero.css'

const HeroSection = () => {
  const imageRef = useRef(null);
  const h1Ref = useRef(null);
  const h2Ref = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    const h1Element = h1Ref.current;
    const h2Element = h2Ref.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      // Image scroll effect
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }

      // Heading horizontal scroll effect (moves left on scroll)
      const scrollFactor = scrollPosition * 0.5; // Adjust speed
      if (h1Element && h2Element) {
        h1Element.style.transform = `translate3d(-${scrollFactor}px, 0px, 0px)`;
        h2Element.style.transform = `translate3d(${scrollFactor}px, 0px, 0px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
  <div className="space-y-6">
    <div className="space-y-0 mx-auto px-4 md:px-6 lg:px-12">
      {/* First heading - fade in */}
      <div className="overflow-hidden">
        <h1
          ref={h1Ref}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient"
          style={{
            fontFamily: 'Coldiac, sans-serif',
            fontWeight: '300',
            marginLeft: '6vw',
            opacity: 0,
            animation: 'fadeIn 1s ease-out 0.3s forwards',
          }}
        >
          Unleash Your Potential
        </h1>
      </div>

      {/* Second heading - fade in */}
      <div className="overflow-hidden">
        <h2
          ref={h2Ref}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient"
          style={{
            fontFamily: 'Coldiac, sans-serif',
            fontWeight: '300',
            marginLeft: '15vw',
            opacity: 0,
            animation: 'fadeIn 1s ease-out 0.6s forwards',
          }}
        >
          Discover Your Path
        </h2>
      </div>
          <div><br></br></div>
          
          <p 
            className="text-center text-xl py-12"
            style={{
              fontFamily: 'Sk-Modernist-Regular, sans-serif',
              fontWeight: '300',
              animation: 'fadeIn 0.7s ease-out 0.7s forwards',
              opacity: 0
            }}
          >
"Transform your career aspirations into reality with personalized guidance, expert interview coaching, and cutting-edge AI tools. <br></br>Whether you're a first-year finding your path or a final-year facing uncertainty, we're here to turn confusion into clarity and potential into success."</p>        </div>
        <div 
          className="flex justify-center space-x-4"
          style={{
            animation: 'fadeIn 0.7s ease-out 0.9s forwards',
            opacity: 0
          }}
        >
          <Link href="/career-roadmap">
            <Button size="lg" className="px-8">
              Build Your Path
            </Button>
          </Link>
        </div>
        
        <style jsx>{`
          @font-face {
            font-family: 'Coldiac';
            src: url('/fonts/Coldiac.otf') format('opentype'),
                 url('/fonts/Coldiac.ttf') format('truetype');
            font-weight: 300;
            font-style: normal;
            font-display: swap;
          }

          @keyframes slideDownRotate {
            from {
              opacity: 0;
              transform: translateY(-10px) rotate(-10deg);
            }
            to {
              opacity: 1;
              transform: translateY(0) rotate(0deg);
            }
          }
          
          @keyframes slideUpRotate {
            from {
              opacity: 0;
              transform: translateY(10px) rotate(10deg);
            }
            to {
              opacity: 1;
              transform: translateY(0) rotate(0deg);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <video
              src="/frontvideo.mp4"
              width={1280}
              height={720}
              className="rounded-lg shadow-2xl border mx-auto"
              style={{ opacity: 0.7 }}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
