"use strict";

exports.default = void 0;

var _boxen = _interopRequireDefault(require("boxen"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _chalk = _interopRequireDefault(require("chalk"));

var _child_process = require("child_process");

var _figures = _interopRequireDefault(require("figures"));

var _nodeEmoji = _interopRequireDefault(require("node-emoji"));

var _ora = _interopRequireDefault(require("ora"));

var _prettyMs = _interopRequireDefault(require("pretty-ms"));

var _redent = _interopRequireDefault(require("redent"));

var _stringLength = _interopRequireDefault(require("string-length"));

var _stringWidth = _interopRequireDefault(require("string-width"));

var _joi = require("@absolunet/joi");

var _privateRegistry = _interopRequireDefault(require("@absolunet/private-registry"));

var _terminalPad = _interopRequireDefault(require("@absolunet/terminal-pad"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- AbsolunetTerminal
//--------------------------------------------------------
const HEX_COLOR = /^#[0-f]{6}$/ui;

const isHex = text => {
  return text.match(HEX_COLOR);
};

const chalkColorSchema = _joi.Joi.string().custom((value, helpers) => {
  return _chalk.default[value] ? value : helpers.message('Must be a Chalk keyword');
});

const colorSchema = _joi.Joi.alternatives().try(_joi.Joi.string().pattern(HEX_COLOR, 'hex color'), chalkColorSchema);

const ICONS = {
  success: _figures.default.tick,
  failure: _figures.default.cross
};
const COLORS = {
  confirmationText: _chalk.default.green,
  confirmationBackground: _chalk.default.white.bgGreen,
  warningText: _chalk.default.yellow,
  warningBackground: _chalk.default.black.bgYellow,
  errorText: _chalk.default.red,
  errorBackground: _chalk.default.white.bgRed
};
const DICTIONARY = {
  silentError: {
    fr: `Une erreur silencieuse s'est produite`,
    en: `A silent error has occurred`
  },
  sudo: {
    fr: 'Ça sert à rien de me forcer avec un sudo',
    en: 'It is useless to force me with a sudo'
  },
  completed: {
    fr: 'Complété',
    en: 'Completed'
  },
  after: {
    fr: 'après',
    en: 'after'
  }
};

const translate = (self, key) => {
  return DICTIONARY[key][self.theme.language] || '';
};

const cleanUp = (self, text = '') => {
  return (0, _redent.default)(text, self.theme.indent).replace(/\t/ug, '  ');
};

const requiredStringSchema = _joi.Joi.string().allow('').required();

const startTimer = self => {
  (0, _privateRegistry.default)(self).set('timer', new Date());
};

const stopTimer = self => {
  const start = (0, _privateRegistry.default)(self).get('timer');
  (0, _privateRegistry.default)(self).set('timer', undefined);
  return start ? Date.now() - start : 0;
};

const runOptionsSchema = _joi.Joi.object({
  directory: _joi.Joi.string(),
  environment: _joi.Joi.object().pattern(_joi.Joi.string(), _joi.Joi.string())
});
/**
 * Terminal utilities.
 */


class AbsolunetTerminal {
  /**
   * Create a terminal instance.
   */
  constructor() {
    this.setTheme({
      language: 'en',
      indent: 2,
      logo: '•',
      textColor: 'blue',
      backgroundColor: 'blue',
      textOnBackgroundColor: 'white',
      borderColor: 'blue',
      spinnerColor: 'blue',
      spinnerType: 'dots3'
    });
  }
  /**
   * Get the terminal theme.
   *
   * @returns {object} Theme values.
   */


  get theme() {
    return (0, _privateRegistry.default)(this).get('theme');
  }
  /**
   * Set the terminal theme.
   *
   * @param {object} options - Properties.
   * @param {string} [options.language] - Language to be used in localized outputs (fr|en).
   * @param {number} [options.indent] - Indentation used.
   * @param {string} [options.logo] - Emoji to be used as logo in TitleBox.
   * @param {string} [options.textColor] - A {@link https://www.npmjs.com/package/chalk Chalk color} or hex value to be used in project colored outputs.
   * @param {string} [options.backgroundColor] - A {@link https://www.npmjs.com/package/chalk Chalk color} or hex value to be used in project colored outputs.
   * @param {string} [options.textOnBackgroundColor] - A {@link https://www.npmjs.com/package/chalk Chalk color} or hex value to be used in project colored outputs.
   * @param {string} [options.borderColor] - A {@link https://www.npmjs.com/package/chalk Chalk color} or hex value to be used in project colored outputs.
   * @param {string} [options.spinnerColor] - A {@link https://www.npmjs.com/package/chalk Chalk color} to be used with spinner.
   * @param {string|object} [options.spinnerType] - A {@link https://www.npmjs.com/package/cli-spinners Spinner} theme.
   */


  setTheme(options) {
    (0, _joi.validateArgument)('options', options, _joi.Joi.object({
      language: _joi.Joi.string().valid('fr', 'en'),
      indent: _joi.Joi.number().integer().min(0),
      logo: _joi.Joi.string().custom((value, helpers) => {
        return (0, _stringLength.default)(value) === 1 ? value : helpers.message('Must be one character');
      }),
      textColor: colorSchema,
      backgroundColor: colorSchema,
      textOnBackgroundColor: colorSchema,
      borderColor: colorSchema,
      spinnerColor: chalkColorSchema,
      spinnerType: _joi.Joi.alternatives().try(_joi.Joi.string(), _joi.Joi.object({
        frames: _joi.Joi.array().items(_joi.Joi.string()).required(),
        interval: _joi.Joi.number().integer().min(0)
      }))
    }).required());
    (0, _privateRegistry.default)(this).set('theme', { ...this.theme,
      ...options
    });
  }
  /**
   * Colorize the string text following theme.
   *
   * @param {string} text - Text to colorize.
   * @returns {string} Colorized text.
   */


  colorizeText(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    const colorize = isHex(this.theme.textColor) ? _chalk.default.hex(this.theme.textColor) : _chalk.default[this.theme.textColor];
    return colorize(text);
  }
  /**
   * Colorize the string text and background following theme.
   *
   * @param {string} text - Text to colorize.
   * @returns {string} Colorized text.
   */


  colorizeBackground(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    const color = isHex(this.theme.textOnBackgroundColor) ? _chalk.default.hex(this.theme.textOnBackgroundColor) : _chalk.default[this.theme.textOnBackgroundColor];
    const background = isHex(this.theme.backgroundColor) ? _chalk.default.bgHex(this.theme.backgroundColor) : _chalk.default[(0, _camelcase.default)(['bg', this.theme.backgroundColor])];
    return color(background(text));
  }
  /**
   * Print a text in the terminal.
   *
   * @param {string} text - Text to output.
   */


  echo(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    console.log(text); // eslint-disable-line no-console
  }
  /**
   * Print a text after cleaning and indenting it.
   *
   * @param {string} text - Text to echo.
   */


  echoIndent(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.echo(cleanUp(this, text));
  }
  /**
   * Print a string with default color and indentation.
   *
   * @param {string} text - Text to print.
   */


  print(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.echo(this.colorizeText(cleanUp(this, text)));
  }
  /**
   * Print a string with default color, indentation and new line at the end.
   *
   * @param {string} text - Text to print.
   */


  println(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.print(text);
    this.spacer();
  }
  /**
   * Print one or multiple line breaks.
   *
   * @param {number} [number=1] - Number of line breaks to print.
   */


  spacer(number = 1) {
    (0, _joi.validateArgument)('number', number, _joi.Joi.number().integer().min(1));
    this.print('\n'.repeat(number - 1));
  }
  /**
   * Display a confirmation message.
   *
   * @param {string} text - Text to output.
   * @param {boolean} [newline=false] - Add a newline.
   */


  confirmation(text, newline = false) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _joi.validateArgument)('newline', newline, _joi.Joi.boolean());
    this.echo(COLORS.confirmationText(cleanUp(this, text)));

    if (newline) {
      this.spacer();
    }
  }
  /**
   * Display a warning message.
   *
   * @param {string} text - Text to output.
   * @param {boolean} [newline=false] - Add a newline.
   */


  warning(text, newline = false) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _joi.validateArgument)('newline', newline, _joi.Joi.boolean());
    this.echo(COLORS.warningText(cleanUp(this, text)));

    if (newline) {
      this.spacer();
    }
  }
  /**
   * Display an error message.
   *
   * @param {string} text - Text to output.
   * @param {boolean} [newline=false] - Add a newline.
   */


  error(text, newline = false) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _joi.validateArgument)('newline', newline, _joi.Joi.boolean());
    this.echo(COLORS.errorText(cleanUp(this, text)));

    if (newline) {
      this.spacer();
    }
  }
  /**
   * Display a success message with a check mark icon.
   *
   * @param {string} text - Text to output.
   * @param {boolean} [newline=true] - Add a newline.
   */


  success(text, newline = true) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _joi.validateArgument)('newline', newline, _joi.Joi.boolean());
    this.confirmation(`${ICONS.success}  ${text}`, newline);
  }
  /**
   * Display a failure message with an ⨉ mark icon.
   *
   * @param {string} text - Text to output.
   * @param {boolean} [newline=true] - Add a newline.
   */


  failure(text, newline = true) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _joi.validateArgument)('newline', newline, _joi.Joi.boolean());
    this.error(`${ICONS.failure}  ${text}`, newline);
  }
  /**
   * Display the given state.
   * If the state is falsy, the given message will be display.
   *
   * @param {object}  options - Options.
   * @param {boolean} options.state - If a success or a failure.
   * @param {string}  options.name - Name of the property.
   * @param {string}  options.value - Value of the property.
   * @param {string}  [options.message] - Detailed error message in case of failure.
   */


  printState(options) {
    (0, _joi.validateArgument)('options', options, _joi.Joi.object({
      state: _joi.Joi.boolean().required(),
      name: _joi.Joi.string().required(),
      value: _joi.Joi.string().required(),
      message: _joi.Joi.string()
    }).required());
    const mark = ICONS[options.state ? 'success' : 'failure'];
    const colorize = COLORS[`${options.state ? 'confirmation' : 'error'}Text`];
    const errorMessage = options.state ? '' : options.message;
    this.echoIndent(`${_chalk.default.bold(`${options.name}`)}  ${colorize(`${mark}  ${options.value} ${errorMessage}`)}`);
  }
  /**
   * Display the given files status depending if they were not added, created, modified, renamed or deleted, with a Git flavor.
   * The available status are: "not_added", "created", "modified", "renamed" and "deleted".
   *
   * @param {{string: Array<string|{from: string, to: string}>}} status - A {@link https://www.npmjs.com/package/simple-git simple-git} status object.
   */


  printStatus(status) {
    (0, _joi.validateArgument)('status', status, _joi.Joi.object().pattern(_joi.Joi.string().valid('not_added', 'created', 'modified', 'renamed', 'deleted'), _joi.Joi.alternatives().try(_joi.Joi.string(), _joi.Joi.object({
      from: _joi.Joi.string(),
      to: _joi.Joi.string()
    }))).required());
    const colorize = {
      not_added: COLORS.confirmationText,
      // eslint-disable-line camelcase
      created: COLORS.confirmationText,
      modified: COLORS.warningText,
      renamed: COLORS.warningText,
      deleted: COLORS.errorText
    };
    this.spacer(2);
    Object.keys(colorize).forEach(type => {
      if (status[type].length !== 0) {
        status[type].forEach(file => {
          this.echoIndent(`${colorize[type]((0, _terminalPad.default)(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`);
        });
      }
    });
    this.spacer(2);
  }
  /**
   * Start the spinner with a given text.
   *
   * @param {string} text - Text to output.
   */


  startSpinner(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    const {
      spinnerType: spinner,
      spinnerColor: color
    } = this.theme;
    (0, _privateRegistry.default)(this).set('spinner', (0, _ora.default)({
      text,
      spinner,
      color
    }).start());
  }
  /**
   * Stop the spinner.
   */


  stopSpinner() {
    const spinner = (0, _privateRegistry.default)(this).get('spinner');

    if (spinner) {
      spinner.stop();
    }

    (0, _privateRegistry.default)(this).set('spinner', undefined);
  }
  /**
   * Display an error message indicating not to use "sudo".
   */


  dontSudoMe() {
    this.errorBox(`${translate(this, 'sudo')} ${_nodeEmoji.default.get('cry')}`);
  }
  /**
   * Exit the process and show an optional exit message in an error box.
   *
   * @param {string} [message] - ErrorBox message to display.
   */


  exit(message) {
    (0, _joi.validateArgument)('message', message, _joi.Joi.string());

    if (message) {
      this.errorBox(message);
    }

    process.exit(2); // eslint-disable-line no-process-exit, unicorn/no-process-exit
  }
  /**
   * Print a text in a box.
   *
   * @param {string} text - Text to output.
   * @param {object} [options] - Options.
   * @param {Function} [options.colorizer=this.colorizeBackground] - A background colorizer.
   * @param {boolean} [options.padding=true] - Add vertical padding.
   * @param {boolean} [options.extraPadding=false] - Needs extra padding.
   */


  box(text, {
    colorizer = this.colorizeBackground.bind(this),
    padding = true,
    extraPadding = false
  } = {}) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _joi.validateArgument)('options.colorizer', colorizer, _joi.Joi.function());
    (0, _joi.validateArgument)('options.padding', padding, _joi.Joi.boolean());
    (0, _joi.validateArgument)('options.extraPadding', extraPadding, _joi.Joi.boolean());
    let content = cleanUp(this, text).replace(/^\n+/ug, '').replace(/\n+\s*$/ug, '');
    content = padding ? `\n${content}\n` : content;
    const lines = content.split('\n');
    const max = Math.max(...lines.map(line => {
      return (0, _stringWidth.default)(line);
    }));
    const padLength = max < 79 ? 80 : max + 2;
    this.spacer();
    lines.forEach((line, i) => {
      this.echo(colorizer((0, _terminalPad.default)(line, padLength) + (extraPadding && i === 2 ? ' ' : '')));
    });
    this.spacer();
  }
  /**
   * Display a title in a box.
   * The logo will be shown as well.
   *
   * @param {string} text - Text to output.
   */


  titleBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    startTimer(this);
    const {
      logo
    } = this.theme;
    const {
      length
    } = logo;
    const extraPadding = length === (0, _stringWidth.default)(logo) && length === (0, _stringLength.default)(logo);
    this.box(`
			${_chalk.default.reset('        ')}${this.colorizeBackground(' ')}
			${_chalk.default.reset(`   ${logo}${extraPadding ? ' ' : ''}   `)}${this.colorizeBackground(' ')} ${text}
			${_chalk.default.reset('        ')}${this.colorizeBackground(' ')}
		`, {
      padding: true,
      extraPadding: extraPadding && length === 2
    });
  }
  /**
   * Display an informative message box.
   *
   * @param {string} text - Text to output.
   */


  infoBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.box(text);
  }
  /**
   * Display a confirmation message box.
   *
   * @param {string} text - Text to output.
   */


  confirmationBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.box(text, {
      colorizer: COLORS.confirmationBackground
    });
  }
  /**
   * Display a warning message box.
   *
   * @param {string} text - Text to output.
   */


  warningBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.box(text, {
      colorizer: COLORS.warningBackground
    });
  }
  /**
   * Display an error message box.
   *
   * @param {string} text - Text to output.
   */


  errorBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.box(text, {
      colorizer: COLORS.errorBackground
    });
  }
  /**
   * Display a completion box by using the timer if wanted and started.
   *
   * @param {boolean} [showDuration=true] - Show amount of time since last TitleBox.
   */


  completionBox(showDuration = true) {
    (0, _joi.validateArgument)('showDuration', showDuration, _joi.Joi.boolean());
    const time = showDuration && (0, _privateRegistry.default)(this, 'timer') ? ` ${translate(this, 'after')} ${(0, _prettyMs.default)(stopTimer(this))}` : '';
    this.infoBox(`${ICONS.success}  ${translate(this, 'completed')}${time}`);
    this.spacer(2);
  }
  /**
   * Display a bordered box.
   *
   * @param {string} text - Text to output.
   */


  borderedBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    this.echo((0, _boxen.default)(this.colorizeText(text), {
      padding: 1,
      margin: 1,
      align: 'center',
      borderColor: this.theme.borderColor
    }));
  }
  /**
   * Process run options.
   *
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   * @returns {{ cwd: string, env: { string: string }}} Parsed run options.
   */


  processRunOptions(options) {
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    const {
      directory
    } = options;
    const environment = options.environment || {};
    return {
      cwd: directory,
      env: { ...process.env,
        ...environment
      }
    }; // eslint-disable-line unicorn/prevent-abbreviations, no-process-env
  }
  /**
   * Run a command in sync mode.
   *
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   */


  run(command, options = {}) {
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    (0, _child_process.execSync)(command, {
      stdio: 'inherit',
      ...this.processRunOptions(options)
    });
  }
  /**
   * Run a command in async mode.
   *
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   * @param {string} [options.ignoreError=''] - Error message string to ignore.
   * @param {boolean} [options.silent=false] - Silence all errors.
   * @returns {Promise<{error: string, stdout: string, stderr: string}>} Terminal outputs.
   */


  runPromise(command, {
    directory,
    environment,
    ignoreError = '',
    silent = false
  } = {}) {
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options.directory', directory, _joi.Joi.string());
    (0, _joi.validateArgument)('options.environment', environment, _joi.Joi.object().pattern(_joi.Joi.string(), _joi.Joi.string()));
    (0, _joi.validateArgument)('options.ignoreError', ignoreError, _joi.Joi.string().allow(''));
    (0, _joi.validateArgument)('options.silent', silent, _joi.Joi.boolean());
    return new Promise(resolve => {
      (0, _child_process.exec)(command, {
        stdio: 'inherit',
        ...this.processRunOptions({
          directory,
          environment
        })
      }, (error, stdout, stderr) => {
        const output = stdout.trim();
        let errorOutput = stderr.trim();
        let errorMessage = (error || '').toString().trim();

        if (ignoreError) {
          errorMessage = errorMessage.replace(ignoreError, '').trim();
          errorOutput = stderr.replace(ignoreError, '').trim();
        } // Error


        if (!silent) {
          if (errorMessage || errorOutput) {
            if (output) {
              this.echo(output);
            }

            if (errorMessage) {
              if (!errorOutput) {
                this.error(translate(this, 'silentError'));
              }

              this.error(`
								${errorMessage || ''}
								${errorOutput || ''}
							`);
              this.exit();
            } else {
              this.warning(errorOutput);
            }
          }
        }

        resolve({
          error,
          stdout,
          stderr
        });
      });
    });
  }
  /**
   * Run a command in sync mode and get its output.
   *
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   * @returns {string} Output.
   */


  runAndRead(command, options = {}) {
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    return (0, _child_process.execSync)(command, {
      stdio: ['inherit', 'pipe', 'inherit'],
      encoding: 'utf8',
      ...this.processRunOptions(options)
    });
  }
  /**
   * Run a command in sync mode and get its output line by line, by excluding empty lines.
   *
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   * @returns {Array<string>} Output.
   */


  runAndReadLines(command, options = {}) {
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    return this.runAndRead(command, options).split('\n').filter(Boolean);
  }
  /**
   * Run a command in sync mode and get its output separated by a slash.
   *
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   * @returns {string} Output.
   */


  runAndGet(command, options = {}) {
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    return this.runAndReadLines(command, options).join(' / ');
  }
  /**
   * Run a command in sync mode and echo its output.
   *
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   */


  runAndEcho(command, options = {}) {
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    this.runAndReadLines(command, options).forEach(line => {
      this.echo(line);
    });
  }
  /**
   * Print the task to be executed, run the command in sync mode and display a completion box.
   *
   * @param {string} title - Title explaining the command.
   * @param {string} command - Command to run.
   * @param {object} [options] - Options.
   * @param {string} [options.directory] - Current working directory of the command.
   * @param {object} [options.environment] - Environment key-value pairs to add.
   */


  runTask(title, command, options = {}) {
    (0, _joi.validateArgument)('title', title, _joi.Joi.string().required());
    (0, _joi.validateArgument)('command', command, _joi.Joi.string().required());
    (0, _joi.validateArgument)('options', options, runOptionsSchema);
    this.titleBox(title);
    this.run(command, options);
    this.completionBox();
  }

}

var _default = AbsolunetTerminal;
exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;