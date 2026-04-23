import { fastFetch } from "./utils";
import { Message, Channel, Account } from "../sharedTypes";

export async function fetchMessages(channel: Channel): Promise<Message[]> {
    const messages = await Promise.all(
        // map all message IDs into fetches, await for all to finish
        channel.messages.map(async (id) => {
            const res = await fastFetch("/message?id=" + encodeURI(id));
            const message = await res.json();
            return message;
        })
    );

    return messages as Message[];
}

export async function fetchChannels(): Promise<Channel[]> {
    const res = await fastFetch("/channels");
    const json = await res.json();
    return json as Channel[];
}

export async function createChannel(name: string): Promise<void> {
    await fastFetch("/channel", { name }, "POST");
}

export async function deleteChannel(channel: Channel): Promise<void> {
    await fastFetch("/channel", { name: channel.name }, "DELETE");
}

export async function fetchAccounts(): Promise<Account[]> {
    const res = await fastFetch("/accounts");
    const acc = await res.json();
    return acc as Account[];
}
