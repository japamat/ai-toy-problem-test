import axios from "axios";
import fs from "fs";


export class OpenAI {
  constructor(apiKey, model = "gpt-4") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.defaultPrompt = this._parseJsonFile('./systemPrompt.json');
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  _parseJsonFile = (pathToJson) => {
    const rawPromptText = fs.readFileSync(pathToJson, 'utf8');
    return JSON.parse(rawPromptText);
  }

  // private formatPayload = 
  _writeLogIfApiErr = (error) => {
    if (error?.response) {
      const now = Date.now();
      fs.writeFileSync(
        `./.logs/${now}_openai_err.log`,
        JSON.stringify(error?.response?.data),
      )
    }
  }

  setConvoTone = async () => {
    try {

      const chatInit = await axios.post(
        this.baseUrl,
        this.defaultPrompt,
        { headers: this.headers }
      );  
      return chatInit.data;
    } catch (error) {
      console.log('YA WE THREW')
      this._writeLogIfApiErr(error)
    }
  }

  ask(prompt) {
    try {
      
    } catch (error) {
      this._writeLogIfApiErr(error)
      throw error
    }
  }
}
