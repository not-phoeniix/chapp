import mongoose from "mongoose";
import { Message, Account, Channel } from "../models";
import { Request, Response } from "express";

const getMessage = async (req: Request, res: Response) => {
    const { id } = req.body;

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

        return res.json({
            from: acc.id,
            content: doc.content,
            channel: channel.id,
            sentAt: doc.content,
            editedAt: doc.editedAt,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const sendMessage = async (req: Request, res: Response) => {
    // send message input is the unique username 
    //   and the content of the message
    const { from, content, channel } = req.body;

    if (!from || !content || !channel) {
        return res.status(400).json({ error: "Missing required parameters!" });
    }

    try {
        const accountDoc = await Account.findOne({ username: from });
        if (!accountDoc) {
            return res.status(404).json({ error: "Account username does not exist!" });
        }

        const channelDoc = await Channel.findById(channel);
        if (!channelDoc) {
            return res.status(404).json({ error: "Inputted channel ID doesn't exist!" });
        }

        const newMessage = new Message({
            from: accountDoc._id,
            content,
            channel: channelDoc._id,
        });
        await newMessage.save();

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

        return res.status(204);

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

        await doc.updateOne({ content });

        return res.status(204);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

export default {
    sendMessage,
    deleteMessage,
    editMessage,
    getMessage,
};
