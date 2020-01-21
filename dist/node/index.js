"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Terminal", {
  enumerable: true,
  get: function () {
    return _AbsolunetTerminal.default;
  }
});
Object.defineProperty(exports, "Process", {
  enumerable: true,
  get: function () {
    return _AbsolunetTerminalProcess.default;
  }
});
exports.terminal = void 0;

var _AbsolunetTerminal = _interopRequireDefault(require("./AbsolunetTerminal"));

var _AbsolunetTerminalProcess = _interopRequireDefault(require("./AbsolunetTerminalProcess"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- @absolunet/terminal
//--------------------------------------------------------
const terminal = new _AbsolunetTerminal.default();
/**
 * Exports a default instance of the terminal and also the main class.
 *
 * @module @absolunet/terminal
 */

/**
 * Class definition of Terminal.
 *
 * @name Terminal
 * @type {AbsolunetTerminal}
 **/

exports.terminal = terminal;