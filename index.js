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

(async () => {
  const apiKey = getApiToken();
  const openAI = new OpenAI(apiKey)

  console.log("starting convo with chatgpt 4")
  const convoTone = await openAI.setConvoTone();
  console.log(convoTone.choices)
})()
