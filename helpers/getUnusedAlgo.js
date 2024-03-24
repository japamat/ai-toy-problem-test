import fs from 'fs'
import path from 'path'

import { algoNameRegex, replacerFunc } from './stringRelated.js';
import { parseJsonFile } from './jsonRelated.js';

/**
 * @abstract in order to see if we have already tried to solve an algorithm or not, we read the contents of the `toy_problems` directory. Those contents will tell us whether or not we have tried to, also how many times we have
 * @param {string} algoName name of the algorithm to check if we've already tested
 */
export const getUnusedAlgo = () => {
  // [["Bubble Sort", "bubble_sort"],["Selection Sort", "selection_sort"]]
  const algoList = Object.entries(parseJsonFile('./algo_list_test.json'));

  // ["bubble_sort", "selection_sort"]
  const toyProlemDirContents = fs.readdirSync(path.resolve('./toy_problems'));

  /**
   * thinking i can go through the algoList instead of the toyProblemDirContents
   * this will build a freqCount with 0s natively, and means i wont need to filter out for is algo because i'll only be looking at algos.
   */
  // make sure we're only evaluating directories that are related to algorithms
  const algoAttemptFreqCount = algoList.reduce(
    (acc, [algoCommonName, algoDirName]) => {

      acc[algoDirName] = {
        algoCommonName,
        // if its not there...
        attempts: toyProlemDirContents.includes(algoDirName) ?
          getSubDirCount(algoDirName)
          : 0,
      }

      return acc;
    },
    {},
  );

  console.log('freqCount', algoAttemptFreqCount)

  /**
   * TODO: Explain whats going on here
   */
  let leastAttemptedAlgo = null;
  let lowestAlgoAttempts = Infinity;
  for (const algoDirName in algoAttemptFreqCount) {
    // check to see if the current algo attempt count is lower than lowestAlgoAttempts
    const curAlgoAttempts = algoAttemptFreqCount[algoDirName].attempts;
    if (curAlgoAttempts === 0) {
      fs.mkdirSync(path.resolve(`./toy_problems/${algoDirName}`));
    }
    if (curAlgoAttempts < lowestAlgoAttempts) {
      leastAttemptedAlgo = algoAttemptFreqCount[algoDirName].algoCommonName;
      lowestAlgoAttempts = curAlgoAttempts;
    }
  }

  console.log('leastAttemptedAlgo: ', leastAttemptedAlgo)

  return leastAttemptedAlgo;
}

/**
 * @abstract used for to get the count of files in a given toy problem directory
 * that represent attempts to solve. We use this to get a frequency of algorithm
 * attempts so that we can cycle through the list of algorithms and attmpt to each
 * once, then each twice, etc.
 * @param {string} subDirName name of the subdir to get the markdown contents of
 * @returns {number} how many files are in the toy problems directory that represent
 * attmepts to solve the given toy problem
 */
const getSubDirCount = (subDirName) => {
  const algoDirContents = fs.readdirSync(path.resolve(`./toy_problems/${subDirName}`));

  const algoAttemptRegex = new RegExp(
    /**
     * matches the markdown files formatted like:
     *  `${ISO 8601 format}_${algoName}.md`
     * using RegExp constructor to build dynamic regular expressions that include
     * the algortithm name, hence needing to escape the escape characters 🙄
     */
    `20\\d{2}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z_${subDirName}.md`,
  )
  const algoAttempts = algoDirContents.filter((fileName) => {
    return algoAttemptRegex.test(fileName);
  });

  return algoAttempts.length;
}