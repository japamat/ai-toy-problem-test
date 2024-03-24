/**
 * None of these are used in the current execution of the script.
 * 
 * We used the below when creating the current working version of
 * the algo list. it made more sense to have an existing json stucture
 * with algorithm common name as keys and the dir name value, which
 * meant we didnt need to use the below in the code moving forward.
 * 
 * At the time, i liked using a replacer function to capture an
 * entire group of characters and replace them individual
 * characters specifically as needed
 */

export const algoNameRegex = /('|\(|\)|\s|\*)/g

/**
 * @param {string} matchStr string matched by regex pattern
 * @abstract useful in order to turn turn algorithm names into more file and directory names. 
 * @description replacer callback for String.replace. takes in a matched character and returns what it should be replaced with.
 * @returns string
 */
export const replacerFunc = (matchStr) => {
  switch (matchStr) {
    case "*":
      return '-star';

    case " ":
      return '_';
  
    default:
      return '';
  }
}
