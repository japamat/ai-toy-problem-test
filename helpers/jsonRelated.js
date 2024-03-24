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
}