import { Account } from "../models";
import { Request, Response } from "express";

const loginPage = (req: Request, res: Response) => res.render("login");

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
        return res.json({ redirect: "/" });

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

    try {
        const newAccount = new Account({ username, password: pass });
        await newAccount.save();

        (req.session as any).account = newAccount.toMinimal();

        return res.json({ redirect: "/" });

    } catch (err: any) {
        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({ error: "Username already in use!" });
        }

        return res.status(500).json({ error: "An error occured!" });
    }
};

export default {
    loginPage,
    logout,
    login,
    signup
};
