import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import "./tokens.css";
import "./global.css";

// JS-side mirror of the duration/easing/breakpoint tokens in tokens.css,
// for the few components that need a typed value rather than a CSS
// variable (e.g. CameraController's tween timing, matchMedia breakpoint
// checks). Most components should read the CSS custom properties
// directly instead of consuming this from context.
export const tokens = {
  duration: {
    feedback: 200,
    transition: 700,
    overlay: 300,
    ambientFast: 4500,
    ambientSlow: 9000,
  },
  easing: {
    standard: "cubic-bezier(0.16, 1, 0.3, 1)",
    ambient: "ease-in-out",
    linear: "linear",
  },
  breakpoint: {
    mobileMax: 639,
    tabletMin: 640,
    tabletMax: 1023,
    desktopMin: 1024,
  },
} as const;

export type Tokens = typeof tokens;

export type AccentOverride = "ki" | "sky" | "mind" | "ember";

const ACCENT_VAR: Record<AccentOverride, string> = {
  ki: "var(--color-accent-ki)",
  sky: "var(--color-accent-sky)",
  mind: "var(--color-accent-mind)",
  ember: "var(--color-accent-ember)",
};

export interface ThemeContextValue {
  tokens: Tokens;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ tokens, reducedMotion: false });

export interface ThemeProviderProps {
  accentOverride?: AccentOverride;
  children: ReactNode;
}

export function ThemeProvider({ accentOverride, children }: ThemeProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent-active", ACCENT_VAR[accentOverride ?? "ki"]);
  }, [accentOverride]);

  return <ThemeContext.Provider value={{ tokens, reducedMotion }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
