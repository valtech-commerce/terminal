//--------------------------------------------------------
//-- AbsolunetTerminal
//--------------------------------------------------------
import boxen                     from 'boxen';
import camelCase                 from 'camelcase';
import chalk                     from 'chalk';
import cliSpinners               from 'cli-spinners';
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
import AbsolunetTerminalProcess  from './AbsolunetTerminalProcess';



const BASIC_COLORS = {
	black:         'black',
	red:           'red',
	green:         'green',
	yellow:        'yellow',
	blue:          'blue',
	magenta:       'magenta',
	cyan:          'cyan',
	white:         'white',
	blackBright:   'blackBright',
	redBright:     'redBright',
	greenBright:   'greenBright',
	yellowBright:  'yellowBright',
	blueBright:    'blueBright',
	magentaBright: 'magentaBright',
	cyanBright:    'cyanBright',
	whiteBright:   'whiteBright',
	gray:          'gray',
	grey:          'grey'
};

const COLORS = {
	confirmationText:       chalk.green,
	confirmationBackground: chalk.white.bgGreen,
	warningText:            chalk.yellow,
	warningBackground:      chalk.black.bgYellow,
	errorText:              chalk.red,
	errorBackground:        chalk.white.bgRed
};

const STATUS_COLORS = {
	not_added: chalk.green,  // eslint-disable-line camelcase
	created:   chalk.green,
	modified:  chalk.yellow,
	renamed:   chalk.yellow,
	deleted:   chalk.red
};

const ICONS = {
	success: figures.tick,
	failure: figures.cross
};

const LANGUAGES = {
	francais: 'fr',
	english:  'en'
};

const DICTIONARY = {
	sudo: {
		en: 'It is useless to force me with a sudo',
		fr: 'Ça sert à rien de me forcer avec un sudo'
	},
	completed: {
		en: 'Completed',
		fr: 'Complété'
	},
	after: {
		en: 'after',
		fr: 'après'
	}
};

const HEX_COLOR = /^#[0-f]{6}$/ui;



const basicColorSchema = Joi.string().valid(...Object.values(BASIC_COLORS));

const colorSchema = Joi.alternatives().try(
	basicColorSchema,
	Joi.string().pattern(HEX_COLOR, 'hex color')
);

const requiredStringSchema = Joi.string().allow('').required();



const isHex = (text) => {
	return text.match(HEX_COLOR);
};

const translate = (self, key) => {
	return DICTIONARY[key][self.theme.language] || '';
};

const cleanUp = (self, text = '') => {
	return redent(text, self.theme.indent).replace(/\t/ug, '  ');
};

const startTimer = (self) => {
	__(self).set('timer', Date.now());
};

