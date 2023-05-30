import "reflect-metadata"
import { ContainerFactory } from "./container-factory";
import "reflect-metadata";
import * as express from "express";
import { AppBuilder } from "./AppBuilder";
import { IRouteProvider } from "./interfaces/IRouteProvider";
import { DependencyKeys } from "./utils/constants";

export class App {

    public readonly app: express.Express;

    public constructor() {

        const container = ContainerFactory.getContainer();

        const router = express.Router();
        router.get("/", (request, response) => { response.send("APIs Started!"); });
        const routeProviders = container.getAll<IRouteProvider>(DependencyKeys.Routes);
        routeProviders.forEach(routeProvider => routeProvider.configureRoutes(router));

        this.app = new AppBuilder()
            .withJsonContent()
            .withRoute("/", router, [])
            .withCors([])
            .withAllowedOrigins([])
            .build();
    }

    public static init(): express.Express {
        return new App().app;
    }
}

export default App.init();
