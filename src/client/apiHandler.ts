import { fastFetch } from "./utils";

export interface Message {
    from: string;
    content: string;
    id: string;
};

export interface Channel {
    name: string;
    messages: string[];
};

export interface Account {
    username: string;
    id: string;
    color: string;
};

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

// takes in text content of message, sender username, and channel name
// 
// returns a promise that will return the new message ID
export async function sendMessage(
    content: string,
    // TODO: make this "from" match the "from" that messages store 
    //   (make them IDs not usernames)
    from: string,
    channel: string
): Promise<string> {
    // I recognize that this isn't secure at all and anyone could send
    //   any message from any account this way but this is not a 
    //   future-proof app right now <//3
    const res = await fastFetch("/message", { from, content, channel }, "POST");
    return (await res.json()).id;
}
