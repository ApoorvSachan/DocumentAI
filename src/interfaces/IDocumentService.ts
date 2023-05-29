
export interface IDocumentService {
    documentAnalyseAsync( document: string ): Promise<any>;
    documentParseAsync(doc: string): Promise<any>;
}