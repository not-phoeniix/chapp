import { Account } from "../sharedTypes";
import { CacheKeys } from "./types";

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

export function getCurrentAccount(): Account {
    return JSON.parse(localStorage.getItem(CacheKeys.CURRENT_ACCOUNT)!);
}