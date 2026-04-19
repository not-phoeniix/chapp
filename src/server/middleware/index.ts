import { Request, Response } from "express";
import express from "express";

const requiresLogin = (req: Request, res: Response, next: express.NextFunction) => {
    // if we're not logged in, redirect to login
    if (!(req.session as any).account) {
        return res.redirect("/login");
    }

    return next();
};

const requiresLogout = (req: Request, res: Response, next: express.NextFunction) => {
    // if we're not logged out, redirect to main app page
    if ((req.session as any).account) {
        return res.redirect("/");
    }

    return next();
};

const requiresSecure = (req: Request, res: Response, next: express.NextFunction) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(`https://${req.hostname}${req.url}`);
    }

    return next();
};

const bypassSecure = (req: Request, res: Response, next: express.NextFunction) => next();

export default {
    requiresLogin,
    requiresLogout,
    requiresSecure: (
        process.env.NODE_ENV === "production"
            ? requiresSecure : bypassSecure
    ),
};
