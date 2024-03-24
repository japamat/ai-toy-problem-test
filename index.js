import fs from "fs";

import {
  OpenAI,
} from "./helpers/OpenAI.js";
import { algoNameRegex, replacerFunc } from "./helpers/stringRelated.js";
import { parseJsonFile } from "./helpers/jsonRelated.js";
import path from "path";
import { getLeastUsedAlgo } from "./helpers/getLeastUsedAlgo.js";

const getSecretByName = (secretName) => {
  const secretsFile = fs.readFileSync('./.dev/secrets', 'utf8');
  const secretsArr = secretsFile.split('\n');

  const targetIdx = secretsArr.indexOf(secretName);
  const targetSecret = secretsArr[targetIdx + 1];
  if (targetIdx < 0 || !targetSecret) {
    throw new Error(`secret: ${secretName} not found`)
  }

  return targetSecret;
}

const getApiToken = () => {
  const chatGptApiToken = getSecretByName('openAiApiKeySecret');
  return chatGptApiToken;
}

/**
 * IIFE to run the script - using IIFE pattern to use async/await instead of .then/.catch pattern
 * separating out generating the problem and solving into two separate conversations to keep conversations separate.
 */
(async () => {
  const model = 'gpt-4';
  const apiKey = getApiToken();
  const openAI = new OpenAI(apiKey, model)

  let toyProblemMarkdown = fs.readFileSync('./templates/toyProblemMarkdown.md', 'utf8')

  const { algoName, algoDirName } = getLeastUsedAlgo();
  console.log('index.js: 42 - ',  algoName);
  console.log('index.js: 43 - ',  algoDirName);

  // update the final markdown file with title of the algo
  toyProblemMarkdown = toyProblemMarkdown.replace(/__ALGO_NAME/,  algoName)
  toyProblemMarkdown = toyProblemMarkdown.replace(/__MODEL/, model)
  
  const now = new Date().toISOString();

  /**
   * Ask ChatGPT to generate a toy proble,
  */
  const toyProblemChat = await openAI.getToyProblem(algoName, model);
  // this is probably where we want to grab the tokens, the model used, etc.
  const toyProblem = toyProblemChat.choices[0].message.content
  toyProblemMarkdown = toyProblemMarkdown.replace(/__TOY_PROBLEM/, toyProblem)


  fs.writeFileSync(
    `./.dev/prompt_json/${algoName}_${now}_prob_chat.json`,
    JSON.stringify(toyProblemChat, null, 2)
  )

  /**
   * Ask ChatGPT to solve the toy problem
   * add solution to markdown string
   */
  const solutionChat = await openAI.solveToyProblem(toyProblem, model);
  const solution = solutionChat.choices[0].message.content
  toyProblemMarkdown = toyProblemMarkdown.replace(/__SOLUTION/, solution)

  // fs.writeFileSync(
  //   `./toy_problems/${ algoName}/${now}_sol_chat.json`,
  //   JSON.stringify(solutionChat, null, 2)
  // )

  /**
   * Save the entire contents as a markdown file
   */
  fs.writeFileSync(`./toy_problems/${algoDirName}/${now}_${algoDirName}.md`, toyProblemMarkdown)
  // console.log(solution)
})()
