import { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
};

export const WrigleyClock = ({ className }: Props) => {
  const hourHandRef = useRef<SVGPathElement>(null);
  const minuteHandRef = useRef<SVGPathElement>(null);
  const [, setTime] = useState(new Date());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now);

      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();

      // Calculate rotation angles (hands start at 12 o'clock)
      const hourAngle = hours * 30 + minutes * 0.5;
      const minuteAngle = minutes * 6;

      // Apply rotation transformations to the clock hands
      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourAngle}deg)`;
        hourHandRef.current.style.transformOrigin = "285px 285px";
      }

      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minuteAngle}deg)`;
        minuteHandRef.current.style.transformOrigin = "285px 285px";
      }
    };

    // Update immediately
    updateClock();

    // Update every minute
    const interval = setInterval(updateClock, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width="570"
      height="570"
      viewBox="0 0 570 570"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="285"
        cy="285"
        r="280"
        fill="url(#paint0_linear_0_1)"
        stroke="#FFF5D2"
        strokeWidth="10"
      />
      <path
        d="M304.764 47.1876C304.764 58.3243 295.736 67.3523 284.599 67.3523C273.463 67.3523 264.435 58.3243 264.435 47.1876C264.435 36.051 273.463 27.0229 284.599 27.0229C295.736 27.0229 304.764 36.051 304.764 47.1876Z"
        fill="#FFF5D2"
      />
      <path
        d="M421.034 89.1483C415.466 98.7929 403.133 102.097 393.489 96.5291C383.844 90.9608 380.54 78.6283 386.108 68.9836C391.676 59.339 404.009 56.0345 413.653 61.6029C423.298 67.1712 426.602 79.5037 421.034 89.1483Z"
        fill="#FFF5D2"
      />
      <path
        d="M500.747 183.622C491.102 189.191 478.769 185.886 473.201 176.242C467.633 166.597 470.937 154.264 480.582 148.696C490.227 143.128 502.559 146.432 508.127 156.077C513.696 165.722 510.391 178.054 500.747 183.622Z"
        fill="#FFF5D2"
      />
      <path
        d="M522.543 305.296C511.406 305.296 502.378 296.268 502.378 285.131C502.378 273.994 511.406 264.966 522.543 264.966C533.679 264.966 542.707 273.994 542.707 285.131C542.707 296.268 533.679 305.296 522.543 305.296Z"
        fill="#FFF5D2"
      />
      <path
        d="M480.582 421.566C470.937 415.997 467.633 403.665 473.201 394.02C478.769 384.375 491.102 381.071 500.747 386.639C510.391 392.208 513.696 404.54 508.127 414.185C502.559 423.829 490.227 427.134 480.582 421.566Z"
        fill="#FFF5D2"
      />
      <path
        d="M386.108 501.278C380.54 491.633 383.844 479.301 393.489 473.733C403.133 468.164 415.466 471.469 421.034 481.113C426.602 490.758 423.298 503.09 413.653 508.659C404.009 514.227 391.676 510.923 386.108 501.278Z"
        fill="#FFF5D2"
      />
      <path
        d="M264.435 523.074C264.435 511.937 273.463 502.909 284.599 502.909C295.736 502.909 304.764 511.937 304.764 523.074C304.764 534.211 295.736 543.239 284.599 543.239C273.463 543.239 264.435 534.211 264.435 523.074Z"
        fill="#FFF5D2"
      />
      <path
        d="M148.165 481.113C153.733 471.469 166.065 468.164 175.71 473.733C185.355 479.301 188.659 491.633 183.091 501.278C177.523 510.923 165.19 514.227 155.545 508.659C145.901 503.09 142.596 490.758 148.165 481.113Z"
        fill="#FFF5D2"
      />
      <path
        d="M68.4522 386.639C78.0968 381.071 90.4293 384.375 95.9977 394.02C101.566 403.665 98.2615 415.997 88.6169 421.566C78.9722 427.134 66.6397 423.829 61.0714 414.185C55.5031 404.54 58.8076 392.208 68.4522 386.639Z"
        fill="#FFF5D2"
      />
      <path
        d="M46.6562 264.966C57.7928 264.966 66.8209 273.994 66.8209 285.131C66.8209 296.267 57.7928 305.296 46.6562 305.296C35.5196 305.296 26.4915 296.267 26.4915 285.131C26.4915 273.994 35.5196 264.966 46.6562 264.966Z"
        fill="#FFF5D2"
      />
      <path
        d="M88.6169 148.696C98.2615 154.264 101.566 166.597 95.9977 176.242C90.4293 185.886 78.0968 189.191 68.4522 183.622C58.8076 178.054 55.5031 165.722 61.0714 156.077C66.6397 146.432 78.9722 143.128 88.6169 148.696Z"
        fill="#FFF5D2"
      />
      <path
        d="M183.091 68.9836C188.659 78.6282 185.355 90.9607 175.71 96.5291C166.066 102.097 153.733 98.7929 148.165 89.1483C142.596 79.5037 145.901 67.1711 155.546 61.6028C165.19 56.0345 177.523 59.339 183.091 68.9836Z"
        fill="#FFF5D2"
      />
      <path
        ref={hourHandRef}
        d="M298 306H272L275 112H295L298 306Z"
        fill="#FFF5D2"
        style={{ transition: "transform 0.5s ease-in-out" }}
      />
      <path
        ref={minuteHandRef}
        d="M298 324H272L276 40H294L298 324Z"
        fill="#FFF5D2"
        style={{ transition: "transform 0.75s ease-in-out" }}
      />
      <path
        d="M285 278.5C289.142 278.5 292.5 281.858 292.5 286C292.5 290.143 289.142 293.5 285 293.5C280.858 293.5 277.5 290.143 277.5 286C277.5 281.858 280.858 278.5 285 278.5Z"
        stroke="url(#paint1_linear_0_1)"
        strokeWidth="3"
      />
      <defs>
        <linearGradient
          id="paint0_linear_0_1"
          x1="285"
          y1="0"
          x2="285"
          y2="570"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#27342D" />
          <stop offset="1" stopColor="#749A85" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_0_1"
          x1="284.294"
          y1="273.5"
          x2="284.294"
          y2="291.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#27342D" />
          <stop offset="1" stopColor="#749A85" />
        </linearGradient>
      </defs>
    </svg>
  );
};
