import fs from 'fs'
import path from 'path'

/**
 * 
 * @param {string} pathToJson path to json to resolve
 * @returns {object} parsed JSON file.
 * @todo ERROR HANDLING
 */
export const parseJsonFile = (pathToJson) => {
  const safePath = path.resolve(pathToJson);
  const rawPromptText = fs.readFileSync(safePath, 'utf8');
  return JSON.parse(rawPromptText);
};

/**
 * @abstract single line func for writing json files
 * @param {object} data path to json to resolve
 * @param {string} pathToJson path to json to resolve
 * @returns {object} parsed JSON file.
 * @todo ERROR HANDLING
 */
export const writeJsonFile = (data, pathToJson) => {
  const dataToWrite = JSON.stringify(data, null, 2);
  const safePath = path.resolve(pathToJson);
  const rawPromptText = fs.writeFileSync(safePath, dataToWrite);
};