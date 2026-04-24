import { Account } from "../models";
import { Request, Response } from "express";
import * as sharedTypes from "../../sharedTypes";
import * as accountModel from "../models/account.model";

const logout = (req: Request, res: Response) => {
    req.session.destroy(() => console.log("Session destroyed!"));
    return res.redirect("/");
};

const login = async (req: Request, res: Response) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;

    if (!username || !pass) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        const doc = await Account.authenticate(username, pass);
        if (!doc) {
            return res.status(401).json({ error: "Wrong username or password!" });
        }

        (req.session as any).account = doc.toMinimal();

        const account: sharedTypes.Account = {
            username: doc.username,
            id: doc.id,
            color: doc.color,
        };
        return res.json({ redirect: "/", account });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

const signup = async (req: Request, res: Response) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if (!username || !pass || !pass2) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    if (pass !== pass2) {
        return res.status(400).json({ error: "Passwords do not match!" });
    }

    // check if already existing (case-insensitive)
    const existing = await Account.findOne({ username: new RegExp(`^${username}$`, "i") });
    if (existing) {
        return res.status(400).json({ error: "Username already in use!" });
    }

    try {
        const newAccount = new Account({ username, password: pass });
        await newAccount.save();

        (req.session as any).account = newAccount.toMinimal();

        const account: sharedTypes.Account = {
            username: newAccount.username,
            id: newAccount.id,
            color: `hsl(${Math.floor(Math.random() * 360)}, 90%, 45%)`
        };

        return res.json({ redirect: "/", account });

    } catch (err: any) {
        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({ error: "Username already in use!" });
        }

        return res.status(500).json({ error: "An error occured!" });
    }
};

const changeColor = async (req: Request, res: Response) => {
    // find by either name or id (prefer id)
    const { username, id, color } = req.body;

    if ((!username && !id) || !color) {
        return res.status(400).json({ error: "Missing required paramter!" });
    }

    try {
        let doc: accountModel.AccountDoc | null;

        if (id) {
            doc = await Account.findById(id);
        } else {
            doc = await Account.findOne({
                username: new RegExp(`^${username}$`, "i")
            });
        }

        if (!doc) {
            return res.status(404).json({ error: "Account doesn't exist!" });
        }

        doc.color = color;
        await doc.save();

        return res.status(204).json();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error occured!" });
    }
};

const changePassword = async (req: Request, res: Response) => {
    // find by either name or id (prefer id)
    const { username, id, passPrev, pass, pass2 } = req.body;

    if ((!username && !id) || !passPrev || !pass || !pass2) {
        return res.status(400).json({ error: "Missing required paramter!" });
    }

    if (pass !== pass2) {
        return res.status(400).json({ error: "New passwords do not match!" });
    }

    try {
        let doc: accountModel.AccountDoc | null;

        if (id) {
            doc = await Account.findById(id);
        } else {
            doc = await Account.findOne({
                username: new RegExp(`^${username}$`, "i")
            });
        }

        if (!doc) {
            return res.status(404).json({ error: "Account doesn't exist!" });
        }

        if (!(await doc.comparePassword(passPrev))) {
            return res.status(400).json({ error: "Incorrect previous password!" });
        }

        doc.password = pass;
        await doc.save();

        return res.json({ redirect: "/logout" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error occured!" });
    }
};

const getAccounts = async (req: Request, res: Response) => {
    try {
        const doc = await Account.find();

        return res.json(doc.map((acc) => {
            const data: sharedTypes.Account = {
                username: acc.username,
                id: acc.id,
                color: acc.color,
            };

            return data;
        }));

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal error occured!" });
    }
};

export default {
    logout,
    login,
    signup,
    getAccounts,
    changeColor,
    changePassword,
};
