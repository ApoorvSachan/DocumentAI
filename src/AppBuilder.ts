import { Express, Request, Router } from "express";
import express from "express";
import { NextFunction, Response } from "express-serve-static-core";


export class AppBuilder {

    public readonly app: Express;
    private _routes: Map<string, Router> = new Map<string, Router>();
    private skipRoutes: string[] = [];
    private enableApiContext: boolean = false;
    private openCors: boolean = false;
    private corsHeaders: string[];
    private defaultAllowedHeaders: string[] = ["authorization", "content-type"];
    private useJsonContent: boolean = false;
    private allowedOrigins: string[] = [];
    private jwtParseFunction: (token: string) => Promise<any> = null;

    constructor() {
        this.app = express();
    }

    public withRoute(routeKey: string, router: Router, skipRoutes: string[] = []): AppBuilder {
        this._routes.set(routeKey, router);
        this.skipRoutes = Array.isArray(skipRoutes) ? skipRoutes : [];
        return this;
    }

    public withApiContext(jwtPraseFunction: (token: string) => Promise<any> = null): AppBuilder {
        this.enableApiContext = true;
        this.jwtParseFunction = jwtPraseFunction;
        return this;
    }

    public withAllowedOrigins(allowedOrigins: string[]): AppBuilder {
        if (allowedOrigins == null ?? allowedOrigins.length == 0)
            throw "origins list cannot be empty";

        this.allowedOrigins = allowedOrigins;
        return this;
    }

    public withCors(additionalHeaders: string[] | null): AppBuilder {
        this.openCors = true;
        const headers = this.defaultAllowedHeaders.slice();

        (additionalHeaders ?? []).forEach(
            header => {
                header = header.trim().toLowerCase();
                if (!headers.includes(header))
                    headers.push(header);
            }
        );

        this.corsHeaders = headers;

        return this;
    }

    public withJsonContent(): AppBuilder {
        this.useJsonContent = true;
        return this;
    }

    public build(): Express {

        if (this.openCors)
            this.app.use(this.patchCors.bind(this));

        if (this.useJsonContent)
            this.app.use(express.json());

        if (this.enableApiContext && !!this.jwtParseFunction && typeof this.jwtParseFunction === "function")
            this.app.use(this.installApiContext.bind(this));

        this._routes.forEach((router, key) => {
            this.app.use(key, router);
        });

        return this.app;
    }

    private async installApiContext(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.headers.tenantid) {
                return res.sendStatus(403);
            }
            
            if (req.url === "/" || this.skipRoutes.some(url => req.url.indexOf(url) === 0)) {
                req["context"] = { authToken: null, user: null, tenantId: req.headers.tenantid };
                return next();
            }
            
            const authorization: string = req.headers.authorization;
            const authToken: string = !!authorization ? authorization.split(" ")[1] : null;
            if (!!authToken) {
                const user = await this.jwtParseFunction(authToken);
                if (!user) { return res.sendStatus(403); }
                req["context"] = { authToken, user, tenantId: req.headers.tenantid };
                next();
            } else {
                return res.sendStatus(403);
            }
        } catch (error) {
            res.sendStatus(403);
        }
    }

    private patchCors(req: Request, res: Response, next: NextFunction) {

        let referrerUrl: URL | null = null;
        try {
            referrerUrl = new URL(req.headers.referer);
        } catch (error) { }

        if (req.method === "OPTIONS")
            res.header("Access-Control-Max-Age", "86400");
        else
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");

        if (this.allowedOrigins.length > 0) {
            if (this.allowedOrigins.includes(referrerUrl?.host))
                res.header("Access-Control-Allow-Origin", "*");
        }
        else
            res.header("Access-Control-Allow-Origin", "*");

        res.header("Access-Control-Allow-Headers", this.corsHeaders.length > 0 ? this.corsHeaders.join(",") : "*");
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, PATCH, HEAD, DELETE, OPTIONS');

        req.method === "OPTIONS" ? res.end() : next();
    }
}
