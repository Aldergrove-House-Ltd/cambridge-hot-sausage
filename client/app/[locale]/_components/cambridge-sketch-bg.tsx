"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// The overlay SVG shares the sketch's aspect ratio (source engraving is
// 566×593 px), so glints can be placed in the engraving's own coordinates.
const SKETCH_W = 566;
const SKETCH_H = 593;

// Light catching the Cam: short strokes laid over the river hatching,
// clear of the bank (left) and the punt (x≈145–252, y≈415–472).
const GLINTS = [
  { x: 300, y: 438, w: 30, delay: 0 },
  { x: 388, y: 452, w: 42, delay: 2.4 },
  { x: 478, y: 431, w: 28, delay: 4.6 },
  { x: 170, y: 500, w: 36, delay: 1.2 },
  { x: 318, y: 512, w: 46, delay: 3.5 },
  { x: 440, y: 527, w: 34, delay: 5.6 },
  { x: 232, y: 547, w: 40, delay: 2.9 },
  { x: 498, y: 559, w: 30, delay: 0.7 },
];

const BIRDS = [
  { top: "18%", size: 22, duration: 42, delay: -6, flap: 0.9 },
  { top: "46%", size: 16, duration: 50, delay: -20, flap: 0.75 },
  { top: "8%", size: 13, duration: 58, delay: -38, flap: 0.65 },
];

/**
 * Full-bleed hero backdrop: an engraving of King's College Chapel from the
 * River Cam (vector-traced into /img/cambridge-sketch.svg). The chapel towers,
 * bridge and river always fit the hero's height; on wide screens mirrored
 * copies extend the trees (left) and the bridge + river (right) to the edges.
 * It inks in from the bottom upwards, glints drift across the water, a few
 * birds cross the sky, and the sketch eases down as the hero scrolls away.
 * Motion is skipped entirely for prefers-reduced-motion.
 */
export function CambridgeSketchBg() {
  const sketchRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = sketchRef.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(el, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => mm.revert();
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Birds crossing the sky */}
      <div className="absolute inset-x-0 top-[10%] h-[24%] text-brand-maroon/45">
        {BIRDS.map((bird) => (
          <span
            key={bird.top}
            className="hero-bird"
            style={{
              top: bird.top,
              animationDuration: `${bird.duration}s`,
              animationDelay: `${bird.delay}s`,
            }}
          >
            <svg
              width={bird.size}
              height={bird.size * 0.45}
              viewBox="0 0 16 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.3}
              strokeLinecap="round"
              style={{ animationDuration: `${bird.flap}s` }}
            >
              <path d="M1 5.5C3 2 5.5 2 8 5C10.5 2 13 2 15 5.5" />
            </svg>
          </span>
        ))}
      </div>

      {/* Sketch + water glints across the whole hero. Stage = hero box;
          reveal layer = what's on screen; frame = the engraving itself, with
          mirrored copies either side to fill wide screens. */}
      <div ref={sketchRef} className="hero-sketch-stage absolute inset-0">
        <div
          className="hero-sketch absolute inset-0"
          style={{ "--sketch-ratio": SKETCH_W / SKETCH_H } as React.CSSProperties}
        >
          <div className="hero-sketch-mirror hero-sketch-mirror-left hidden bg-[url(/img/cambridge-sketch.svg)] bg-contain bg-no-repeat opacity-40 sm:block" />
          <div className="hero-sketch-mirror hero-sketch-mirror-right hidden bg-[url(/img/cambridge-sketch.svg)] bg-contain bg-no-repeat opacity-40 sm:block" />
          <div className="hero-sketch-frame">
            <div className="absolute inset-0 bg-[url(/img/cambridge-sketch.svg)] bg-contain bg-no-repeat opacity-30 sm:opacity-40" />
            <svg
              viewBox={`0 0 ${SKETCH_W} ${SKETCH_H}`}
              className="absolute inset-0 h-full w-full"
            >
              {GLINTS.map((g) => (
                <line
                  key={`${g.x}-${g.y}`}
                  className="hero-glint"
                  x1={g.x}
                  x2={g.x + g.w}
                  y1={g.y}
                  y2={g.y}
                  style={{ animationDelay: `${g.delay}s` }}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
