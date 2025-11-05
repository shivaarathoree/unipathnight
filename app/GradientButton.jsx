"use client";

import React from "react";
import styled from "styled-components";
import { ArrowRight } from "lucide-react"; // make sure lucide-react is already in your project

const GradientButton = () => {
  return (
    <StyledWrapper>
      <button className="button">
        <div className="blob1" />
        <div className="blob2" />
        <div className="inner">
          Contact Us <ArrowRight className="icon" />
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    cursor: pointer;
    font-size: 1.2rem;
    border-radius: 16px;
    border: none;
    padding: 2px;
    background: radial-gradient(circle 80px at 80% -10%, #ffffff, #181b1b);
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease;
    animation: bounce 1.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  .button::after {
    content: "";
    position: absolute;
    width: 65%;
    height: 60%;
    border-radius: 120px;
    top: 0;
    right: 0;
    box-shadow: 0 0 20px #ffffff38;
    z-index: -1;
  }

  .blob1 {
    position: absolute;
    width: 70px;
    height: 100%;
    border-radius: 16px;
    bottom: 0;
    left: 0;
    background: radial-gradient(
      circle 60px at 0% 100%,
      #3fe9ff,
      #0000ff80,
      transparent
    );
    box-shadow: -10px 10px 30px #0051ff2d;
  }

  .blob2 {
    position: absolute;
    width: 70px;
    height: 100%;
    border-radius: 16px;
    bottom: 0;
    right: 0;
    background: radial-gradient(
      circle 60px at 100% 100%,
rgb(163, 30, 30),
rgba(255, 0, 13, 0.5),
      transparent
    );
    box-shadow: 10px 10px 30px #ff00bf2d;
  }

  .inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 14px;
    color: #fff;
    z-index: 3;
    position: relative;
    background: radial-gradient(circle 80px at 80% -50%, #777777, #0f1111);
    font-weight: 600;
  }

  .inner::before {
    content: "";
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: 14px;
    background: radial-gradient(
      circle 60px at 0% 100%,
      #00e1ff1a,
      #0000ff11,
      transparent
    );
    position: absolute;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
`;

export default GradientButton;
