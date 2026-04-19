import { Message, Account } from "../models";
import { Request, Response } from "express";

const sendMessage = async (req: Request, res: Response) => {
    // send message input is the unique username 
    //   and the content of the message
    const { from, content } = req.body;

    if (!from || !content) {
        return res.status(400).json({ error: "Missing required parameters!" });
    }

    try {
        const account = await Account.findOne({ username: from });
        if (!account) {
            return res.status(404).json({ error: "Account username does not exist!" });
        }

        const newMessage = new Message({ from: account._id, content });
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
            return res.status(404).json({ error: "Could not find message!" });
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
            return res.status(404).json({ error: "Could not find message!" });
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
};
