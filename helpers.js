import axios from "axios";
import fs from "fs";


export class OpenAI {
  constructor(apiKey, model = "gpt-4") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.defaultPrompt = this._parseJsonFile('./systemPrompt.json');
    this.algoList = this._parseJsonFile('./algo_list.json');
    this.usedAlgos = this._parseJsonFile('./used_algos.json');
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  _parseJsonFile = (pathToJson) => {
    const rawPromptText = fs.readFileSync(pathToJson, 'utf8');
    return JSON.parse(rawPromptText);
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

  _getUnusedAlgo = (algoListObj) => {
    const algoList = Object.values(algoListObj)
    const usedAlgosKeys = Object.values(this.usedAlgos)

    let unusedAlgo = ""
    // there are no used algos, edge case, need to grab the first algo in algoList
    if (usedAlgosKeys.length === 0) {
      unusedAlgo = algoList[0]
    } else {
      // iterate through the algoList, return algos not in usedAlgos arr
      unusedAlgo = algoList.find((algoInList) => {
        return this.usedAlgos[algoInList] === undefined
      })
    }

    return unusedAlgo;
  }

  getToyProblem = async () => {
    // need to compare two lists, the used_algos and the algo_list
    // need to get the next algo, can be a .filter on keys for "not found"
    /**
     * 1. DONE - iterate through used algos (check base case of 0 used)
     * 2. DONE - find first key that isnt used
     * 2.1 DONE - update prompt text with unused algo (__ALGO_NAME)
     * 3. DONE - ask GPT model for toy problem for algo
     * 4. DONE - ask GPT to solve algo
     * 5. add algo to "used_algo" json
     * 6. write new "used_algo" file
     */
    try {
      const unusedAlgo = this._getUnusedAlgo(this.algoList, this.usedAlgos);
      this.defaultPrompt.genProblem.messages[1].content =
        this.defaultPrompt.genProblem.messages[1].content.replace(/__ALGO_NAME/, unusedAlgo)

      // call openai API
      console.log(`\nGenerating toy problem for: ${unusedAlgo}\n`)
      const generateToyProblem = await axios.post(
        this.baseUrl,
        this.defaultPrompt.genProblem,
        { headers: this.headers }
      );

      return generateToyProblem.data;
    } catch (error) {
      console.log('YA WE THREW')
      this._writeLogIfApiErr(error)
    }
  }

  solveToyProblem = async (toyProblem) => {
    try {
      if (!toyProblem) {
        throw new Error('Toy Problem Not Defined')
      };

      /** replace algo prompt with toy problem prompt from above */
      this.defaultPrompt.solveProblem.messages[1].content =
        this.defaultPrompt.solveProblem.messages[1].content.replace(/__ALGO_PROBLEM_PROMPT/, toyProblem)

      // API request to solve problem (is new chat)
      console.log(`\nAttempting to solve toy problem\n`)
      const solveToyProblem = await axios.post(
        this.baseUrl,
        this.defaultPrompt.solveProblem,
        { headers: this.headers }
      );

      return solveToyProblem.data;
    } catch (error) {
      this._writeLogIfApiErr(error)
      throw error
    }
  }
}
