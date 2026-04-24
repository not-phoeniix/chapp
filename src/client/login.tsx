import { JSX, SubmitEvent, useState } from "react";
import { Container, createRoot } from "react-dom/client";
import { formFetch } from "./utils";
import { CacheKeys, Variable } from "./types";
import * as theme from "./theme";

enum Page {
    LOGIN,
    SIGN_UP,
};

export interface Props {
    status: Variable<string>;
    openPage: Variable<Page>;
};

async function onLoginSubmit(
    e: SubmitEvent<HTMLFormElement>,
    props: Props
) {
    e.preventDefault();

    const username = (e.target.querySelector("#username-input")! as HTMLInputElement).value;
    const pass = (e.target.querySelector("#password-input")! as HTMLInputElement).value;

    if (!username || !pass) {
        props.status.set("Missing required params for login!");
        return false;
    }

    const res = await formFetch(e.target, { username, pass });
    const json = await res.json();
    const msg = JSON.stringify(json);
    props.status.set(msg);

    if (json.redirect) {
        localStorage.setItem(
            CacheKeys.CURRENT_ACCOUNT,
            JSON.stringify(json.account)
        );
        window.location = json.redirect;
    }

    return false;
};

async function onSignupSubmit(
    e: SubmitEvent<HTMLFormElement>,
    props: Props
) {
    e.preventDefault();

    const username = (e.target.querySelector("#username-input")! as HTMLInputElement).value;
    const pass = (e.target.querySelector("#password-input")! as HTMLInputElement).value;
    const pass2 = (e.target.querySelector("#password-input2")! as HTMLInputElement).value;

    if (!username || !pass || !pass2) {
        props.status.set("Missing required params for login!");
        return false;
    }

    if (pass !== pass2) {
        props.status.set("Passwords must match!");
        return false;
    }

    const res = await formFetch(e.target, { username, pass, pass2 });
    const json = await res.json();
    const msg = JSON.stringify(json);
    props.status.set(msg);

    if (json.redirect) {
        localStorage.setItem(
            CacheKeys.CURRENT_ACCOUNT,
            JSON.stringify(json.account)
        );
        window.location = json.redirect;
    }

    return false;
};

function LoginWidget(props: Props) {
    return <div>
        <form
            id="login-form"
            name="login-form"
            onSubmit={(e) => onLoginSubmit(e, props)}
            action="/login"
            method="POST"
        >
            <input
                type="text"
                className="login-field"
                id="username-input"
                placeholder="username"
            />
            <br />

            <input
                type="password"
                className="login-field"
                id="password-input"
                placeholder="password "
            />
            <br />

            <input
                type="submit"
                className="login-submit"
                value="Sign In"
                style={{ width: "100%" }}
            />
        </form>

        <p><span
            className="clickable"
            onClick={(e) => {
                e.preventDefault();
                props.openPage.set(Page.SIGN_UP)
            }}
        >
            sign up...
        </span></p>
    </div>;
}

function SignupWidget(props: Props) {
    return <div>
        <form
            id="signup-form"
            name="signup-form"
            onSubmit={(e) => onSignupSubmit(e, props)}
            action="/signup"
            method="POST"
        >
            <input
                type="text"
                className="login-field"
                id="username-input"
                placeholder="username"
            />
            <br />

            <input
                type="password"
                className="login-field"
                id="password-input"
                placeholder="password"
            />
            <br />

            <input
                type="password"
                className="login-field"
                id="password-input2"
                placeholder="repeat password"
            />
            <br />

            <input
                type="submit"
                className="login-submit"
                value="Sign Up"
                style={{ width: "100%" }}
            />
        </form>

        <p><span
            className="clickable"
            onClick={(e) => {
                e.preventDefault();
                props.openPage.set(Page.LOGIN)
            }}
        >
            log in.....
        </span></p>
    </div>;
}

function ThemeButton() {
    const [currentTheme, setCurrentTheme] = useState(theme.CurrentTheme);

    // easy object value equality check by comparing strings
    const isDark = theme.equals(currentTheme, theme.DEFAULT_DARK);

    const icon = isDark
        ? <i className="nf nf-oct-sun"></i>
        : <i className="nf nf-oct-moon"></i>;

    return <span
        className="clickable login-theme-button"
        onClick={(e) => {
            e.preventDefault();
            theme.setTheme(isDark ? theme.DEFAULT_LIGHT : theme.DEFAULT_DARK);

            // we do this to actually mark the theme as changed (different object)
            setCurrentTheme(JSON.parse(JSON.stringify(theme.CurrentTheme)));
        }}
    >
        {icon}
    </span>;
}

function PageSwitcher(props: Props) {
    let page: JSX.Element | null = null;

    switch (props.openPage.value) {
        case Page.LOGIN:
            page = LoginWidget(props);
            break;
        case Page.SIGN_UP:
            page = SignupWidget(props);
            break;
    }

    return page;
}

function RootWidget() {
    const [status, setStatus] = useState("");
    const [openPage, setOpenPage] = useState(Page.LOGIN);

    const props: Props = {
        status: {
            value: status,
            set: setStatus,
        },
        openPage: {
            value: openPage,
            set: setOpenPage,
        }
    };

    return <div className="root-ui-flex center">
        <div className="flex vert center round-bg" style={{ padding: "40px" }}>
            <h1 className="app-logo-login">ChApp</h1>
            <div className="flex vert" style={{ width: "250px" }}>
                {PageSwitcher(props)}
            </div>
            <p className={!props.status.value ? "hidden" : ""}>
                <b>Status: </b>
                <em>{props.status.value}</em>
            </p>
        </div>

        {ThemeButton()}
    </div>;
};

function init() {
    const root = createRoot(document.getElementById("content") as Container);
    root.render(<RootWidget />);

    theme.restoreTheme();
};

window.onload = init;
