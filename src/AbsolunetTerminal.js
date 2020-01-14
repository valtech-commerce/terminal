//--------------------------------------------------------
//-- AbsolunetTerminal
//--------------------------------------------------------
import boxen                     from 'boxen';
import camelCase                 from 'camelcase';
import chalk                     from 'chalk';
import { execSync, exec }        from 'child_process';
import figures                   from 'figures';
import emoji                     from 'node-emoji';
import ora                       from 'ora';
import prettyMs                  from 'pretty-ms';
import redent                    from 'redent';
import stringLength              from 'string-length';
import stringWidth               from 'string-width';
import { Joi, validateArgument } from '@absolunet/joi';
import __                        from '@absolunet/private-registry';
import pad                       from '@absolunet/terminal-pad';



const HEX_COLOR = /^#[0-f]{6}$/ui;

const isHex = (text) => {
	return text.match(HEX_COLOR);
};

const chalkColorSchema = Joi.string().custom((value, helpers) => {
	return chalk[value] ? value : helpers.message('Must be a Chalk keyword');
});

const colorSchema = Joi.alternatives().try(
	Joi.string().pattern(HEX_COLOR, 'hex color'),
	chalkColorSchema
);



const ICONS = {
	success: figures.tick,
	failure: figures.cross
};

const COLORS = {
	confirmationText:       chalk.green,
	confirmationBackground: chalk.white.bgGreen,
	warningText:            chalk.yellow,
	warningBackground:      chalk.black.bgYellow,
	errorText:              chalk.red,
	errorBackground:        chalk.white.bgRed
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
	return redent(text, self.theme.indent).replace(/\t/ug, '  ');
};

const requiredStringSchema = Joi.string().allow('').required();



const startTimer = (self) => {
	__(self).set('timer', new Date());
};

const stopTimer = (self) => {
	const start = __(self).get('timer');
	__(self).set('timer', undefined);

	return start ? Date.now() - start : 0;
};



