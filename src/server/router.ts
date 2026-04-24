import express from "express";
import mid from "./middleware";
import { Account, Channel, Message } from "./controllers";

const router = (app: express.Express) => {
    // ~~~ main HTML view endpoints ~~~

    app.get("/", mid.requiresSecure, mid.requiresLogin, (req, res) => res.render("app"));
    app.get("/settings", mid.requiresSecure, mid.requiresLogin, (req, res) => res.render("settings"));
    app.get("/login", mid.requiresSecure, mid.requiresLogout, (req, res) => res.render("login"));

    // ~~~ other api endpoints ~~~

    app.post("/login", mid.requiresSecure, mid.requiresLogout, Account.login);
    app.post("/signup", mid.requiresSecure, mid.requiresLogout, Account.signup);
    app.patch("/accountColor", mid.requiresSecure, mid.requiresLogin, Account.changeColor);
    app.patch("/accountPassword", mid.requiresSecure, mid.requiresLogin, Account.changePassword);
    app.patch("/accountUpgrade", mid.requiresSecure, mid.requiresLogin, Account.upgrade);
    app.get("/logout", mid.requiresLogin, Account.logout);
    app.get("/accounts", mid.requiresSecure, mid.requiresLogin, Account.getAccounts);
    app.get("/account", mid.requiresSecure, mid.requiresLogin, Account.getAccount);

    app.post("/message", mid.requiresSecure, mid.requiresLogin, Message.sendMessage);
    app.get("/message", mid.requiresSecure, mid.requiresLogin, Message.getMessage);
    app.patch("/message", mid.requiresSecure, mid.requiresLogin, Message.editMessage);
    app.delete("/message", mid.requiresSecure, mid.requiresLogin, Message.deleteMessage);

    app.get("/channel", mid.requiresSecure, mid.requiresLogin, Channel.getChannel);
    app.get("/channels", mid.requiresSecure, mid.requiresLogin, Channel.getChannels);
    app.post("/channel", mid.requiresSecure, mid.requiresLogin, Channel.createChannel);
    app.delete("/channel", mid.requiresSecure, mid.requiresLogin, Channel.deleteChannel);
};

export default router;
