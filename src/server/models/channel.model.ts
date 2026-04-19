import mongoose from "mongoose";

// ~~~ types ~~~

export interface Channel {
    name: string;
    messages: mongoose.Types.ObjectId[];
    id?: any;
};

export interface ChannelDoc extends Channel, mongoose.Document {
    toMinimal: () => Channel;
};

// ~~~ functions for schema ~~~

function toMinimal(this: ChannelDoc): Channel {
    return {
        name: this.name,
        messages: this.messages,
        id: this.id,
    };
}

// ~~~ schema stuff ~~~

const schemaDef = {
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[A-Za-z_\-.]{1,16}$/,
    },
    messages: {
        type: [{
            type: mongoose.Schema.ObjectId,
            ref: "Message",
            required: true,
        }],
        required: true
    },
} as const;

const methods = {
    toMinimal,
} as const;

const statics = {
} as const;

const schema = new mongoose.Schema(
    schemaDef,
    { methods, statics }
);

// ~~~ model itself ~~~

const model = mongoose.model("Channel", schema);
export default model;