const runOptionsSchema = Joi.object({
	directory:   Joi.string(),
	environment: Joi.object().pattern(Joi.string(), Joi.string())
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
			language:              'en',
			indent:                2,
			logo:                  '•',
			textColor:             'blue',
			backgroundColor:       'blue',
			textOnBackgroundColor: 'white',
			borderColor:           'blue',
			spinnerColor:          'blue',
			spinnerType:           'dots3'
		});
	}


	/**
	 * Get the terminal theme.
	 *
	 * @returns {object} Theme values.
	 */
	get theme() {
		return __(this).get('theme');
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
		validateArgument('options', options, Joi.object({
			language:              Joi.string().valid('fr', 'en'),
			indent:                Joi.number().integer().min(0),
			logo:                  Joi.string().custom((value, helpers) => { return stringLength(value) === 1 ? value : helpers.message('Must be one character'); }),
			textColor:             colorSchema,
			backgroundColor:       colorSchema,
			textOnBackgroundColor: colorSchema,
			borderColor:           colorSchema,
			spinnerColor:          chalkColorSchema,
			spinnerType:           Joi.alternatives().try(
				Joi.string(),
				Joi.object({
					frames:   Joi.array().items(Joi.string()).required(),
					interval: Joi.number().integer().min(0)
				})
			)
		}).required());

		__(this).set('theme', { ...this.theme, ...options });
	}


	/**
	 * Colorize the string text following theme.
	 *
	 * @param {string} text - Text to colorize.
	 * @returns {string} Colorized text.
	 */
	colorizeText(text) {
		validateArgument('text', text, requiredStringSchema);

		const colorize = isHex(this.theme.textColor) ? chalk.hex(this.theme.textColor) : chalk[this.theme.textColor];

		return colorize(text);
	}


	/**
	 * Colorize the string text and background following theme.
	 *
	 * @param {string} text - Text to colorize.
	 * @returns {string} Colorized text.
	 */
	colorizeBackground(text) {
		validateArgument('text', text, requiredStringSchema);

		const color      = isHex(this.theme.textOnBackgroundColor) ? chalk.hex(this.theme.textOnBackgroundColor) : chalk[this.theme.textOnBackgroundColor];
		const background = isHex(this.theme.backgroundColor)       ? chalk.bgHex(this.theme.backgroundColor)     : chalk[camelCase(['bg', this.theme.backgroundColor])];

		return color(background(text));
	}






	/**
	 * Print a text in the terminal.
	 *
	 * @param {string} text - Text to output.
	 */
	echo(text) {
		validateArgument('text', text, requiredStringSchema);

		console.log(text); // eslint-disable-line no-console
	}


	/**
	 * Print a text after cleaning and indenting it.
	 *
	 * @param {string} text - Text to echo.
	 */
	echoIndent(text) {
		validateArgument('text', text, requiredStringSchema);

		this.echo(cleanUp(this, text));
	}


	/**
	 * Print a string with default color and indentation.
	 *
	 * @param {string} text - Text to print.
	 */
	print(text) {
		validateArgument('text', text, requiredStringSchema);

		this.echo(this.colorizeText(cleanUp(this, text)));
	}


	/**
	 * Print a string with default color, indentation and new line at the end.
	 *
	 * @param {string} text - Text to print.
	 */
	println(text) {
		validateArgument('text', text, requiredStringSchema);

		this.print(text);
		this.spacer();
	}


	/**
	 * Print one or multiple line breaks.
	 *
	 * @param {number} [number=1] - Number of line breaks to print.
	 */
	spacer(number = 1) {
		validateArgument('number', number, Joi.number().integer().min(1));

		this.print('\n'.repeat(number - 1));
	}


	/**
	 * Display a confirmation message.
	 *
	 * @param {string} text - Text to output.
	 * @param {boolean} [newline=false] - Add a newline.
	 */
	confirmation(text, newline = false) {
		validateArgument('text',    text,    requiredStringSchema);
		validateArgument('newline', newline, Joi.boolean());

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
		validateArgument('text',    text,    requiredStringSchema);
		validateArgument('newline', newline, Joi.boolean());

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
		validateArgument('text', text, requiredStringSchema);
		validateArgument('newline', newline, Joi.boolean());

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
		validateArgument('text', text, requiredStringSchema);
		validateArgument('newline', newline, Joi.boolean());

		this.confirmation(`${ICONS.success}  ${text}`, newline);
	}


	/**
	 * Display a failure message with an ⨉ mark icon.
	 *
	 * @param {string} text - Text to output.
	 * @param {boolean} [newline=true] - Add a newline.
	 */
	failure(text, newline = true) {
		validateArgument('text', text, requiredStringSchema);
		validateArgument('newline', newline, Joi.boolean());

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
		validateArgument('options', options, Joi.object({
			state:   Joi.boolean().required(),
			name:    Joi.string().required(),
			value:   Joi.string().required(),
			message: Joi.string()
		}).required());

		const mark         = ICONS[options.state ? 'success' : 'failure'];
		const colorize     = COLORS[`${options.state ? 'confirmation' : 'error'}Text`];
		const errorMessage = options.state ? '' : options.message;

		this.echoIndent(`${chalk.bold(`${options.name}`)}  ${colorize(`${mark}  ${options.value} ${errorMessage}`)}`);
	}


	/**
	 * Display the given files status depending if they were not added, created, modified, renamed or deleted, with a Git flavor.
	 * The available status are: "not_added", "created", "modified", "renamed" and "deleted".
	 *
	 * @param {{string: Array<string|{from: string, to: string}>}} status - A {@link https://www.npmjs.com/package/simple-git simple-git} status object.
	 */
	printStatus(status) {
		validateArgument('status', status, Joi.object().pattern(
			Joi.string().valid('not_added', 'created', 'modified', 'renamed', 'deleted'),
			Joi.alternatives().try(
				Joi.string(),
				Joi.object({
					from: Joi.string(),
					to:   Joi.string()
				})
			)
		).required());

		const colorize = {
			not_added: COLORS.confirmationText, // eslint-disable-line camelcase
			created:   COLORS.confirmationText,
			modified:  COLORS.warningText,
			renamed:   COLORS.warningText,
			deleted:   COLORS.errorText
		};

		this.spacer(2);

		Object.keys(colorize).forEach((type) => {
			if (status[type].length !== 0) {
				status[type].forEach((file) => {
					this.echoIndent(`${colorize[type](pad(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`);
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
		validateArgument('text', text, requiredStringSchema);

		const { spinnerType: spinner, spinnerColor: color } = this.theme;

		__(this).set('spinner', ora({ text, spinner, color }).start());
	}


	/**
	 * Stop the spinner.
	 */
	stopSpinner() {
		const spinner = __(this).get('spinner');

		if (spinner) {
			spinner.stop();
		}

		__(this).set('spinner', undefined);
	}


	/**
	 * Display an error message indicating not to use "sudo".
	 */
	dontSudoMe() {
		this.errorBox(`${translate(this, 'sudo')} ${emoji.get('cry')}`);
	}


	/**
	 * Exit the process and show an optional exit message in an error box.
	 *
	 * @param {string} [message] - ErrorBox message to display.
	 */
	exit(message) {
		validateArgument('message', message, Joi.string());

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
	box(text, { colorizer = this.colorizeBackground.bind(this), padding = true, extraPadding = false } = {}) {
		validateArgument('text',                 text,         requiredStringSchema);
		validateArgument('options.colorizer',    colorizer,    Joi.function());
		validateArgument('options.padding',      padding,      Joi.boolean());
		validateArgument('options.extraPadding', extraPadding, Joi.boolean());

		let content = cleanUp(this, text).replace(/^\n+/ug, '').replace(/\n+\s*$/ug, '');
		content     = padding ? `\n${content}\n` : content;

		const lines     = content.split('\n');
		const max       = Math.max(...lines.map((line) => { return stringWidth(line); }));
		const padLength = max < 79 ? 80 : max + 2;

		this.spacer();
		lines.forEach((line, i) => {
			this.echo(colorizer(pad(line, padLength) + (extraPadding && i === 2 ? ' ' : '')));
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
		validateArgument('text', text, requiredStringSchema);

		startTimer(this);

		const { logo }   = this.theme;
		const { length } = logo;
		const extraPadding = length === stringWidth(logo) && length === stringLength(logo);

		this.box(`
			${chalk.reset('        ')}${this.colorizeBackground(' ')}
			${chalk.reset(`   ${logo}${extraPadding ? ' ' : ''}   `)}${this.colorizeBackground(' ')} ${text}
			${chalk.reset('        ')}${this.colorizeBackground(' ')}
		`, { padding: true, extraPadding: extraPadding && length === 2 });
	}


	/**
	 * Display an informative message box.
	 *
	 * @param {string} text - Text to output.
	 */
	infoBox(text) {
		validateArgument('text', text, requiredStringSchema);

		this.box(text);
	}


	/**
	 * Display a confirmation message box.
	 *
	 * @param {string} text - Text to output.
	 */
	confirmationBox(text) {
		validateArgument('text', text, requiredStringSchema);

		this.box(text, { colorizer: COLORS.confirmationBackground });
	}


	/**
	 * Display a warning message box.
	 *
	 * @param {string} text - Text to output.
	 */
	warningBox(text) {
		validateArgument('text', text, requiredStringSchema);

		this.box(text, { colorizer: COLORS.warningBackground });
	}


	/**
	 * Display an error message box.
	 *
	 * @param {string} text - Text to output.
	 */
	errorBox(text) {
		validateArgument('text', text, requiredStringSchema);

		this.box(text, { colorizer: COLORS.errorBackground });
	}


	/**
	 * Display a completion box by using the timer if wanted and started.
	 *
	 * @param {boolean} [showDuration=true] - Show amount of time since last TitleBox.
	 */
	completionBox(showDuration = true) {
		validateArgument('showDuration', showDuration, Joi.boolean());

		const time = showDuration && __(this, 'timer') ? ` ${translate(this, 'after')} ${prettyMs(stopTimer(this))}` : '';
		this.infoBox(`${ICONS.success}  ${translate(this, 'completed')}${time}`);

		this.spacer(2);
	}


	/**
	 * Display a bordered box.
	 *
	 * @param {string} text - Text to output.
	 */
	borderedBox(text) {
		validateArgument('text', text, requiredStringSchema);

		this.echo(boxen(this.colorizeText(text), {
			padding:     1,
			margin:      1,
			align:       'center',
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
		validateArgument('options', options, runOptionsSchema);

		const { directory } = options;
		const environment   = options.environment || {};

		return { cwd: directory, env: { ...process.env, ...environment } };  // eslint-disable-line unicorn/prevent-abbreviations, no-process-env
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
		validateArgument('command', command, Joi.string().required());
		validateArgument('options', options, runOptionsSchema);

		execSync(command, { stdio: 'inherit', ...this.processRunOptions(options) });
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
	runPromise(command, { directory, environment,	ignoreError = '', silent = false } = {}) {
		validateArgument('command',             command,     Joi.string().required());
		validateArgument('options.directory',   directory,   Joi.string());
		validateArgument('options.environment', environment, Joi.object().pattern(Joi.string(), Joi.string()));
		validateArgument('options.ignoreError', ignoreError, Joi.string().allow(''));
		validateArgument('options.silent',      silent,      Joi.boolean());

		return new Promise((resolve) => {
			exec(command, { stdio: 'inherit', ...this.processRunOptions({ directory, environment }) }, (error, stdout, stderr) => {
				const output     = stdout.trim();
				let errorOutput  = stderr.trim();
				let errorMessage = (error || '').toString().trim();

				if (ignoreError) {
					errorMessage = errorMessage.replace(ignoreError, '').trim();
					errorOutput  = stderr.replace(ignoreError, '').trim();
				}

				// Error
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

				resolve({ error, stdout, stderr });
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
		validateArgument('command', command, Joi.string().required());
		validateArgument('options', options, runOptionsSchema);

		return execSync(command, { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8', ...this.processRunOptions(options) });
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
		validateArgument('command', command, Joi.string().required());
		validateArgument('options', options, runOptionsSchema);

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
		validateArgument('command', command, Joi.string().required());
		validateArgument('options', options, runOptionsSchema);

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
		validateArgument('command', command, Joi.string().required());
		validateArgument('options', options, runOptionsSchema);

		this.runAndReadLines(command, options).forEach((line) => {
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
		validateArgument('title',   title,   Joi.string().required());
		validateArgument('command', command, Joi.string().required());
		validateArgument('options', options, runOptionsSchema);

		this.titleBox(title);
		this.run(command, options);
		this.completionBox();
	}

}


export default AbsolunetTerminal;
