
export interface IDocumentService {
    documentAnalyseAsync( document: string ): Promise<any>;
    documentParseAsync(doc: any, fileExtension: string): Promise<any>;
}