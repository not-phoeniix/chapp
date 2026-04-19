import path from "path";
import express from "express";
import compression from "compression"
import serveFavicon from "serve-favicon";
import mongoose from "mongoose";
import expressHandlebars from "express-handlebars";
import expressSession from "express-session";
import helmet from "helmet";
import { RedisStore } from "connect-redis";
import redis from "redis";
import router from "./router";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;
const DB_URI = process.env.MONGODB_URI || "mongodb://localhost/chapp";

mongoose.connect(DB_URI).catch((err) => {
    if (err) {
        console.log("Could not connect to database !!");
        throw err;
    }
});

const redisClient = redis.createClient({
    url: process.env.REDIS_URI
});

redisClient.on("error", (err: any) => console.log("Redis client error: " + err));
redisClient.connect().then(() => {
    const app = express();

    app.use(helmet());
    app.use("/assets", express.static(path.resolve(`${__dirname}/../hosted`)));
    app.use(serveFavicon(`${__dirname}/../hosted/img/favicon.png`));
    app.use(compression());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(expressSession({
        name: "sessionid",
        store: new RedisStore({
            client: redisClient
        }),
        secret: "TestSecret",
        resave: false,
        saveUninitialized: false,
    }));

    app.engine("handlebars", expressHandlebars.engine({ defaultLayout: "" }));
    app.set("view engine", "handlebars");
    app.set("views", `${__dirname}/../views`);

    router(app);

    app.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`Listening on 127.0.0.1:${PORT} !!`);
    });
});
