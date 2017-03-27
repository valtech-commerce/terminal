//--------------------------------------------------------
//-- Termimal utilities
//--------------------------------------------------------
'use strict';

const echo = console.log;  // eslint-disable-line no-console

const emoji  = require('node-emoji');
const chalk  = require('chalk');
const redent = require('redent');
const pad    = require('@absolunet/terminal-pad');

const { spawnSync, execSync } = require('child_process');






//-- Static properties
const STATIC = global.___AbsolunetTerminal___ ? global.___AbsolunetTerminal___ : global.___AbsolunetTerminal___ = {
	lang:    'en',
	logo:    '?',
	color:   'blue',
	bgcolor: 'bgBlue',
	scripts: {
		path:   '.',
		titles: {}
	}
};



const DICTIONARY = {
	sudo: {
		fr: 'Ça sert à rien de me forcer avec un sudo',
		en: 'It is useless to force me with a sudo'
	},
	complete: {
		fr: 'Complété',
		en: 'Complete'
	}
};

const trans = (key) => {
	return DICTIONARY[key][STATIC.lang];
};

const cleanUp = (text = '') => {
	return redent(text, 2).replace(/\t/g, '  ');
};

const box = (text, style, padding = true) => {
	let content = cleanUp(text).replace(/^\n+/g, '').replace(/\n+\s*$/g, '');
	content = padding ? `\n${content}\n` : content;

	echo('\n');
	content.split('\n').forEach((line) => {
		echo(style(pad(line, 80)));
	});
	echo('\n');
};






module.exports = class Cli {

	static setDefault(logo, color, lang = 'en') {
		STATIC.logo    = logo;
		STATIC.color   = chalk[color];
		STATIC.bgcolor = chalk.white[`bg${color.charAt(0).toUpperCase()}${color.slice(1)}`];
		STATIC.lang    = lang;
	}

	static setScriptsFiles(path, titles) {
		STATIC.scripts.path   = path;
		STATIC.scripts.titles = titles;
	}






	static echo(str) {
		echo(str);
	}

	static print(str) {
		echo(STATIC.color(cleanUp(`${str}\n`)));
	}

	static warning(text, newline = true) {
		echo(chalk.yellow(cleanUp(`${text}${newline ? '\n' : ''}`)));
	}

	static error(text) {
		echo(chalk.red(cleanUp(`\n${text}\n`)));
	}

	static success(str) {
		echo(chalk.green(cleanUp(`✓  ${str}\n`)));
	}

	static failure(str) {
		echo(chalk.red(cleanUp(`✘  ${str}\n`)));
	}

	static dontSudoMe() {
		this.errorBox(`${trans('sudo')} ${emoji.get('cry')}`);
	}

	static printStatus(status) {
		const colors = {
			not_added: 'green', // eslint-disable-line camelcase
			created:   'green',
			modified:  'yellow',
			renamed:   'yellow',
			deleted:   'red'
		};

		echo('\n');

		['not_added', 'created', 'modified', 'renamed', 'deleted'].forEach((type) => {
			if (status[type].length) {
				status[type].forEach((file) => {
					echo(cleanUp(`${chalk[colors[type]](pad(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`));
				});
			}
		});

		echo('\n');
	}






	static titleBox(text) {
		box(`
			${chalk.bgBlack('        ')}
			${chalk.bgBlack(`   ${STATIC.logo}    `)}  ${text}
			${chalk.bgBlack('        ')}
		`, STATIC.bgcolor);
	}

	static warningBox(text) {
		box(text, chalk.bgYellow.black);
	}

	static errorBox(text) {
		box(text, chalk.bgRed.white);
	}

	static completionBox() {
		box(`${chalk.green('✓')}  ${trans('complete')}`, STATIC.bgcolor);
		echo('\n');
	}






	static run(cmd) {
		execSync(cmd, { stdio:'inherit' });
	}

	static runAndRead(cmd) {
		return execSync(cmd, { encoding:'utf8' });
	}

	static runAndGet(cmd) {
		const lines = [];

		this.runAndRead(cmd).split(`\n`).forEach((line) => {
			if (line) {
				lines.push(line);
			}
		});

		return lines.join(' / ');
	}

	static runAndEcho(cmd) {
		this.runAndRead(cmd).split(`\n`).forEach((line) => {
			if (line) {
				echo(cleanUp(line));
			}
		});
	}

	static runTask(title, cmd) {
		this.titleBox(title);
		this.run(cmd);
		this.completionBox();
	}

	static runScript(file, ...arg) {
		this.titleBox(`${STATIC.scripts.titles[file]}  ${chalk.underline(file)}`);
		spawnSync('bash', [`${STATIC.scripts.path}/${file}.sh`].concat(arg), { stdio:'inherit' });
		this.completionBox();
	}

};
