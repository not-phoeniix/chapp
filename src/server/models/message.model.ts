import mongoose from "mongoose";

// ~~~ types ~~~

export interface Message {
    from: mongoose.Types.ObjectId;
    content: string;
    channel: mongoose.Types.ObjectId;
    id?: any;
};

export interface MessageDoc extends Message, mongoose.Document {
    sentAt: Date;
    editedAt?: Date | null | undefined;
    toMinimal: () => Message;
};

// ~~~ functions for schema ~~~

function toMinimal(this: MessageDoc): Message {
    return {
        from: this.from,
        content: this.content,
        channel: this.channel,
        id: this.id,
    };
}

// ~~~ schema stuff ~~~

const schemaDef = {
    from: {
        type: mongoose.Schema.ObjectId,
        ref: "Account",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    channel: {
        type: mongoose.Schema.ObjectId,
        ref: "Channel",
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    editedAt: {
        type: Date,
    },
} as const;

const methods = {
    toMinimal,
} as const;

const schema = new mongoose.Schema(
    schemaDef,
    { methods }
);

// ~~~ middleware ~~~

// ~~~ finally, the model ~~~

const model = mongoose.model("Message", schema);
export default model;
