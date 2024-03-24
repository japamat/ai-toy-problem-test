import fs from 'fs'
import path from 'path'

import { algoNameRegex, replacerFunc } from './stringRelated.js';
import { parseJsonFile } from './jsonRelated.js';

/**
 * @abstract in order to see if we have already tried to solve an algorithm or not, we read the contents of the `toy_problems` directory.
 * @param {string} algoName name of the algorithm to check if we've already tested
 */
export const getUnusedAlgo = () => {
  // List of common name, not dir name, algos
  // const algoList = Object.values(parseJsonFile('./algo_list.json'));
  // [["Bubble Sort", "bubble_sort"],["Selection Sort", "selection_sort"]]
  const algoList = Object.entries(parseJsonFile('./algo_list_test.json'));

  // ["bubble_sort", "selection_sort"]
  const toyProlemDirContents = fs.readdirSync(path.resolve('./toy_problems'));

  // we want to make sure we're only evaluating directories that are related to algorithms
  const algoAttemptFreqCount = toyProlemDirContents.reduce((acc, dirContent) => {
    // first check that the item is a directory
    const isDir = fs.statSync(
      path.resolve('./toy_problems', dirContent)
    ).isDirectory();
    // const dirContentIsAlgo = algoListDirNames.includes(dirContent);
    let algoCommonName = null;
    const dirContentIsAlgo = algoList.find(([commonName, dirSafeName]) => {
      const isAlgo = dirSafeName === dirContent;
      if (isAlgo) {
        algoCommonName = commonName;
        return isAlgo;
      }

      return false;
    });

    // if is a directory and a valid algo, get the number of attempts
    if (isDir && dirContentIsAlgo) {
      acc[dirContent] = {
        count: getSubDirCount(dirContent),
        algoName: algoCommonName,
      };
    };

    return acc;
  }, {})
  console.log('freqCount', algoAttemptFreqCount)

  /**
   * TODO: Clean up comments
   * first check to see if there is one we havent attempted
   *    to do this we need to iterate through the algo list
   *    and find the first one that isnt in the freq qount object
   * 
   * if we find one that we have NOT attempted, then we need to create the dir
   * if we have attempted them all then we need to get the one least attempted.
   */
  const unattemptedAlgo = algoList.find(([commonName, algoListDirName]) => {
    return !algoAttemptFreqCount[algoListDirName]?.count
  });

  console.log('unattemptedAlgo: ', unattemptedAlgo)

  // case: we found an algorithm that we have yet to attempt.
  if (unattemptedAlgo !== undefined) {
    const [unattemptedCommonName, unattemptedDirSafeName] = unattemptedAlgo;
    if (algoAttemptFreqCount[unattemptedDirSafeName] === undefined) {
      fs.mkdirSync(path.resolve(`./toy_problems/${unattemptedDirSafeName}`));
    }

    return unattemptedCommonName;
  }

  /**
   * TODO: implement the back half in the case that we have attempted each algorithm atleast once.
   */

  return;
  // const dirNameForAlgo = algoName.replace(algoNameRegex, replacerFunc)
  // const algoDirExists = algoAttemptFreqCount.includes(dirNameForAlgo)

  // if (!algoDirExists) {
  //   fs.mkdirSync(`./toy_problems/${fileDirSafeAlgoName}`)
  // }
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