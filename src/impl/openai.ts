import { Configuration, OpenAIApi } from "openai";
import config from "../config/config.json"

const configuration = new Configuration({
  apiKey: config.openai.api_key,
});

export const openai = new OpenAIApi(configuration);
