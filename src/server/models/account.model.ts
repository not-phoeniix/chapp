import * as bcrypt from "bcrypt";
import mongoose from "mongoose";
import _ from "underscore";

const SALT_ROUNDS = 10;

// ~~~ types ~~~

// public-facing info about the account
export interface Account {
    username: string;
    premium: boolean;
    color: string;
    id?: any;
};

// "private" internal info about account
export interface AccountDoc extends Account, mongoose.Document {
    createdDate: Date;
    password: string;
    comparePassword: (otherPassword: string) => Promise<boolean>;
    toMinimal: () => Account;
};

// ~~~ functions for schema ~~~

async function authenticate(username: string, password: string): Promise<AccountDoc | null> {
    // case-insensitive find
    const doc: AccountDoc | null = await model.findOne({
        username: new RegExp(`^${username}$`, "i")
    });

    if (doc) {
        const match = await doc.comparePassword(password);
        if (match) {
            return doc;
        }
    }

    return null;
}

async function comparePassword(this: AccountDoc, otherPassword: string): Promise<boolean> {
    return bcrypt.compare(otherPassword, this.password).catch(() => false);
}

function toMinimal(this: AccountDoc): Account {
    return {
        username: this.username,
        premium: this.premium,
        color: this.color,
        id: this.id,
    };
}

// ~~~ schema stuff ~~~

const schemaDef = {
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Za-z0-9_\-.]{1,16}$/,
        set: (name: string) => _.escape(name).trim()
    },
    password: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
} as const;

const methods = {
    comparePassword,
    toMinimal
} as const;

const statics = {
    authenticate,
} as const;

const collation = {
    locale: "en",
    strength: 1,
} as const;

const schema = new mongoose.Schema(
    schemaDef,
    { methods, statics, collation }
);

// ~~~ middleware defined in model (cool) ~~~

schema.pre("save", async function (this: AccountDoc, next: () => void) {
    // don't re-hash the password if we're not changing it
    if (!this.isModified("password")) { return next(); }

    // replace password with hashed version
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;

    return next();
});

// ~~~ model itself ~~~

const model = mongoose.model("Account", schema);
export default model;
