import { inject, injectable } from "inversify";
import { Request, Response, Router } from "express";
import { DependencyKeys, RouteKeys } from "../utils/constants";
import { IDocumentService } from "../interfaces/IDocumentService";
import { IRouteProvider } from "../interfaces/IRouteProvider";
import { RouteBase } from "./RouteBase";
import multer from 'multer';
import fs from 'fs';
import PDFParser from 'pdf-parse'

const upload = multer({ dest: 'uploads/' });

@injectable()
export class DocumentAiRoutes extends RouteBase implements IRouteProvider {

    constructor(@inject(DependencyKeys.DocumentService) public readonly documentService: IDocumentService) {
        super();
    }

    public configureRoutes(router: Router): void {
        this.configureDocumentAiRoutes(router);
    }

    private configureDocumentAiRoutes(router: Router): void {

        router.post(`/${RouteKeys.Analyse}`, upload.single('pdf'), async (request: Request, response: Response) => {
            this.safelyExecuteAsync(response, async () => {
                const filePath = request.file.path;
                const dataBuffer = fs.readFileSync(filePath);
                const pdf = await PDFParser(dataBuffer);
                const text = pdf.text;
                const result = await this.documentService.documentAnalyseAsync(text);
                response.status(200).send(result);
            });
        });

        router.post(`/parse`, upload.single('pdf'), async (request: Request, response: Response) => {
            this.safelyExecuteAsync(response, async () => {
                const filePath = request.file.path;
                const dataBuffer = fs.readFileSync(filePath);
                const result = await this.documentService.documentParseAsync(dataBuffer);
                response.status(200).send(result);
            });
        });

    }

}