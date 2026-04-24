import { Container, createRoot } from "react-dom/client";
import * as theme from "./theme";
import { ChangeEvent, SubmitEvent, useState } from "react";
import * as utils from "./utils";
import * as api from "./apiHandler";
import { CacheKeys } from "./types";

interface Props {
    markRefresh: () => void;
};

function onPasswordChangeSubmit(e: SubmitEvent<HTMLFormElement> /*,props: Props*/) {
    e.preventDefault();

    const prevPass = (e.target.querySelector("#pass-prev-input") as HTMLInputElement).value;
    const pass = (e.target.querySelector("#new-pass-input") as HTMLInputElement).value;
    const pass2 = (e.target.querySelector("#new-pass2-input") as HTMLInputElement).value;

    console.log(prevPass, pass, pass2);
}

async function onColorChangeSubmit(e: SubmitEvent<HTMLFormElement>, props: Props) {
    e.preventDefault();

    const input: HTMLInputElement = e.target.querySelector("#color-input")!;

    if (CSS.supports("color", input.value.trim().toLowerCase())) {
        input.setCustomValidity("");

        const acc = utils.getCurrentAccount();

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
        case "custom": nextTheme = theme.CUSTOM; break;
    }

    if (nextTheme) {
        theme.setTheme(nextTheme);
        props.markRefresh();
    }
}

function SettingsWidget(props: Props) {
    let currentValue = "custom";

    if (theme.equals(theme.CurrentTheme, theme.DEFAULT_DARK)) {
        currentValue = "dark";
    } else if (theme.equals(theme.CurrentTheme, theme.DEFAULT_LIGHT)) {
        currentValue = "light";
    }

    const acc = utils.getCurrentAccount();

    return <div className="flex vert" style={{ width: "350px" }}>
        <h1>!! Settings !!</h1>

        <h2>Theme:</h2>
        <select onChange={(e) => onThemeChange(e, props)} value={currentValue}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="custom">Custom</option>
        </select>

        <h2>Account Settings:</h2>

        <h3>Account Color</h3>
        <form
            action="/accountColor"
            method="PATCH"
            onSubmit={(e) => onColorChangeSubmit(e, props)}
            onChange={(e) => {
                const textbox: HTMLInputElement | null = e.target.querySelector("#color-input");
                if (textbox) {
                    textbox.style.backgroundColor = textbox.value || acc.color;
                }
            }}
            className="flex vert"
        >
            <input
                type="text"
                id="color-input"
                placeholder={acc.color}
                autoComplete="off"
                style={{ border: `5px solid ${acc.color}` }}
                onChange={(e) => {
                    e.target.style.borderColor = e.target.value;
                }}
            />
            <input type="submit" value="Submit" />
        </form>

        <h3>Change Password</h3>
        <p>Warning, this will log you out!!!</p>
        <form
            action="/changePassword"
            method="POST"
            onSubmit={(e) => onPasswordChangeSubmit(e)}
            className="flex vert"
        >
            <input type="password" id="pass-prev-input" placeholder="prev password" />
            <input type="password" id="new-pass-input" placeholder="new password" />
            <input type="password" id="new-pass2-input" placeholder="repeat new password" />

            <input type="submit" value="Submit" />
        </form>

    </div>;
}

function RootWidget() {
    const [refresh, setRefresh] = useState(false);

    const props: Props = {
        markRefresh: () => setRefresh(!refresh)
    };

    return <div className="root-ui-flex center">
        <div className="flex vert center round-bg" style={{ padding: "40px" }}>
            <h1>Settings</h1>

            {SettingsWidget(props)}

            <span className="clickable"
                onClick={() => {
                    window.location.href = "/";
                }}>
                close
            </span>
        </div>
    </div>;
};

function init() {
    const root = createRoot(document.getElementById("content") as Container);
    root.render(<RootWidget />);

    theme.restoreTheme();
};

window.onload = init;