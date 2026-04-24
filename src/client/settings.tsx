import { Container, createRoot } from "react-dom/client";
import * as theme from "./theme";
import { ChangeEvent, SubmitEvent, useEffect, useState } from "react";
import * as utils from "./utils";
import * as api from "./apiHandler";
import { CacheKeys } from "./types";

interface Props {
    markRefresh: () => void;
};

async function onPasswordChangeSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const prevPass = (e.target.querySelector("#pass-prev-input") as HTMLInputElement).value;
    const pass = (e.target.querySelector("#new-pass-input") as HTMLInputElement).value;
    const pass2 = (e.target.querySelector("#new-pass2-input") as HTMLInputElement).value;

    await api.changeAccountPassword(
        utils.getCurrentAccount()!,
        prevPass,
        pass,
        pass2
    );
}

async function onColorChangeSubmit(e: SubmitEvent<HTMLFormElement>, props: Props) {
    e.preventDefault();

    const input: HTMLInputElement = e.target.querySelector("#color-input")!;

    if (CSS.supports("color", input.value.trim().toLowerCase())) {
        input.setCustomValidity("");

        const acc = utils.getCurrentAccount()!;

        await api.changeAccountColor(acc, input.value);

        acc.color = input.value;
        localStorage.setItem(CacheKeys.CURRENT_ACCOUNT, JSON.stringify(acc));

        input.value = "";

        props.markRefresh();
    }
}

function onThemeChange(e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>, props: Props) {
    let nextTheme: theme.Theme | undefined;

    switch (e.target.value) {
        case "dark": nextTheme = theme.DEFAULT_DARK; break;
        case "light": nextTheme = theme.DEFAULT_LIGHT; break;
        case "custom": nextTheme = theme.getCustomTheme(); break;
    }

    if (nextTheme) {
        theme.setTheme(nextTheme);
        props.markRefresh();
    }
}

const ColorEditInput = (id: string, name: string, initialColor: string, onColorChange?: (color: string) => void) => (
    <input
        type="text"
        id={id}
        name={name}
        placeholder={initialColor}
        autoComplete="off"
        style={{ border: `5px solid ${initialColor}` }}
        onChange={(e) => {
            e.target.style.borderColor = e.target.value;
            if (e.target.style.borderColor && onColorChange) {
                onColorChange(e.target.style.borderColor);
            }
        }}
    />
);

function ThemeEditWidget(props: Props) {
    const t: theme.Theme = theme.getCustomTheme();

    return <form onSubmit={(e) => {
        e.preventDefault();
        theme.saveCustomTheme(t);
        theme.setTheme(t);
        props.markRefresh();
    }}>
        <label htmlFor="fg-color">Foreground/Text Color: </label>
        {ColorEditInput("", "fg-color", t.fg, (color) => t.fg = color)}
        <br />

        <label htmlFor="accent-color">Accent Color: </label>
        {ColorEditInput("", "accent-color", t.accent, (color) => t.accent = color)}
        <br />

        <label htmlFor="bg-color">Background Color: </label>
        {ColorEditInput("", "bg-color", t.bg, (color) => t.bg = color)}
        <br />

        <label htmlFor="bg-secondary-color">Background Secondary Color: </label>
        {ColorEditInput("", "bg-secondary-color", t.bgSecondary, (color) => t.bgSecondary = color)}
        <br />

        <label htmlFor="button-hover-color">Button Hover Color: </label>
        {ColorEditInput("", "button-hover-color", t.buttonHover, (color) => t.buttonHover = color)}
        <br />

        <input type="submit" value="Save" />
    </form>;
}

function SettingsWidget(props: Props) {
    let currentTheme = "custom";

    if (theme.equals(theme.CurrentTheme, theme.DEFAULT_DARK)) {
        currentTheme = "dark";
    } else if (theme.equals(theme.CurrentTheme, theme.DEFAULT_LIGHT)) {
        currentTheme = "light";
    }

    const acc = utils.getCurrentAccount()!;

    if (currentTheme === "custom" && !acc.premium) {
        theme.setTheme(theme.DEFAULT_DARK);
        props.markRefresh();
    }

    return <div className="flex vert round-bg grow settings">
        <h1>!! Settings !!</h1>

        <div>
            <h2>Theme:</h2>
            <select onChange={(e) => onThemeChange(e, props)} value={currentTheme}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                {acc.premium ? <option value="custom">Custom</option> : null}
            </select>

            {acc.premium && currentTheme === "custom"
                ? ThemeEditWidget(props)
                : null}

            <h2>Account Settings:</h2>

            <form
                action="/accountUpgrade"
                method="POST"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await api.accountUpgrade(utils.getCurrentAccount()!);
                    props.markRefresh();

                    acc.premium = true;
                    localStorage.setItem(CacheKeys.CURRENT_ACCOUNT, JSON.stringify(acc));
                }}
            >
                <p className={acc.premium ? "" : "hidden"}>Account is premium!</p>

                <label
                    className={acc.premium ? "hidden" : ""}
                    htmlFor="upgrade-button"
                >
                    Upgrade account:
                </label>

                <input
                    className={acc.premium ? "hidden" : ""}
                    name="upgrade-button"
                    type="submit"
                    value="Upgrade"
                />
            </form>

            {!acc.premium ? <p>
                Account Color:
                <span style={{ color: acc.color }}>{acc.color}</span>
                <br />
                <span> (upgrade to change)</span>
            </p> : null}

            {acc.premium ? <form
                action="/accountColor"
                method="PATCH"
                onSubmit={(e) => onColorChangeSubmit(e, props)}
            >
                <label htmlFor="account-color-input">Account Color:</label>
                {ColorEditInput("color-input", "account-color-input", acc.color)}
                <input type="submit" value="Submit" />
            </form> : null}

            <h3>Change Password</h3>
            <p>Warning, this will log you out!!!</p>
            <form
                action="/changePassword"
                method="POST"
                onSubmit={(e) => onPasswordChangeSubmit(e)}
            >
                <input type="password" id="pass-prev-input" placeholder="prev password" />
                <br />
                <input type="password" id="new-pass-input" placeholder="new password" />
                <br />
                <input type="password" id="new-pass2-input" placeholder="repeat new password" />
                <br />

                <input type="submit" value="Submit" />
            </form>
        </div>

        <span className="clickable"
            onClick={() => {
                window.location.href = "/";
            }}>
            close
        </span>
    </div >;
}

function RootWidget() {
    const [refresh, setRefresh] = useState(false);

    const props: Props = {
        markRefresh: () => setRefresh(!refresh)
    };

    // re-fetch account only when we first render
    useEffect(() => {
        const acc = utils.getCurrentAccount()!;

        api.fetchAccount(acc.id).then(fetched => {
            // re-render when we fetch
            localStorage.setItem(CacheKeys.CURRENT_ACCOUNT, JSON.stringify(fetched));
            props.markRefresh();
        });
    }, []);

    return <div className="root-ui-flex vert">
        {SettingsWidget(props)}
    </div>;
};

function init() {
    const root = createRoot(document.getElementById("content") as Container);
    root.render(<RootWidget />);

    theme.restoreTheme();
};

window.onload = init;