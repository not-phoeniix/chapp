import { Channel } from "../models";
import { Request, Response } from "express";
import * as channelModel from "../models/channel.model";

const appPage = (req: Request, res: Response) => res.render("app");

const getChannel = async (req: Request, res: Response) => {
    // can input either name or id for fetching (prefer id)
    const { name, id } = req.body;

    if (!name && !id) {
        return res.status(400).json({ error: "Missing required paramter!" });
    }

    try {
        let doc: channelModel.ChannelDoc | null;

        if (id) {
            doc = await Channel.findById(id);
        } else {
            doc = await Channel.findOne({ name });
        }

        if (!doc) {
            return res.status(404).json({ error: "Channel doesn't exist!" });
        }

        return res.json({
            name,
            // array of ID strings and not full message data object .
            //   allows client to load each message as needed
            //   and reduce data being sent
            messages: doc.messages.map(m => m.toString()),
            id: doc.id,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const getChannels = async (req: Request, res: Response) => {
    try {
        const channels = (await Channel.find())
            .map(c => ({
                name: c.name,
                messages: c.messages.map(m => m.toString()),
                id: c.id,
            }));

        return res.json(channels);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const createChannel = async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Missing required paramter!" });
    }

    try {
        const newChannel = new Channel({ name, messages: [] });
        await newChannel.save();

        // give the frontend the id back so it can be used 
        //   without having to do another fetch
        return res.json({ id: newChannel.id });

    } catch (err: any) {
        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({ error: "Channel name already exists!" });
        }

        return res.status(500).json({ error: "Internal server error occured!" });
    }
}

const deleteChannel = async (req: Request, res: Response) => {
    // can input either name or id for fetching (prefer id)
    const { name, id } = req.body;

    if (!name && !id) {
        return res.status(400).json({ error: "Missing required paramter!" });
    }

    try {
        let doc: channelModel.ChannelDoc | null;

        if (id) {
            doc = await Channel.findById(id);
        } else {
            doc = await Channel.findOne({ name });
        }

        if (!doc) {
            return res.status(404).json({ error: "Channel doesn't exist!" });
        }

        await doc.deleteOne();

        return res.status(204);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error occured!" });
    }
};

export default {
    appPage,
    getChannel,
    getChannels,
    createChannel,
    deleteChannel,
};
