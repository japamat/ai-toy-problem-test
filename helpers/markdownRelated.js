export const markdownReplaceKeys = {
  algoName: '__ALGO_NAME',
  attemptDate: '__ATTEMPT_DATE',
  baseModel: '__BASE_MODEL',
  toyProblemDetails: '__TOY_PROBLEM_DETAILS',
  toyProblem: '__TOY_PROBLEM',
  solutionDetails: '__SOLUTION_DETAILS',
  solution: '__SOLUTION',
}

/**
 * @abstract simplifies replacing multiple strings in my markdown file
 * @param {object} inputObject object where keys correspond to the variables used to replace in the markdown file, i.e. the variable `toyProblem` will replace the string __TOY_PROBLEM in the markdown file. example:
 * {
 *    "toyProblemModel": "gpt-4-0613"
 * }
 * @param {string} markdownStr markdown file as a string
 */
export const replaceInOutputFile = (markdownStr, inputObject) => {
  let markdownStrOut = markdownStr;

  for (const stringToReplace in inputObject) {
    const patternToMatch = new RegExp(markdownReplaceKeys?.[stringToReplace] || /_X_/);
    markdownStrOut = markdownStrOut.replace(patternToMatch, inputObject[stringToReplace]);
  };

  return markdownStrOut;
};

/**
 * 
 * @param {object} tokenUsage response token usage from OpenAI calls:
 * @interface
 *   {
 *     "prompt_tokens": number,
 *     "completion_tokens": number,
 *     "total_tokens": number,
 *   }
 */
export const formatTokenUsage = (tokenUsage, model) => {
  const { prompt_tokens, completion_tokens, total_tokens } = tokenUsage;

  return [
    `model: \`${model}\``,
    `Prompt: \`${prompt_tokens}\` tokens`,
    `Completion: \`${completion_tokens}\` tokens`,
    `Total: \`${total_tokens}\` tokens`,
  ].join(' • ');
}