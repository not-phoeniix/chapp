import { CacheKeys } from "./types";

export interface Theme {
    bg: string;
    bgSecondary: string;
    fg: string;
    accent: string;
}

export const DEFAULT_DARK: Theme = Object.seal({
    bg: "#121118",
    bgSecondary: "#242231",
    fg: "#fafafa",
    accent: "#ee1443",
});

export const DEFAULT_LIGHT: Theme = Object.seal({
    bg: "#d1d3f1",
    bgSecondary: "#e8f0f8",
    fg: "#111111",
    accent: "#ee1443",
});

export let CurrentTheme: Theme = DEFAULT_DARK;

function setVar(variable: string, value: string) {
    document.documentElement.style.setProperty(variable, value);
}

export function setTheme(theme: Theme) {
    setBg(theme.bg);
    setBgSecondary(theme.bgSecondary);
    setFg(theme.fg);
    setAccent(theme.accent);

    saveTheme();
}

export function saveTheme() {
    localStorage.setItem(CacheKeys.THEME, JSON.stringify(CurrentTheme));
}

export function restoreTheme() {
    const themeStr = localStorage.getItem(CacheKeys.THEME);

    if (themeStr) {
        CurrentTheme = JSON.parse(themeStr) as Theme;
    }

    setTheme(CurrentTheme);
}

export const setBg = (color: string) => {
    setVar("--bg", color);
    CurrentTheme.bg = color;
};
export const setBgSecondary = (color: string) => {
    setVar("--bg-secondary", color);
    CurrentTheme.bgSecondary = color;
};
export const setFg = (color: string) => {
    setVar("--fg", color);
    CurrentTheme.fg = color;
};
export const setAccent = (color: string) => {
    setVar("--accent", color);
    CurrentTheme.accent = color;
};
