import { SubmitEvent, useState } from "react";
import { Container, createRoot, Root } from "react-dom/client";
import { StatusProps, StatusWidget, formFetch } from "./utils";
import { CacheKeys } from "./types";

let root: Root;

async function onLoginSubmit(
    e: SubmitEvent<HTMLFormElement>,
    props: StatusProps
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
        localStorage.setItem(CacheKeys.USERNAME, username);
        window.location = json.redirect;
    }

    return false;
};

async function onSignupSubmit(
    e: SubmitEvent<HTMLFormElement>,
    props: StatusProps
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
        localStorage.setItem(CacheKeys.USERNAME, username);
        window.location = json.redirect;
    }

    return false;
};

function LoginWidget(props: StatusProps) {
    return <div>
        <p>hi</p>
        <form
            id="login-form"
            name="login-form"
            onSubmit={(e) => onLoginSubmit(e, props)}
            action="/login"
            method="POST"
        >
            <label htmlFor="username">Username:</label>
            <input type="text" name="username" id="username-input" />

            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password-input" />

            <input type="submit" value="Sign In" />
        </form>

        <p><a
            href="javascript:void(0)"
            onClick={(e) => {
                e.preventDefault();
                root.render(SignupWidget(props));
            }}
        >
            sign up...
        </a></p>
    </div>;
}

function SignupWidget(props: StatusProps) {
    return <div>
        <p>sign up plz</p>
        <form
            id="signup-form"
            name="signup-form"
            onSubmit={(e) => onSignupSubmit(e, props)}
            action="/signup"
            method="POST"
        >
            <label htmlFor="username">Username:</label>
            <input type="text" name="username" id="username-input" />

            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password-input" />

            <label htmlFor="password2">Repeat Password:</label>
            <input type="password" name="password2" id="password-input2" />

            <input type="submit" value="Sign Up" />
        </form>

        <p><a
            href="javascript:void(0)"
            onClick={(e) => {
                e.preventDefault();
                root.render(LoginWidget(props));
            }}
        >
            log in.....
        </a></p>
    </div>;
}

function RootWidget() {
    const [status, setStatus] = useState("");

    const props: StatusProps = {
        status: {
            value: status,
            set: setStatus,
        }
    };

    return <div>
        {LoginWidget(props)}
        {StatusWidget(props)}
    </div>
};

function init() {
    root = createRoot(document.getElementById("content") as Container);
    root.render(<RootWidget />);
};

window.onload = init;
