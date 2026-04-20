import { Variable } from "./types";

type FetchMethod = "GET" | "DELETE" | "POST" | "PATCH";

export async function fastFetch(url: string, body?: object, method: FetchMethod = "GET") {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });

    return res;
}

export async function formFetch(form: HTMLFormElement, body: object) {
    const res = await fetch(form.action, {
        method: form.method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    return res;
}


export interface StatusProps {
    status: Variable<string>;
};

export const StatusWidget = (props: StatusProps) => {
    if (props.status) {
        return <div>
            <p><b>Status:</b></p>
            <p><em>{props.status.value}</em></p>
        </div>;
    }
};