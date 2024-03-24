import fs from 'fs'
import path from 'path'

import { parseJsonFile } from './jsonRelated.js';

/**
 * @abstract this function determines the next algorithm to attempt. it iterates
 * through the json list of algorithms and then creates a frequency count of
 * attempts by reading the contents of the `toy_problems` directory and counting
 * how many files files matching the attempt format there are.
 * @param {string} algoName name of the algorithm to check if we've already tested
 * @returns {string} the common name of the algorithm to use.
 */
export const getLeastUsedAlgo = () => {
  // [["Bubble Sort", "bubble_sort"],["Selection Sort", "selection_sort"]]
  const algoList = Object.entries(parseJsonFile('./data/algo_list_test.json'));

  // ["bubble_sort", "selection_sort"]
  const toyProlemDirContents = fs.readdirSync(path.resolve('./toy_problems'));

  /**
   * iterate through the algorithm list to see how many times we
   * have attempted each algorithm
   */
  const algoAttemptFreqCount = algoList.reduce(
    (acc, [algoCommonName, algoDirName]) => {

      acc[algoDirName] = {
        algoCommonName,
        // if the algo is present in the toy_problems dir, count the attempts
        attempts: toyProlemDirContents.includes(algoDirName) ?
          getSubDirCount(algoDirName)
          : 0,
      }

      return acc;
    },
    {},
  );

  /**
   * Iterate through frequency count object to find the least used algorithm
   */
  let leastAttemptedAlgo = null;
  let leastAttemptedAlgoDirName = null;
  let lowestAlgoAttempts = Infinity;

  for (const algoDirName in algoAttemptFreqCount) {
    const curAlgoAttempts = algoAttemptFreqCount[algoDirName].attempts;

    // create a directory for the algorithm if it doesnt yet exist
    if (curAlgoAttempts === 0 && !toyProlemDirContents.includes(algoDirName)) {
      fs.mkdirSync(path.resolve(`./toy_problems/${algoDirName}`));
    }

    // compare current algo attempts to lowestAlgoAttempts
    if (curAlgoAttempts < lowestAlgoAttempts) {
      leastAttemptedAlgo = algoAttemptFreqCount[algoDirName].algoCommonName;
      leastAttemptedAlgoDirName = algoDirName;
      lowestAlgoAttempts = curAlgoAttempts;
    }
  }

  return {
    algoName: leastAttemptedAlgo,
    algoDirName: leastAttemptedAlgoDirName
  };
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