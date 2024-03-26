import axios from "axios";
import fs from "fs";
import * as Prompts from './getPrompts.js'


export class OpenAI {
  constructor(apiKey, model = "gpt-4") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';

    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  _writeLogIfApiErr = (error) => {
    if (error?.response) {
      const now = Date.now();
      fs.writeFileSync(
        `./.logs/${now}_openai_err.log`,
        JSON.stringify(error?.response?.data),
      )
    }
  }

  getToyProblem = async (unusedAlgo, model) => {
    try {
      const payload = Prompts.getToyProblem(unusedAlgo, model)

      // call openai API
      const generateToyProblem = await axios.post(
        this.baseUrl,
        payload,
        { headers: this.headers }
      );

      return generateToyProblem.data;
    } catch (error) {
      console.log('YA WE THREW')
      this._writeLogIfApiErr(error)
    }
  }

  solveToyProblem = async (toyProblem, model) => {
    try {
      if (!toyProblem) {
        throw new Error('Toy Problem Not Defined')
      };

      /** replace algo prompt with toy problem prompt from above */
      const payload = Prompts.solveToyProblem(toyProblem, model)

      // API request to solve problem (is new chat)
      const solveToyProblem = await axios.post(
        this.baseUrl,
        payload,
        { headers: this.headers }
      );

      return solveToyProblem.data;
    } catch (error) {
      this._writeLogIfApiErr(error)
      throw error
    }
  }
}
