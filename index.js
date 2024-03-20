import fs from "fs";

import { OpenAI } from "./helpers.js";

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

  const toyProblemChat = await openAI.getToyProblem();

  const toyProblem = toyProblemChat.choices[0].message.content
  console.log(toyProblem)

  console.log('\nSolving Problem\n')
  const solution = await openAI.solveToyProblem(toyProblem);
  console.log(solution.choices[0].message.content)
})()
