import { Container, createRoot } from "react-dom/client";

const RootWidget = () => (
    <div>
        <p>Logged in page! yay!</p>
        <p>
            <a href="/logout">Log out...</a>
        </p>
    </div>
);

function init() {
    const root = createRoot(document.getElementById("content") as Container);
    root.render(<RootWidget />);
};

window.onload = init;
