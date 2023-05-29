import "reflect-metadata"
import { ContainerFactory } from "./container-factory";
import express, {Request, Response} from "express";
import { DependencyKeys } from "./utils/constants";
import * as config from './config/config.json';
import { IRouteProvider } from "./interfaces/IRouteProvider";


const app = express();
app.use(express.json());
app.listen(config.port, () => console.log(`listening on http://localhost:${config.port}`));

const container = ContainerFactory.getContainer();

const router = express.Router();
router.get("/", async (request: Request, response: Response) => { response.send("APIs Started!"); });
const routeProviders = container.getAll<IRouteProvider>(DependencyKeys.Routes);
routeProviders.forEach(routeProvider => routeProvider.configureRoutes(router));
app.use("/", router);
