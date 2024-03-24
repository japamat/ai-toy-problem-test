import axios from "axios";
import fs from "fs";
import * as Prompts from './getPrompts.js'
import path from "path";
import { parseJsonFile } from "./jsonRelated.js";

/**
 * 
 * @param {string} algoName toy problem to check
 * @description checks to see if we already have a directory inside of ./toy_problems for the target algorithm. if we dont, then we create it.
 * @returns void
 */
export const checkIfAlgoDirInToyProbDir = (fileDirSafeAlgoName) => {
  const toyProlemDirContents = fs.readdirSync('./toy_problems');
  const toyProblemSubDirs = toyProlemDirContents.filter((dirContent) => {
    return fs.statSync(`./toy_problems/${dirContent}`).isDirectory();
  })

  const algoDirExists = toyProblemSubDirs.includes(fileDirSafeAlgoName);
  
  if (!algoDirExists) {
    fs.mkdirSync(`./toy_problems/${fileDirSafeAlgoName}`)
  }
}




export class OpenAI {
  constructor(apiKey, model = "gpt-4") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    // this.defaultPrompt = this._parseJsonFile('./systemPrompt.json');
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
    // need to compare two lists, the used_algos and the algo_list
    // need to get the next algo, can be a .filter on keys for "not found"
    /**
     * 1. DONE - iterate through used algos (check base case of 0 used)
     * 2. DONE - find first key that isnt used
     * 2.1 DONE - update prompt text with unused algo (__ALGO_NAME)
     * 3. DONE - ask GPT model for toy problem for algo
     * 4. DONE - ask GPT to solve algo
     * 
     * TODO:
     * 5. add algo to "used_algo" json
     * 6. write new "used_algo" file
     * 
     * 
     * 
     * DONE - Also need to make a markdown file.
     * 
     *  DONE - should also make a new folder if we dont have one for the toy problem
     * 
     * DONE - need to separate getting the toy problem name from this method
     */
    try {
      const payload = Prompts.getToyProblem(unusedAlgo, model)
      // this.defaultPrompt.genProblem.messages[1].content =
      //   this.defaultPrompt.genProblem.messages[1].content.replace(/__ALGO_NAME/, unusedAlgo)

      // call openai API
      console.log(`\nGenerating toy problem for: ${unusedAlgo}\n`)
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
      // this.defaultPrompt.solveProblem.messages[1].content =
      //   this.defaultPrompt.solveProblem.messages[1].content.replace(/__ALGO_PROBLEM_PROMPT/, toyProblem)

      // API request to solve problem (is new chat)
      console.log(`\nAttempting to solve toy problem\n`)
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
