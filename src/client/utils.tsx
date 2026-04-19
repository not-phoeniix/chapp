import { Dispatch, SetStateAction } from "react";

export async function fastFetch(form: HTMLFormElement, body: object) {
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
    status: string;
    setStatus: Dispatch<SetStateAction<string>>
};

export const StatusWidget = (props: StatusProps) => {
    if (props.status) {
        return <div>
            <p><b>Status:</b></p>
            <p><em>{props.status}</em></p>
        </div>;
    }
};