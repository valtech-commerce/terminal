//--------------------------------------------------------
//-- Terminal utilities
//--------------------------------------------------------
'use strict';

const boxen              = require('boxen');
const chalk              = require('chalk');
const { execSync, exec } = require('child_process');
const spawn              = require('cross-spawn');
const figures            = require('figures');
const emoji              = require('node-emoji');
const ora                = require('ora');
const prettyMs           = require('pretty-ms');
const redent             = require('redent');
const stringLength       = require('string-length');
const stringWidth        = require('string-width');
const pad                = require('@absolunet/terminal-pad');


//-- Static properties
const __ = {
	indent:       2,
	lang:         'en',
	logo:         '•',
	textColor:    chalk.blue,
	bgColor:      chalk.white.bgBlue,
	borderColor:  'blue',
	spinnerColor: 'blue',
	spinnerType:  'dots3',
	scripts:      {
		path:   '.',
		titles: {}
	}
};

const ICONS = {
	success: figures.tick,
	failure: figures.cross
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







class Terminal {

	/**
	 * {@link https://www.npmjs.com/package/chalk Chalk} instance.
	 *
	 * @type {Chalk}
	 */
	get chalk() {
		return chalk;
	}

	/**
	 * Default values.
	 *
	 * @type {{bgColor: Chalk, indent: number, spinnerType: string, logo: string, lang: string, scripts: {path: string, titles: {}}, textColor: Chalk, borderColor: string, spinnerColor: string}}
	 */
	get defaults() {
		const { ...defaults } = __;
		delete defaults.scripts;
		delete defaults.timer;

		return defaults;
	}

	/**
	 * Scripts path and titles.
	 *
	 * @type {{path: string, titles: {[string]: string}}}
	 */
	get scripts() {
		return { ...__.scripts };
	}






	/**
	 * Set the default terminal properties.
	 *
	 * @param {object} properties - Properties
	 * @param {number} [properties.indent=2] - Indentation used.
	 * @param {string} [properties.logo="?"] - Emoji to be used as logo in TitleBox.
	 * @param {Chalk}  [properties.textColor=this.chalk.blue] - {@link https://www.npmjs.com/package/chalk Chalk definition} to be used in project colored outputs.
	 * @param {Chalk}  [properties.bgColor=this.chalk.white.bgBlue] - {@link https://www.npmjs.com/package/chalk Chalk definition} to be used in project colored outputs.
	 * @param {string} [properties.borderColor="blue"] - {@link https://www.npmjs.com/package/chalk Color} to be used in project colored outputs.
	 * @param {string} [properties.spinnerColor="blue"] - {@link https://www.npmjs.com/package/chalk Color} to be used with spinner.
	 * @param {string} [properties.lang="en"] - Language to be used in localized outputs (fr|en)
	 * @param {string} [properties.spinnerType="dots3"] - {@link https://www.npmjs.com/package/cli-spinners Spinner} theme
	 * @returns {Terminal} - Terminal instance.
	 */
	setDefaults({ indent = 2, logo = '?', textColor = this.chalk.blue, bgColor = this.chalk.white.bgBlue, spinnerColor = 'blue', borderColor = 'blue', lang = 'en', spinnerType = 'dots3' }) {
		__.indent       = indent;
		__.logo         = logo;
		__.textColor    = textColor;
		__.bgColor      = bgColor;
		__.borderColor  = borderColor;
		__.spinnerColor = spinnerColor;
		__.lang         = lang;
		__.spinnerType  = spinnerType;

		return this;
	}

	/**
	 * Set the default terminal properties.
	 *
	 * @see this.setDefaults()
	 * @deprecated
	 *
	 * @param {object} properties - Properties
	 * @returns {Terminal} - Terminal instance.
	 */
	setDefault(properties) {
		return this.setDefaults(properties);
	}

	/**
	 * Set the default output language.
	 *
	 * @param {string} lang - Language (fr|en)
	 * @returns {Terminal} - Terminal instance.
	 */
	setLang(lang) {
		__.lang = lang;

		return this;
	}

	/**
	 * Set executable script files root path and associate the file names with a human title.
	 *
	 * @param {string} path - Path to scripts files.
	 * @param {{[string]: string}} titles - Matching object of script filename to title to be use via `runScript`.
	 * @returns {Terminal} - Terminal instance.
	 */
	setScriptsFiles(path, titles) {
		__.scripts.path   = path;
		__.scripts.titles = titles;

		return this;
	}

	/**
	 * Exit the process and show an optional exit message in an error box.
	 *
	 * @param {string} [text] - ErrorBox message to display.
	 */
	exit(text) {
		if (text) {
			this.errorBox(text);
		}

		process.exit(2); // eslint-disable-line no-process-exit, unicorn/no-process-exit
	}

	/**
	 * Clean up the string content and adjust intent.
	 *
	 * @param {string} text - Text to clean.
	 * @returns {string} - Cleaned text
	 */
	cleanUp(text = '') {
		return redent(text, this.defaults.indent).replace(/\t/ug, '  ');
	}

	/**
	 * Translate the given key in current language.
	 *
	 * @param {string} key - Translation key.
	 * @param {string} [lang=this.defaults.lang] - Language (fr|en).
	 * @returns {string} - Translated text.
	 */
	trans(key, lang = this.defaults.lang) {
		return DICTIONARY[key][lang] || '';
	}

	/**
	 * Add translations in the translation dictionary.
	 *
	 * @param {string} key - Translation key.
	 * @param {{[string]: string}} values - Translations for each language.
	 * @returns {Terminal} - Terminal instance.
	 */
	addTrans(key, values) {
		DICTIONARY[key] = values;

		return this;
	}

	/**
	 * Output a text in the terminal.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	echo(text) {
		console.log(text); // eslint-disable-line no-console

		return this;
	}

	/**
	 * Echo a text after cleaning and indenting it.
	 *
	 * @param {string} text - Text to echo.
	 * @returns {Terminal} - Terminal instance.
	 */
	echoIndent(text) {
		return this.echo(this.cleanUp(text));
	}

	/**
	 * Print a string with default color and indentation.
	 *
	 * @param {string} text - Text to print.
	 * @returns {Terminal} - Terminal instance.
	 */
	print(text) {
		return this.echo(this.defaults.textColor(this.cleanUp(text)));
	}

	/**
	 * Print a string with default color, indentation and new line at the end.
	 *
	 * @param {string} text - Text to print.
	 * @returns {Terminal} - Terminal instance.
	 */
	println(text) {
		return this.print(`${text}\n`);
	}

	/**
	 * Print one or multiple line breaks.
	 *
	 * @param {number} [number=1] - Number of line breaks to print.
	 * @returns {Terminal} - Terminal instance.
	 */
	spacer(number = 1) {
		return this.print('\n'.repeat(number - 1));
	}

	/**
	 * Display a warning message.
	 *
	 * @param {string} text - Text to output.
	 * @param {boolean} [newline=true] - Add a newline.
	 * @returns {Terminal} - Terminal instance.
	 */
	warning(text, newline = true) {
		return this.echo(this.chalk.yellow(this.cleanUp(`${text}${newline ? '\n' : ''}`)));
	}

	/**
	 * Display an error message.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	error(text) {
		return this.echo(this.chalk.red(this.cleanUp(`\n${text}\n`)));
	}

	/**
	 * Display a success message with a check mark icon.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	success(text) {
		return this.echo(this.chalk.green(this.cleanUp(`${ICONS.success}  ${text}\n`)));
	}

	/**
	 * Display a failure message with an ⨉ mark icon.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	failure(text) {
		return this.echo(this.chalk.red(this.cleanUp(`${ICONS.failure}  ${text}\n`)));
	}

	/**
	 * Display an error message indicating not to use "sudo".
	 *
	 * @returns {Terminal} - Terminal instance.
	 */
	dontSudoMe() {
		return this.errorBox(`${this.trans('sudo')} ${emoji.get('cry')}`);
	}

	/**
	 * Print the given state.
	 * If the state is falsy, the given message will be display.
	 *
	 * @param {object}  options - Options.
	 * @param {boolean} options.state - If a success or a failure.
	 * @param {string}  options.name - Name of the property.
	 * @param {string}  options.value - Value of the property.
	 * @param {string}  [options.msg] - Detailled error message in case of failure.
	 * @returns {Terminal} - Terminal instance.
	 */
	printState({ state, name, value, msg }) {
		const mark         = ICONS[state ? 'success' : 'failure'];
		const color        = this.chalk[state ? 'green' : 'red'];
		const errorMessage = state ? '' : msg;

		return this.echoIndent(`${this.chalk.bold(`${name}`)}  ${color(`${mark}  ${value} ${errorMessage}`)}`);
	}

	/**
	 * Print the given files status depending if they were not added, created, modified, renamed or deleted, with a Git flavor.
	 * The available status are: "not_added", "created", "modified", "renamed" and "deleted".
	 *
	 * @param {{[string]: string[]|{from: string, to: string}[] }} status - A {@link https://www.npmjs.com/package/simple-git simple-git} status object.
	 * @returns {Terminal} - Terminal instance.
	 */
	printStatus(status) {
		const colors = {
			not_added: 'green', // eslint-disable-line camelcase
			created:   'green',
			modified:  'yellow',
			renamed:   'yellow',
			deleted:   'red'
		};

		this.spacer(2);

		['not_added', 'created', 'modified', 'renamed', 'deleted'].forEach((type) => {
			if (status[type].length !== 0) {
				status[type].forEach((file) => {
					this.echoIndent(`${this.chalk[colors[type]](pad(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`);
				});
			}
		});

		this.spacer(2);

		return this;
	}

	/**
	 * Print a text in a box.
	 *
	 * @param {string} text - Text to output.
	 * @param {Chalk} [style] - {@link https://www.npmjs.com/package/chalk Chalk definition}.
	 * @param {boolean} [padding=true] - Add vertical padding.
	 * @param {boolean} [extraPadding=false] - Needs extra padding.
	 * @returns {Terminal} - Terminal instance.
	 */
	box(text, style = this.defaults.bgColor, padding = true, extraPadding = false) {
		let content = this.cleanUp(text).replace(/^\n+/ug, '').replace(/\n+\s*$/ug, '');
		content     = padding ? `\n${content}\n` : content;

		const lines     = content.split('\n');
		const max       = Math.max(...lines.map((line) => { return stringWidth(line); }));
		const padLength = max < 79 ? 80 : max + 2;

		this.spacer();
		lines.forEach((line, i) => {
			this.echo(style(pad(line, padLength) + (extraPadding && i === 2 ? ' ' : '')));
		});
		this.spacer();

		return this;
	}

	/**
	 * Start timer.
	 *
	 * @returns {Terminal} - Terminal instance.
	 */
	startTimer() {
		__.timer = new Date();

		return this;
	}

	/**
	 * Check if the timer was started.
	 *
	 * @returns {boolean}
	 */
	isTimerStarted() {
		return Boolean(__.timer);
	}

	/**
	 * Stop timer and retrieve the time elapsed between the call and the last startTimer() call.
	 *
	 * @returns {number} - Number of milliseconds.
	 */
	stopTimer() {
		const { timer } = __;
		__.timer = undefined;

		return timer ? Date.now() - timer : 0;
	}

	/**
	 * Print a title in a box.
	 * The logo will be shown as well.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	titleBox(text) {
		this.startTimer();

		const { logo, bgColor } = this.defaults;
		const { length } = logo;
		const extraPadding = length === stringWidth(logo) && length === stringLength(logo);

		return this.box(`
			${this.chalk.reset('        ')}${bgColor(' ')}
			${this.chalk.reset(`   ${logo}${extraPadding ? ' ' : ''}   `)}${bgColor(' ')} ${text}
			${this.chalk.reset('        ')}${bgColor(' ')}
		`, bgColor, true, extraPadding && length === 2);
	}

	/**
	 * Display an informative message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	infoBox(text) {
		return this.box(text, this.defaults.bgColor);
	}

	/**
	 * Display a warning message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	warningBox(text) {
		return this.box(text, this.chalk.bgYellow.black);
	}

	/**
	 * Display an error message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	errorBox(text) {
		return this.box(text, this.chalk.bgRed.white);
	}

	/**
	 * Display a completion box by using the timer if wanted and started.
	 *
	 * @param {boolean} [showDuration=true] - Show amount of time since last TitleBox
	 * @returns {Terminal} - Terminal instance.
	 */
	completionBox(showDuration = true) {
		const time = showDuration && __.timer ? ` ${this.trans('after')} ${prettyMs(this.stopTimer())}` : '';

		this.box(`${ICONS.success}  ${this.trans('completed')}${time}`, this.defaults.bgColor);

		this.spacer(2);

		return this;
	}

	/**
	 * Display a bordered box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {Terminal} - Terminal instance.
	 */
	borderedBox(text) {
		this.echo(boxen(this.defaults.textColor(text), {
			padding:     1,
			margin:      1,
			align:       'center',
			borderColor: this.defaults.borderColor
		}));

		return this;
	}

	/**
	 * Start a spinner with a given text.
	 *
	 * @param text - Text to output.
	 * @returns {ora.Ora} - {@link https://www.npmjs.com/package/ora ora spinner} object
	 */
	startSpinner(text) {
		const { spinnerType: spinner, spinnerColor: color } = this.defaults;

		return ora({ text, spinner, color }).start();
	}

	/**
	 * Run a command in sync mode.
	 *
	 * @param {string} command - Command to run.
	 * @returns {Terminal} - Terminal instance.
	 */
	run(command) {
		execSync(command, { stdio: 'inherit' });

		return this;
	}

	/**
	 * Run a command in async mode.
	 *
	 * @param {string} command - Command to run.
	 * @param {object} [options={}] - Options
	 * @param {string} [options.ignoreError=''] - Error message string to ignore.
	 * @param {boolean} [options.silent=false] - Silence all errors.
	 * @returns {Promise<{error: string, stdout: string, stderr: string}>} - Terminal outputs
	 */
	runPromise(command, { ignoreError = '', silent = false } = {}) {
		return new Promise((resolve) => {
			exec(command, { stdio: 'inherit' }, (error, stdout, stderr) => {
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
								this.error(this.trans('silentError'));
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
	 * @returns {string} - Output.
	 */
	runAndRead(command) {
		return execSync(command, { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' });
	}

	/**
	 * Run a command in sync mode and get its output line by line, by excluding empty lines.
	 *
	 * @param {string} command - Command to run.
	 * @returns {string[]} - Output.
	 */
	runAndReadLines(command) {
		return this.runAndRead(command).split('\n').filter(Boolean);
	}

	/**
	 * Run a command in sync mode and get its output separated by a slash.
	 *
	 * @param {string} command - Command to run.
	 * @returns {string} - Output.
	 */
	runAndGet(command) {
		return this.runAndReadLines(command).join(' / ');
	}

	/**
	 * Run a command in sync mode and echo its output.
	 *
	 * @param {string} command - Command to run.
	 * @returns {Terminal} - Terminal instance.
	 */
	runAndEcho(command) {
		this.runAndReadLines(command).forEach((line) => {
			this.echo(line);
		});

		return this;
	}

	/**
	 * Print the task to be executed, run the command in sync mode and display a completion box.
	 *
	 * @param {string} title - Title explaining the command.
	 * @param {string} command - Command to run.
	 * @returns {Terminal} - Terminal instance.
	 */
	runTask(title, command) {
		this.titleBox(title);
		this.run(command);
		this.completionBox();

		return this;
	}

	/**
	 * Print the script file title to be run, run shell script file in sync mode from configured scripts path and
	 * given file with given parameters and display a completion box.
	 *
	 * @param {string} file - Script filename under path defined via setScriptsFiles.
	 * @param {...string[]} [options] - Arguments to pass to the script.
	 * @returns {Terminal} - Terminal instance.
	 */
	runScript(file, ...options) {
		this.titleBox(`${this.scripts.titles[file]}  ${this.chalk.underline(file)}`);
		spawn.sync('bash', [`${this.scripts.path}/${file}.sh`].concat(options), { stdio: 'inherit' });
		this.completionBox();

		return this;
	}

}



let instance;

// eslint-disable-next-line accessor-pairs
module.exports = {

	Terminal: Terminal,

	get terminal() {
		if (!instance) {
			instance = new Terminal();
		}

		return instance;
	}

};
