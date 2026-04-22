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