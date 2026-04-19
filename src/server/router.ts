import express from "express";
import mid from "./middleware";
import { Account, Channel, Message } from "./controllers";

const router = (app: express.Express) => {
    // main page
    app.get("/", mid.requiresSecure, mid.requiresLogin, Channel.appPage);

    // ~~~ account stuff  ~~~

    app.get("/login", mid.requiresSecure, mid.requiresLogout, Account.loginPage);
    app.post("/login", mid.requiresSecure, mid.requiresLogout, Account.login);
    app.post("/signup", mid.requiresSecure, mid.requiresLogout, Account.signup);
    app.get("/logout", mid.requiresLogin, Account.logout);

    // ~~~ other api endpoints ~~~

    app.post("/message", mid.requiresSecure, mid.requiresLogin, Message.sendMessage);
    app.get("/message", mid.requiresSecure, mid.requiresLogin, Message.getMessage);
    app.patch("/message", mid.requiresSecure, mid.requiresLogin, Message.editMessage);
    app.delete("/message", mid.requiresSecure, mid.requiresLogin, Message.deleteMessage);

    app.get("/channel", mid.requiresSecure, mid.requiresLogin, Channel.getChannel);
    app.post("/channel", mid.requiresSecure, mid.requiresLogin, Channel.createChannel);
    app.delete("/channel", mid.requiresSecure, mid.requiresLogin, Channel.deleteChannel);
};

export default router;
