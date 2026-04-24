import { CacheKeys } from "./types";

export interface Theme {
    bg: string;
    bgSecondary: string;
    buttonHover: string;
    fg: string;
    accent: string;
}

export const DEFAULT_DARK: Theme = Object.seal({
    bg: "rgb(18, 17, 24)",
    bgSecondary: "rgb(24, 24, 35)",
    buttonHover: "rgba(250, 250, 250, 0.05)",
    fg: "rgb(250, 250, 250)",
    accent: "rgb(238, 20, 67)",
});

export const DEFAULT_LIGHT: Theme = Object.seal({
    bg: "rgb(209, 211, 241)",
    bgSecondary: "rgb(232, 240, 248)",
    buttonHover: "rgba(0, 0, 0, 0.05)",
    fg: "rgb(17, 17, 17)",
    accent: "rgb(238, 20, 67)",
});

export const DEFAULT_CUSTOM: Theme = Object.seal({
    bg: "rgb(0, 0, 0)",
    bgSecondary: "rgb(52, 52, 52)",
    buttonHover: "rgba(0, 255, 0, 0.05)",
    fg: "rgb(255, 255, 255)",
    accent: "rgb(40, 255, 108)"
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
    setButtonHover(theme.buttonHover);

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

export function getCustomTheme(): Theme {
    const str = localStorage.getItem(CacheKeys.CUSTOM_THEME);
    if (str) {
        return JSON.parse(str) as Theme;
    }

    return DEFAULT_CUSTOM;
}

export function saveCustomTheme(theme: Theme) {
    localStorage.setItem(CacheKeys.CUSTOM_THEME, JSON.stringify(theme));
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
export const setButtonHover = (color: string) => {
    setVar("--button-hover", color);
    CurrentTheme.buttonHover = color;
}

export function equals(a: Theme, b: Theme) {
    return a.bg === b.bg &&
        a.bgSecondary === b.bgSecondary &&
        a.buttonHover === b.buttonHover &&
        a.fg === b.fg &&
        a.accent === b.accent;
}
