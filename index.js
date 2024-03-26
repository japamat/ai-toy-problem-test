import fs from "fs";

import {
  OpenAI,
} from "./helpers/OpenAI.js";
import { getLeastUsedAlgo } from "./helpers/getLeastUsedAlgo.js";
import { writeJsonFile } from "./helpers/jsonRelated.js";
import { getAlgoFileNameBase } from "./helpers/stringRelated.js";
import { formatTokenUsage, replaceInOutputFile } from "./helpers/markdownRelated.js";

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
  const baseModel = 'gpt-4';
  const apiKey = getApiToken();
  const openAI = new OpenAI(apiKey, baseModel)

  let toyProblemMarkdown = fs.readFileSync('./templates/toyProblemMarkdown.md', 'utf8')
  const { algoName, algoDirName } = getLeastUsedAlgo();

  const attemptDate = new Date();
  const algoFileNameBase = getAlgoFileNameBase(algoDirName, attemptDate);

  /**
   * Ask ChatGPT to generate a toy proble,
  */
 console.log(`Generating toy problem for: ${algoName}`);
  const toyProblemChat = await openAI.getToyProblem(algoName, baseModel);
  const {
    model: toyProblemModel,
    usage: toyProblemUsage,
    choices: toyProblemChoices
  } = toyProblemChat;
  const toyProblem = toyProblemChoices[0].message.content;


  writeJsonFile(toyProblemChat, `${algoFileNameBase}_prob.json`);

  /**
   * Ask ChatGPT to solve the toy problem
   * add solution to markdown string
   */
  console.log(`Attempting to solve ${algoName} toy problem`)
  const solutionChat = await openAI.solveToyProblem(toyProblem, baseModel);
  const {
    model: solutionModel,
    usage: solutionUsage,
    choices: solutionChoices
  } = solutionChat;
  const solution = solutionChoices[0].message.content;
  
  writeJsonFile(solutionChat, `${algoFileNameBase}_sol.json`);

  /**
   * create output markdown file contents
   */
  const markdownStr = replaceInOutputFile(toyProblemMarkdown, {
    algoName,
    attemptDate: attemptDate.toString(),
    baseModel,
    toyProblemDetails: formatTokenUsage(toyProblemUsage, toyProblemModel),
    toyProblem,
    solutionDetails: formatTokenUsage(solutionUsage, solutionModel),
    solution,
  })

  /**
   * Save the entire contents as a markdown file
   */
  fs.writeFileSync(`${algoFileNameBase}.md`, markdownStr)
})()
