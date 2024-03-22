import fs from 'fs'
import path from 'path'
import { algoNameRegex, replacerFunc } from './stringRelated.js';

/**
 * @abstract in order to see if we have already tried to solve an algorithm or not, we read the contents of the `toy_problems` directory.
 * @param {string} algoName name of the algorithm to check if we've already tested
 */
export const getUnusedAlgo = () => {
  // console.log()
  const toyProlemDirContents = fs.readdirSync(path.resolve('./toy_problems'));
  const toyProblemSubDirs = toyProlemDirContents.filter((dirContent) => {
    // return fs.statSync(`./toy_problems/${dirContent}`).isDirectory();
    console.log(fs.statSync(path.resolve('./toy_problems', dirContent)))
    return fs.statSync(path.resolve('./toy_problems', dirContent)).isDirectory();
  })

  // const dirNameForAlgo = algoName.replace(algoNameRegex, replacerFunc)
  // const algoDirExists = toyProblemSubDirs.includes(dirNameForAlgo)

  // if (!algoDirExists) {
  //   fs.mkdirSync(`./toy_problems/${fileDirSafeAlgoName}`)
  // }
}