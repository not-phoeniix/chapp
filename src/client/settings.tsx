import { Container, createRoot } from "react-dom/client";
import * as theme from "./theme";
import { ChangeEvent, SubmitEvent, useState } from "react";

interface Props {
    markRefresh: () => void;
};

function onPasswordChangeSubmit(e: SubmitEvent<HTMLFormElement> /*,props: Props*/) {
    e.preventDefault();
    console.log("hello...");
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

    return <div>
        <p>Hello...</p>
        <h2>Theme:</h2>
        <select onChange={(e) => onThemeChange(e, props)} value={currentValue}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="custom">Custom</option>
        </select>
        <h2>Change Password:</h2>
        <form
            action="/changePassword"
            method="POST"
            onSubmit={(e) => onPasswordChangeSubmit(e)}
        >
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
            <div className="flex vert" style={{ width: "250px" }}>
                {SettingsWidget(props)}
            </div>
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