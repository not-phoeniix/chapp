import { Message, Account, Channel } from "../models";
import { Request, Response } from "express";
import * as sharedTypes from "../../sharedTypes";

const getMessage = async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Missing required parameters!" });
    }

    try {
        const doc = await Message.findById(id);

        if (!doc) {
            return res.status(404).json({ error: "Message does not exist!" });
        }

        // never null because we always check ids before storing
        const acc = (await Account.findById(doc.from))!;
        const channel = (await Channel.findById(doc.channel))!;

        const data: sharedTypes.Message = {
            fromId: acc?.id ?? doc.from._id.toString(),
            content: doc.content,
            channelId: channel.id,
            sentAt: doc.sentAt,
            editedAt: doc.editedAt ?? undefined,
            id: doc.id
        };

        return res.json(data);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const sendMessage = async (req: Request, res: Response) => {
    // send message input is the unique username, 
    //   unique channel name, and the content of the message
    const { from, content, channel } = req.body;

    if (!from || !content || !channel) {
        return res.status(400).json({ error: "Missing required parameters!" });
    }

    try {
        const accountDoc = await Account.findById(from);
        if (!accountDoc) {
            return res.status(404).json({ error: "Account does not exist!" });
        }

        const channelDoc = await Channel.findOne({ name: channel });
        if (!channelDoc) {
            return res.status(404).json({ error: "Inputted channel doesn't exist!" });
        }

        const newMessage = new Message({
            from: accountDoc._id,
            content,
            channel: channelDoc._id,
        });
        await newMessage.save();

        // add new message to channel refs as well
        channelDoc.messages.push(newMessage._id);
        await channelDoc.save();

        // give the frontend the id back so it can be used 
        //   without having to do another fetch
        return res.json({ id: newMessage.id });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const deleteMessage = async (req: Request, res: Response) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Missing required parameters!" });
    }

    try {
        const doc = await Message.findById(id);

        if (!doc) {
            return res.status(404).json({ error: "Message does not exist!" });
        }

        await doc.deleteOne();

        return res.status(204).json();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const editMessage = async (req: Request, res: Response) => {
    const { id, content } = req.body;
    if (!id || !content) {
        return res.status(400).json({ error: "Missing required parameters!" });
    }

    try {
        const doc = Message.findById(id);

        if (!doc) {
            return res.status(404).json({ error: "Message does not exist!" });
        }

        await doc.updateOne({ content, editedAt: Date.now() });

        return res.status(204).json();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

// returns an ID
async function newMessageManual(
    content: string,
    fromId: string,
    channelId: string
): Promise<sharedTypes.Message | null> {
    try {
        const accountDoc = await Account.findById(fromId);
        if (!accountDoc) {
            console.warn("WARNING: failed to find account from id: ", fromId);
            return null;
        }

        const channelDoc = await Channel.findById(channelId);
        if (!channelDoc) {
            console.warn("WARNING: failed to find channel from id: ", channelId);
            return null;
        }

        const newMessage = new Message({
            from: accountDoc._id,
            content,
            channel: channelDoc._id,
        });
        await newMessage.save();

        // add new message to channel refs as well
        channelDoc.messages.push(newMessage._id);
        await channelDoc.save();

        return {
            content: newMessage.content,
            fromId: newMessage.from._id.toString(),
            channelId: newMessage.channel._id.toString(),
            sentAt: newMessage.sentAt,
            editedAt: newMessage.editedAt ?? undefined,
            id: newMessage.id
        };
    } catch (err) {
        console.log(err);
        return null;
    }
}

export default {
    sendMessage,
    deleteMessage,
    editMessage,
    getMessage,
    newMessageManual,
};
