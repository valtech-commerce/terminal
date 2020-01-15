/**
 * Language.
 *
 * @typedef {string} Language
 */

/**
 * Available languages.
 *
 * @typedef {object} Languages
 * @property {Language} english - English.
 * @property {Language} francais - Français.
 */

/**
 * Basic terminal color.
 *
 * @typedef {string} BasicColor
 */

/**
 * Basic terminal colors (8 colors in normal and bright versions).
 *
 * @typedef {object} BasicColors
 * @property {BasicColor} black - Normal black.
 * @property {BasicColor} red - Normal red.
 * @property {BasicColor} green - Normal green.
 * @property {BasicColor} yellow - Normal yellow.
 * @property {BasicColor} blue - Normal blue.
 * @property {BasicColor} magenta - Normal magenta.
 * @property {BasicColor} cyan - Normal cyan.
 * @property {BasicColor} white - Normal white.
 * @property {BasicColor} blackBright - Bright black.
 * @property {BasicColor} redBright - Bright red.
 * @property {BasicColor} greenBright - Bright green.
 * @property {BasicColor} yellowBright - Bright yellow.
 * @property {BasicColor} blueBright - Bright blue.
 * @property {BasicColor} magentaBright - Bright magenta.
 * @property {BasicColor} cyanBright - Bright cyan.
 * @property {BasicColor} whiteBright - Bright white.
 * @property {BasicColor} gray - A blackBright alias.
 * @property {BasicColor} grey - A blackBright alias.
 */

/**
 * A hex triplet color (ex: #0099cc).
 *
 * @typedef {string} HexColor
 */

/**
 * A {@link https://www.npmjs.com/package/cli-spinners spinner type}.
 *
 * @typedef {object} SpinnerType
 * @property {number} interval - Interval between frames in milliseconds.
 * @property {Array<string>} frames - List of each frame of the spinner.
 */

/**
 * Available spinner types.
 *
 * @typedef {{string: SpinnerType}} SpinnerTypes
 */
