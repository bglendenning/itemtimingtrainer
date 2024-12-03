/**
 * Convert `number` to a string and left-pad with zeroes to length `length`.
 * @param {number} number - The number to pad.
 * @param {number} length - The desired character-length of the padded string.
 * @returns {string} - The padded string.
 */
export function pad(number, length) {
  let paddedValue = number.toString();

  while (paddedValue.length < length) {
    paddedValue = "0" + paddedValue;
  }

  return paddedValue;
}
