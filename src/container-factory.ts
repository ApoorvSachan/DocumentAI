import "reflect-metadata";
import { Container, interfaces } from "inversify";
import { DependencyKeys } from "./utils/constants";
import { IDocumentService } from "./interfaces/IDocumentService";
import { DocumentService } from "./impl/DocumentService"
import { IRouteProvider } from "./interfaces/IRouteProvider";
import { DocumentAiRoutes } from "./routes/DocumentAiRoutes";

export class ContainerFactory {
    public static getContainer(): Container {
        let container = new Container({ skipBaseClassChecks: true });
        this.configureServices(container);
        return container;
    }

    private static async configureServices(container: Container) {

        container.bind<IDocumentService>(DependencyKeys.DocumentService).to(DocumentService);
        container.bind<IRouteProvider>(DependencyKeys.Routes).to(DocumentAiRoutes);

    }
}