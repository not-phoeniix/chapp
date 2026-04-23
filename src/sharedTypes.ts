export interface Message {
    content: string;
    fromId: string;
    channelId: string;
    sentAt: Date;
    editedAt?: Date;
    id: string;
};

export interface Channel {
    name: string;
    messages: string[];
    id: string;
};

export interface Account {
    username: string;
    id: string;
    color: string;
};

export interface SocketServerEvents {
    newMessage: (message: Message) => void;
    startTyping: (username: string) => void;
    stopTyping: (username: string) => void;
};

export interface SocketClientEvents {
    sendMessage: (content: string, fromId: string, channelId: string) => void;
    startTyping: (username: string) => void;
    stopTyping: (username: string) => void;
};
