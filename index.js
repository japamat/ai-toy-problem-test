import fs from "fs";

import { OpenAI, checkIfAlgoDirInToyProbDir } from "./helpers.js";

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
  const apiKey = getApiToken();
  const openAI = new OpenAI(apiKey)
  let toyProblemMarkdown = fs.readFileSync('./templates/toyProblemMarkdown.md', 'utf8')
  console.log(toyProblemMarkdown)

  const unusedAlgo = openAI.getUnusedAlgo(openAI.algoList, openAI.usedAlgos)

  // update the final markdown file with title of the algo
  toyProblemMarkdown = toyProblemMarkdown.replace(/__ALGO_NAME/, unusedAlgo)

  // make sure there exists a directory inside of ./toy_problems for the algorithm
  checkIfAlgoDirInToyProbDir(unusedAlgo)
  // future state will note use plain timestamps but will date format 
  const now = Date.now()
  
  /**
   * Ask ChatGPT to generate a toy proble,
  */
  const toyProblemChat = await openAI.getToyProblem(unusedAlgo);
  const toyProblem = toyProblemChat.choices[0].message.content
  toyProblemMarkdown = toyProblemMarkdown.replace(/__TOY_PROBLEM/, toyProblem)
  // fs.writeFileSync(
  //   `./toy_problems/${unusedAlgo}/${now}_prob_chat.json`,
  //   JSON.stringify(toyProblemChat, null, 2)
  // )

  /**
   * Ask ChatGPT to solve the toy problem
   * add solution to markdown string
   */
  const solutionChat = await openAI.solveToyProblem(toyProblem);
  const solution = solutionChat.choices[0].message.content
  toyProblemMarkdown = toyProblemMarkdown.replace(/__SOLUTION/, solution)

  // fs.writeFileSync(
  //   `./toy_problems/${unusedAlgo}/${now}_sol_chat.json`,
  //   JSON.stringify(solutionChat, null, 2)
  // )

  /**
   * Save the entire contents as a markdown file
   */
  fs.writeFileSync(`./toy_problems/${unusedAlgo}/${now}.md`, toyProblemMarkdown)
  // console.log(solution)
})()
