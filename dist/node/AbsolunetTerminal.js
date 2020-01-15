"use strict";

exports.default = void 0;

var _boxen = _interopRequireDefault(require("boxen"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _chalk = _interopRequireDefault(require("chalk"));

var _child_process = require("child_process");

var _cliSpinners = _interopRequireDefault(require("cli-spinners"));

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
const BASIC_COLORS = {
  black: 'black',
  red: 'red',
  green: 'green',
  yellow: 'yellow',
  blue: 'blue',
  magenta: 'magenta',
  cyan: 'cyan',
  white: 'white',
  blackBright: 'blackBright',
  redBright: 'redBright',
  greenBright: 'greenBright',
  yellowBright: 'yellowBright',
  blueBright: 'blueBright',
  magentaBright: 'magentaBright',
  cyanBright: 'cyanBright',
  whiteBright: 'whiteBright',
  gray: 'gray',
  grey: 'grey'
};
const COLORS = {
  confirmationText: _chalk.default.green,
  confirmationBackground: _chalk.default.white.bgGreen,
  warningText: _chalk.default.yellow,
  warningBackground: _chalk.default.black.bgYellow,
  errorText: _chalk.default.red,
  errorBackground: _chalk.default.white.bgRed
};
const STATUS_COLORS = {
  not_added: _chalk.default.green,
  // eslint-disable-line camelcase
  created: _chalk.default.green,
  modified: _chalk.default.yellow,
  renamed: _chalk.default.yellow,
  deleted: _chalk.default.red
};
const ICONS = {
  success: _figures.default.tick,
  failure: _figures.default.cross
};
const LANGUAGES = {
  francais: 'fr',
  english: 'en'
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
const HEX_COLOR = /^#[0-f]{6}$/ui;

const basicColorSchema = _joi.Joi.string().valid(...Object.values(BASIC_COLORS));

const colorSchema = _joi.Joi.alternatives().try(basicColorSchema, _joi.Joi.string().pattern(HEX_COLOR, 'hex color'));

const requiredStringSchema = _joi.Joi.string().allow('').required();

const runOptionsSchema = _joi.Joi.object({
  directory: _joi.Joi.string(),
  environment: _joi.Joi.object().pattern(_joi.Joi.string(), _joi.Joi.string())
});

const isHex = text => {
  return text.match(HEX_COLOR);
};

const translate = (self, key) => {
  return DICTIONARY[key][self.theme.language] || '';
};

const cleanUp = (self, text = '') => {
  return (0, _redent.default)(text, self.theme.indent).replace(/\t/ug, '  ');
};

const startTimer = self => {
  (0, _privateRegistry.default)(self).set('timer', Date.now());
};

const stopTimer = self => {
  const start = (0, _privateRegistry.default)(self).get('timer');
  (0, _privateRegistry.default)(self).set('timer', undefined);
  return start ? Date.now() - start : 0;
};
/**
 * Terminal utilities.
 */


class AbsolunetTerminal {
  /**
   * Create a terminal instance.
   */
  constructor() {
    this.setTheme({
      language: this.language.english,
      indent: 2,
      logo: '•',
      textColor: this.basicColor.blue,
      backgroundColor: this.basicColor.blue,
      textOnBackgroundColor: this.basicColor.white,
      borderColor: this.basicColor.blue,
      spinnerColor: this.basicColor.blue,
      spinnerType: this.spinnerType.dots3
    });
  }
  /**
   * Get available languages.
   *
   * @type {Languages}
   */


  get language() {
    return { ...LANGUAGES
    };
  }
  /**
   * Get basic terminal colors (8 colors in normal and bright versions).
   *
   * @type {BasicColors}
   */


  get basicColor() {
    return { ...BASIC_COLORS
    };
  }
  /**
   * Get available spinner types.
   *
   * @type {SpinnerTypes}
   */


  get spinnerType() {
    return { ..._cliSpinners.default
    };
  }
  /**
   * Get the terminal theme.
   *
   * @type {object}
   */


  get theme() {
    return { ...(0, _privateRegistry.default)(this).get('theme')
    };
  }
  /**
   * Set the terminal theme.
   *
   * @param {object} options - Properties.
   * @param {Language} [options.language] - Language to be used in localized outputs.
   * @param {number} [options.indent] - Indentation used.
   * @param {string} [options.logo] - Emoji to be used as logo in TitleBox.
   * @param {BasicColor|HexColor} [options.textColor] - A color to be used in themed text outputs.
   * @param {BasicColor|HexColor} [options.backgroundColor] - A color to be used in themed box outputs.
   * @param {BasicColor|HexColor} [options.textOnBackgroundColor] - A color to be used in themed box outputs.
   * @param {BasicColor|HexColor} [options.borderColor] - A color to be used in themed bordered box outputs.
   * @param {BasicColor} [options.spinnerColor] - A color to be used with themed spinner.
   * @param {SpinnerType} [options.spinnerType] - A spinner look.
   */


  setTheme(options) {
    (0, _joi.validateArgument)('options', options, _joi.Joi.object({
      language: _joi.Joi.string().valid(...Object.values(this.language)),
      indent: _joi.Joi.number().integer().min(0),
      logo: _joi.Joi.string().custom((value, helpers) => {
        return (0, _stringLength.default)(value) === 1 ? value : helpers.message('Must be one character');
      }),
      textColor: colorSchema,
      backgroundColor: colorSchema,
      textOnBackgroundColor: colorSchema,
      borderColor: colorSchema,
      spinnerColor: basicColorSchema,
      spinnerType: _joi.Joi.object({
        frames: _joi.Joi.array().items(_joi.Joi.string()).required(),
        interval: _joi.Joi.number().integer().min(0)
      })
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
   * @returns {AbsolunetTerminal} Current instance.
   */


  echo(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    process.stdout.write(`${text}\n`);
    return this;
  }
  /**
   * Print a text after cleaning and indenting it.
   *
   * @param {string} text - Text to echo.
   * @returns {AbsolunetTerminal} Current instance.
   */


  echoIndent(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.echo(cleanUp(this, text));
  }
  /**
   * Print a string with default color and indentation.
   *
   * @param {string} text - Text to print.
   * @returns {AbsolunetTerminal} Current instance.
   */


  print(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.echo(this.colorizeText(cleanUp(this, text)));
  }
  /**
   * Print one or multiple line breaks.
   *
   * @param {number} [number=1] - Number of line breaks to print.
   * @returns {AbsolunetTerminal} Current instance.
   */


  spacer(number = 1) {
    (0, _joi.validateArgument)('number', number, _joi.Joi.number().integer().min(1));
    return this.print('\n'.repeat(number - 1));
  }
  /**
   * Display a confirmation message.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  confirmation(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.echo(COLORS.confirmationText(cleanUp(this, text)));
  }
  /**
   * Display a warning message.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  warning(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.echo(COLORS.warningText(cleanUp(this, text)));
  }
  /**
   * Display an error message.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  error(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.echo(COLORS.errorText(cleanUp(this, text)));
  }
  /**
   * Display a success message with a check mark icon.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  success(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.confirmation(`${ICONS.success}  ${text}`).spacer();
  }
  /**
   * Display a failure message with an ⨉ mark icon.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  failure(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.error(`${ICONS.failure}  ${text}`).spacer();
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
   * @returns {AbsolunetTerminal} Current instance.
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
    return this.echoIndent(`${_chalk.default.bold(`${options.name}`)}  ${colorize(`${mark}  ${options.value} ${errorMessage}`)}`);
  }
  /**
   * Display the given files status depending if they were not added, created, modified, renamed or deleted, with a Git flavor.
   * The available status are: "not_added", "created", "modified", "renamed" and "deleted".
   *
   * @param {{string: Array<string|{from: string, to: string}>}} status - A {@link https://www.npmjs.com/package/simple-git simple-git} status object.
   * @returns {AbsolunetTerminal} Current instance.
   */


  printGitStatus(status) {
    (0, _joi.validateArgument)('status', status, _joi.Joi.object().pattern(_joi.Joi.string().valid(...Object.keys(STATUS_COLORS)), _joi.Joi.array().items(_joi.Joi.string(), _joi.Joi.object({
      from: _joi.Joi.string(),
      to: _joi.Joi.string()
    }))).required());
    const output = Object.keys(STATUS_COLORS).flatMap(type => {
      if (status[type] && status[type].length !== 0) {
        return status[type].map(file => {
          return `${STATUS_COLORS[type]((0, _terminalPad.default)(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`;
        });
      }

      return [];
    }).join('\n');
    return this.spacer(2).echoIndent(output).spacer(2);
  }
  /**
   * Start the spinner with a given text.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  startSpinner(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    (0, _privateRegistry.default)(this).set('spinner', (0, _ora.default)({
      text,
      spinner: this.theme.spinnerType,
      color: this.theme.spinnerColor
    }).start());
    return this;
  }
  /**
   * Stop the spinner.
   *
   * @returns {AbsolunetTerminal} Current instance.
   */


  stopSpinner() {
    const spinner = (0, _privateRegistry.default)(this).get('spinner');

    if (spinner) {
      spinner.stop();
    }

    (0, _privateRegistry.default)(this).set('spinner', undefined);
    return this;
  }
  /**
   * Display an error message indicating not to use "sudo".
   *
   * @returns {AbsolunetTerminal} Current instance.
   */


  dontSudoMe() {
    return this.errorBox(`${translate(this, 'sudo')} ${_nodeEmoji.default.get('cry')}`);
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
   * @returns {AbsolunetTerminal} Current instance.
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
    const output = lines.map((line, i) => {
      return colorizer((0, _terminalPad.default)(line, padLength) + (extraPadding && i === 2 ? ' ' : ''));
    }).join('\n');
    return this.spacer().echo(output).spacer();
  }
  /**
   * Display a title in a box.
   * The logo will be shown as well.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
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
    return this.box(`
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
   * @returns {AbsolunetTerminal} Current instance.
   */


  infoBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.box(text);
  }
  /**
   * Display a confirmation message box.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  confirmationBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.box(text, {
      colorizer: COLORS.confirmationBackground
    });
  }
  /**
   * Display a warning message box.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  warningBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.box(text, {
      colorizer: COLORS.warningBackground
    });
  }
  /**
   * Display an error message box.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  errorBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.box(text, {
      colorizer: COLORS.errorBackground
    });
  }
  /**
   * Display a completion box by using the timer if wanted and started.
   *
   * @param {boolean} [showDuration=true] - Show amount of time since last TitleBox.
   * @returns {AbsolunetTerminal} Current instance.
   */


  completionBox(showDuration = true) {
    (0, _joi.validateArgument)('showDuration', showDuration, _joi.Joi.boolean());
    const time = showDuration && (0, _privateRegistry.default)(this, 'timer') ? ` ${translate(this, 'after')} ${(0, _prettyMs.default)(stopTimer(this))}` : '';
    return this.infoBox(`${ICONS.success}  ${translate(this, 'completed')}${time}`).spacer(2);
  }
  /**
   * Display a bordered box.
   *
   * @param {string} text - Text to output.
   * @returns {AbsolunetTerminal} Current instance.
   */


  borderedBox(text) {
    (0, _joi.validateArgument)('text', text, requiredStringSchema);
    return this.echo((0, _boxen.default)(this.colorizeText(text), {
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
								`).exit();
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
    this.echo(this.runAndReadLines(command, options).join('\n'));
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