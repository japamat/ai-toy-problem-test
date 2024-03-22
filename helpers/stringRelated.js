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
