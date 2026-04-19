import express from "express";
import mid from "./middleware";
import controllers from "./controllers";

const router = (app: express.Express) => {
    app.get("/login", mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.get("/", mid.requiresSecure, mid.requiresLogin, controllers.Account.loginPage);
};

export default router;
