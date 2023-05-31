import { injectable, inject } from "inversify";
import { DependencyKeys } from "../utils/constants";
import { IDocumentService } from "../interfaces/IDocumentService"
import { openai } from "./openai"
import { client } from "./GoogleDocAI"
import config from "../config/config.json"

@injectable()
export class DocumentService implements IDocumentService {

    public async documentAnalyseAsync(document: string): Promise<any> {
        const maxTokens = 2000;
        let prompt = "Please extract information from this document  - `";
        const summary = [];

        const promptChunks = [];
        for (let i = 0; i < document.length; i += maxTokens) {
          promptChunks.push(document.slice(i, i + maxTokens));
        }
        
        for (const chunk of promptChunks) {
          const res = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt + chunk + '`',
            temperature: 0,
            max_tokens: maxTokens
          });
          
          summary.push(res.data.choices[0].text);
        }
        
        return summary.join("");
      }

      public async documentParseAsync(doc: any): Promise<any> {
          // The full resource name of the processor, e.g.:
          // projects/project-id/locations/location/processor/processor-id
    
          const name = `projects/${config.googleDocumentAI.projectId}/locations/${config.googleDocumentAI.location}/processors/${config.googleDocumentAI.processorId}`;
        
          // Convert the image data to a Buffer and base64 encode it.
          const encodedImage = Buffer.from(doc).toString('base64');
        
          const request = {
            name,
            rawDocument: {
              content: doc,
              mimeType: 'application/pdf',
            },
          };
        
          // Recognizes text entities in the PDF document
          const [result] = await client.processDocument(request);
          const {document} = result;
        
          // Get all of the document text as one big string
          const {text} = document;
        
          // Extract shards from the text field
          const getText = (textAnchor: { textSegments: string | any[]; }) => {
            if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
              return '';
            }
        
            // First shard in document doesn't have startIndex property
            const startIndex = textAnchor.textSegments[0].startIndex || 0;
            const endIndex = textAnchor.textSegments[0].endIndex;
        
            return text.substring(startIndex, endIndex);
          };
        
          // Read the text recognition output from the processor
          console.log('The document contains the following paragraphs:');
          const [page1] = document.pages;
          const {paragraphs} = page1;
        
          for (const paragraph of paragraphs) {
            const paragraphText = getText(paragraph.layout.textAnchor);
            console.log(`Paragraph text:\n${paragraphText}`);
          }

          let pages = [];
          (document.pages ?? []).map((page: any) => {
            let schema = [];
            (page.formFields ?? []).map((formField: any) => {
              const fieldName = formField?.fieldName?.textAnchor?.content.replace(/\n/g, '');
              const fieldValue = formField?.fieldValue?.textAnchor?.content.replace(/\n/g, '');
              schema.push({[fieldName]: fieldValue});
            });
            pages.push(schema);
          });

          document.schema = pages;
          return document;
        }
}