const stopTimer = (self) => {
	const start = __(self).get('timer');
	__(self).set('timer', undefined);

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
			language:              this.language.english,
			indent:                2,
			logo:                  '•',
			textColor:             this.basicColor.blue,
			backgroundColor:       this.basicColor.blue,
			textOnBackgroundColor: this.basicColor.white,
			borderColor:           this.basicColor.blue,
			spinnerColor:          this.basicColor.blue,
			spinnerType:           this.spinnerType.dots3
		});

		__(this).set('process', new AbsolunetTerminalProcess(this));
	}


	/**
	 * Get process methods.
	 *
	 * @type {AbsolunetTerminalProcess}
	 */
	get process() {
		return __(this).get('process');
	}


	/**
	 * Get available languages.
	 *
	 * @type {Languages}
	 */
	get language() {
		return { ...LANGUAGES };
	}


	/**
	 * Get basic terminal colors (8 colors in normal and bright versions).
	 *
	 * @type {BasicColors}
	 */
	get basicColor() {
		return { ...BASIC_COLORS };
	}


	/**
	 * Get available spinner types.
	 *
	 * @type {SpinnerTypes}
	 */
	get spinnerType() {
		return { ...cliSpinners };
	}


	/**
	 * Get the terminal theme.
	 *
	 * @type {object}
	 */
	get theme() {
		return { ...__(this).get('theme') };
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
		validateArgument('options', options, Joi.object({
			language:              Joi.string().valid(...Object.values(this.language)),
			indent:                Joi.number().integer().min(0),
			logo:                  Joi.string(),
			textColor:             colorSchema,
			backgroundColor:       colorSchema,
			textOnBackgroundColor: colorSchema,
			borderColor:           colorSchema,
			spinnerColor:          basicColorSchema,
			spinnerType:           Joi.object({
				frames:   Joi.array().items(Joi.string()).required(),
				interval: Joi.number().integer().min(0)
			})
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
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	echo(text) {
		validateArgument('text', text, requiredStringSchema);

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
		validateArgument('text', text, requiredStringSchema);

		return this.echo(cleanUp(this, text));
	}


	/**
	 * Print a string with default color and indentation.
	 *
	 * @param {string} text - Text to print.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	print(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.echo(this.colorizeText(cleanUp(this, text)));
	}


	/**
	 * Print one or multiple line breaks.
	 *
	 * @param {number} [number=1] - Number of line breaks to print.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	spacer(number = 1) {
		validateArgument('number', number, Joi.number().integer().min(1));

		return this.print('\n'.repeat(number - 1));
	}


	/**
	 * Display a confirmation message.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	confirmation(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.echo(COLORS.confirmationText(cleanUp(this, text)));
	}


	/**
	 * Display a warning message.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	warning(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.echo(COLORS.warningText(cleanUp(this, text)));
	}


	/**
	 * Display an error message.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	error(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.echo(COLORS.errorText(cleanUp(this, text)));
	}


	/**
	 * Display a success message with a check mark icon.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	success(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.confirmation(`${ICONS.success}  ${text}`).spacer();
	}


	/**
	 * Display a failure message with an ⨉ mark icon.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	failure(text) {
		validateArgument('text', text, requiredStringSchema);

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
		validateArgument('options', options, Joi.object({
			state:   Joi.boolean().required(),
			name:    Joi.string().required(),
			value:   Joi.string().required(),
			message: Joi.string()
		}).required());

		const mark         = ICONS[options.state ? 'success' : 'failure'];
		const colorize     = COLORS[`${options.state ? 'confirmation' : 'error'}Text`];
		const errorMessage = options.state ? '' : options.message;

		return this.echoIndent(`${chalk.bold(`${options.name}`)}  ${colorize(`${mark}  ${options.value} ${errorMessage}`)}`);
	}


	/**
	 * Display the given files status depending if they were not added, created, modified, renamed or deleted, with a Git flavor.
	 * The available status are: "not_added", "created", "modified", "renamed" and "deleted".
	 *
	 * @param {StatusResult} status - A simple-git {@link https://github.com/steveukx/git-js/blob/master/typings/response.d.ts#L132 StatusResult} object.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	printGitStatus(status) {
		validateArgument('status', status, Joi.object({
			not_added:  Joi.array().items(Joi.string()),  // eslint-disable-line camelcase
			conflicted: Joi.array().items(Joi.string()),
			created:    Joi.array().items(Joi.string()),
			deleted:    Joi.array().items(Joi.string()),
			modified:   Joi.array().items(Joi.string()),
			renamed:    Joi.array().items(Joi.object({ from: Joi.string(), to: Joi.string()	})),
			staged:     Joi.array().items(Joi.string()),
			files:      Joi.array().items(Joi.object({ path: Joi.string(), index: Joi.string(), working_dir: Joi.string() })),  // eslint-disable-line camelcase, unicorn/prevent-abbreviations
			ahead:      Joi.number().integer().min(0),
			behind:     Joi.number().integer().min(0),
			current:    Joi.string(),
			tracking:   Joi.string(),
			isClean:    Joi.function()
		}).required());

		const output = Object.keys(STATUS_COLORS)
			.flatMap((type) => {
				if (status[type] && status[type].length !== 0) {
					return status[type].map((file) => {
						return `${STATUS_COLORS[type](pad(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`;
					});
				}

				return [];
			})
			.join('\n')
		;

		return this
			.spacer(2)
			.echoIndent(output)
			.spacer(2)
		;
	}


	/**
	 * Start the spinner with a given text.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	startSpinner(text) {
		validateArgument('text', text, requiredStringSchema);

		__(this).set('spinner', ora({
			text,
			spinner: this.theme.spinnerType,
			color:   this.theme.spinnerColor
		}).start());

		return this;
	}


	/**
	 * Stop the spinner.
	 *
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	stopSpinner() {
		const spinner = __(this).get('spinner');

		if (spinner) {
			spinner.stop();
		}

		__(this).set('spinner', undefined);

		return this;
	}


	/**
	 * Display an error message indicating not to use "sudo".
	 *
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	dontSudoMe() {
		return this.errorBox(`${translate(this, 'sudo')} ${emoji.get('cry')}`);
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
	 * @returns {AbsolunetTerminal} Current instance.
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

		const output = lines.map((line, i) => {
			return colorizer(pad(line, padLength) + (extraPadding && i === 2 ? ' ' : ''));
		}).join('\n');

		return this
			.spacer()
			.echo(output)
			.spacer()
		;
	}


	/**
	 * Display a title in a box.
	 * The logo will be shown as well.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	titleBox(text) {
		validateArgument('text', text, requiredStringSchema);

		startTimer(this);

		const { logo }   = this.theme;
		const { length } = logo;
		const extraPadding = length === stringWidth(logo) && length === stringLength(logo);

		return this.box(`
			${chalk.reset('        ')}${this.colorizeBackground(' ')}
			${chalk.reset(`   ${logo}${extraPadding ? ' ' : ''}   `)}${this.colorizeBackground(' ')} ${text}
			${chalk.reset('        ')}${this.colorizeBackground(' ')}
		`, { padding: true, extraPadding: extraPadding && length === 2 });
	}


	/**
	 * Display an informative message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	infoBox(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.box(text);
	}


	/**
	 * Display a confirmation message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	confirmationBox(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.box(text, { colorizer: COLORS.confirmationBackground });
	}


	/**
	 * Display a warning message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	warningBox(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.box(text, { colorizer: COLORS.warningBackground });
	}


	/**
	 * Display an error message box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	errorBox(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.box(text, { colorizer: COLORS.errorBackground });
	}


	/**
	 * Display a completion box by using the timer if wanted and started.
	 *
	 * @param {boolean} [showDuration=true] - Show amount of time since last TitleBox.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	completionBox(showDuration = true) {
		validateArgument('showDuration', showDuration, Joi.boolean());

		const time = showDuration && __(this, 'timer') ? ` ${translate(this, 'after')} ${prettyMs(stopTimer(this))}` : '';

		return this.infoBox(`${ICONS.success}  ${translate(this, 'completed')}${time}`).spacer(2);
	}


	/**
	 * Display a bordered box.
	 *
	 * @param {string} text - Text to output.
	 * @returns {AbsolunetTerminal} Current instance.
	 */
	borderedBox(text) {
		validateArgument('text', text, requiredStringSchema);

		return this.echo(boxen(this.colorizeText(text), {
			padding:     1,
			margin:      1,
			align:       'center',
			borderColor: this.theme.borderColor
		}));
	}

}


export default AbsolunetTerminal;
