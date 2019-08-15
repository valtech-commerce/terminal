//--------------------------------------------------------
//-- Terminal utilities
//--------------------------------------------------------
'use strict';

const chalk                         = require('chalk');
const { spawnSync, execSync, exec } = require('child_process');
const emoji                         = require('node-emoji');
const ora                           = require('ora');
const prettyMs                      = require('pretty-ms');
const redent                        = require('redent');
const stringLength                  = require('string-length');
const stringWidth                   = require('string-width');
const pad                           = require('@absolunet/terminal-pad');


//-- Static properties
const __ = {
	indent:       2,
	lang:         'en',
	logo:         '•',
	textColor:    chalk.blue,
	bgColor:      chalk.white.bgBlue,
	spinnerColor: 'blue',
	spinnerType:  'dots3',
	scripts:      {
		path:   '.',
		titles: {}
	}
};

const ICONS = {
	success: '✓',
	failure: '✘'
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
	 * Chalk instance.
	 *
	 * @type {Chalk}
	 */
	get chalk() {
		return chalk;
	}

	/**
	 * Set the default terminal properties.
	 *
	 * @param {object} properties
	 * @param {number} [properties.indent=2]
	 * @param {string} [properties.logo="?"]
	 * @param {Chalk}  [properties.textColor=this.chalk.blue]
	 * @param {Chalk}  [properties.bgColor=this.chalk.white.bgBlue]
	 * @param {string} [properties.spinnerColor="blue"]
	 * @param {string} [properties.lang="en"]
	 * @param {string} [properties.spinnerType="dots3"]
	 * @returns {Terminal}
	 */
	setDefaults({ indent = 2, logo = '?', textColor = this.chalk.blue, bgColor = this.chalk.white.bgBlue, spinnerColor = 'blue', lang = 'en', spinnerType = 'dots3' }) {
		__.indent       = indent;
		__.logo         = logo;
		__.textColor    = textColor;
		__.bgColor      = bgColor;
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
	 * @param {object} properties
	 * @returns {Terminal}
	 */
	setDefault(properties) {
		return this.setDefaults(properties);
	}

	/**
	 * Set the default output language.
	 *
	 * @param {string} lang
	 * @returns {Terminal}
	 */
	setLang(lang) {
		__.lang = lang;

		return this;
	}

	/**
	 * Set executable script files root path and associate the file names with a human title.
	 *
	 * @param {string} path
	 * @param {{[string]: string}} titles
	 * @returns {Terminal}
	 */
	setScriptsFiles(path, titles) {
		__.scripts.path   = path;
		__.scripts.titles = titles;

		return this;
	}

	/**
	 * Exit the process and show an optional exit message in an error box.
	 *
	 * @param {string} [text]
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
	 * @param {string} text
	 * @returns {string}
	 */
	cleanUp(text = '') {
		return redent(text, this.defaults.indent).replace(/\t/ug, '  ');
	}

	/**
	 * Translate the given key in current language.
	 *
	 * @param {string} key
	 * @param {string} [lang=this.defaults.lang]
	 * @returns {string}
	 */
	trans(key, lang = this.defaults.lang) {
		return DICTIONARY[key][lang] || '';
	}

	/**
	 * Add translations in the translation dictionary.
	 *
	 * @param {string} key
	 * @param {{[string]: string}} values
	 * @returns {Terminal}
	 */
	addTrans(key, values) {
		DICTIONARY[key] = values;

		return this;
	}

	/**
	 * Output a string in the terminal.
	 *
	 * @param {string} string
	 * @returns {Terminal}
	 */
	echo(string) {
		console.log(string); // eslint-disable-line no-console

		return this;
	}

	/**
	 * Echo a string after cleaning and indenting it.
	 *
	 * @param {string} string
	 * @returns {Terminal}
	 */
	echoIndent(string) {
		return this.echo(this.cleanUp(string));
	}

	/**
	 * Print a string with default color and indentation.
	 *
	 * @param {string} string
	 * @returns {Terminal}
	 */
	print(string) {
		return this.echo(this.defaults.textColor(this.cleanUp(string)));
	}

	/**
	 * Print a string with new line at the end.
	 *
	 * @param {string} string
	 * @returns {Terminal}
	 */
	println(string) {
		return this.print(`${string}\n`);
	}

	/**
	 * Print one or multiple line breaks.
	 *
	 * @param {number} [number=1]
	 * @returns {Terminal}
	 */
	spacer(number = 1) {
		return this.print('\n'.repeat(number - 1));
	}

	/**
	 * Display a warning message.
	 *
	 * @param {string} text
	 * @param {boolean} [newline=true]
	 * @returns {Terminal}
	 */
	warning(text, newline = true) {
		return this.echo(this.chalk.yellow(this.cleanUp(`${text}${newline ? '\n' : ''}`)));
	}

	/**
	 * Display an error message.
	 *
	 * @param {string} text
	 * @returns {Terminal}
	 */
	error(text) {
		return this.echo(this.chalk.red(this.cleanUp(`\n${text}\n`)));
	}

	/**
	 * Display a success message with a check mark icon.
	 *
	 * @param {string} string
	 * @returns {Terminal}
	 */
	success(string) {
		return this.echo(this.chalk.green(this.cleanUp(`${ICONS.success}  ${string}\n`)));
	}

	/**
	 * Display a failure message with an X mark icon.
	 *
	 * @param {string} string
	 * @returns {Terminal}
	 */
	failure(string) {
		return this.echo(this.chalk.red(this.cleanUp(`${ICONS.failure}  ${string}\n`)));
	}

	/**
	 * Display an error message indicating not to use "sudo".
	 *
	 * @returns {Terminal}
	 */
	dontSudoMe() {
		return this.errorBox(`${this.trans('sudo')} ${emoji.get('cry')}`);
	}

	/**
	 * Print the given state.
	 * If the state is falsy, the given message will be display.
	 *
	 * @param {object}  options
	 * @param {boolean} options.state
	 * @param {string}  options.name
	 * @param {string}  options.value
	 * @param {string}  options.msg
	 * @returns {Terminal}
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
	 * @param {{[string]: string[]|{from: string, to: string}[] }}status
	 * @returns {Terminal}
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
	 * @param {string}  text
	 * @param {Chalk}   style
	 * @param {boolean} [padding=true]
	 * @param {boolean} [extraPadding=false]
	 * @returns {Terminal}
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
	 * @returns {Terminal}
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
	 * Stop title box and retrieve the time elapsed between the call and the last startTimer() call.
	 *
	 * @returns {number}
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
	 * @param {string} text
	 * @returns {Terminal}
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
	 * @param {string} text
	 * @returns {Terminal}
	 */
	infoBox(text) {
		return this.box(text, this.defaults.bgColor);
	}

	/**
	 * Display a warning message box.
	 *
	 * @param {string} text
	 * @returns {Terminal}
	 */
	warningBox(text) {
		return this.box(text, this.chalk.bgYellow.black);
	}

	/**
	 * Display an error message box.
	 *
	 * @param {string} text
	 * @returns {Terminal}
	 */
	errorBox(text) {
		return this.box(text, this.chalk.bgRed.white);
	}

	/**
	 * Display a completion box by using the timer if wanted and started.
	 *
	 * @param {boolean} [showDuration=true]
	 * @returns {Terminal}
	 */
	completionBox(showDuration = true) {
		const time = showDuration && __.timer ? ` ${this.trans('after')} ${prettyMs(this.stopTimer())}` : '';

		this.box(`${ICONS.success}  ${this.trans('completed')}${time}`, this.defaults.bgColor);

		this.spacer(2);

		return this;
	}

	/**
	 * Start a spinner with a given text.
	 *
	 * @param text
	 * @returns {ora.Ora}
	 */
	startSpinner(text) {
		const { spinnerType: spinner, spinnerColor: color } = this.defaults;

		return ora({ text, spinner, color }).start();
	}

	/**
	 * Run a command in sync mode.
	 *
	 * @param {string} cmd
	 * @returns {Terminal}
	 */
	run(cmd) {
		execSync(cmd, { stdio: 'inherit' });

		return this;
	}

	/**
	 * Run a command in async mode.
	 *
	 * @param {string}  cmd
	 * @param {object}  [options={}]
	 * @param {string} [options.ignoreError='']
	 * @param silent    [options.silent=false]
	 * @returns {Promise<{error: string, stdout: string, stderr: string}>}
	 */
	runPromise(cmd, { ignoreError = '', silent = false } = {}) {
		return new Promise((resolve) => {
			exec(cmd, { stdio: 'inherit' }, (error, stdout, stderr) => {
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
	 * @param {string} cmd
	 * @returns {string}
	 */
	runAndRead(cmd) {
		return execSync(cmd, { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' });
	}

	/**
	 * Run a command in sync mode and get its output line by line, by expluding empty lines.
	 *
	 * @param {string} cmd
	 * @returns {string[]}
	 */
	runAndReadLines(cmd) {
		return this.runAndRead(cmd).split('\n').filter(Boolean);
	}

	/**
	 * Run a command in sync mode and get its output separated by a slash.
	 *
	 * @param {string} cmd
	 * @returns {string}
	 */
	runAndGet(cmd) {
		return this.runAndReadLines(cmd).join(' / ');
	}

	/**
	 * Run a command in sync mode and echo its output.
	 *
	 * @param {string} cmd
	 * @returns {Terminal}
	 */
	runAndEcho(cmd) {
		this.runAndReadLines(cmd).forEach((line) => {
			this.echo(line);
		});

		return this;
	}

	/**
	 * Print the task to be executed, run the command in sync mode and display a completion box.
	 *
	 * @param {string} title
	 * @param {string} cmd
	 * @returns {Terminal}
	 */
	runTask(title, cmd) {
		this.titleBox(title);
		this.run(cmd);
		this.completionBox();

		return this;
	}

	/**
	 * Print the script file title to be run, run shell script file in sync mode from configured scripts path and
	 * given file with given parameters and display a completion box.
	 *
	 * @param {string} file
	 * @param {...string[]} [options]
	 * @returns {Terminal}
	 */
	runScript(file, ...options) {
		this.titleBox(`${this.scripts.titles[file]}  ${this.chalk.underline(file)}`);
		spawnSync('bash', [`${this.scripts.path}/${file}.sh`].concat(options), { stdio: 'inherit' });
		this.completionBox();

		return this;
	}

	/**
	 * Default values.
	 *
	 * @type {{bgColor: Chalk, indent: number, spinnerType: string, logo: string, lang: string, scripts: {path: string, titles: {}}, textColor: Chalk, spinnerColor: string}}
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
