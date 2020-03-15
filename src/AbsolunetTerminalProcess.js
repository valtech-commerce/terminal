//--------------------------------------------------------
//-- AbsolunetTerminalProcess
//--------------------------------------------------------
import { execSync, exec }        from 'child_process';
import { Joi, validateArgument } from '@absolunet/joi';
import __                        from '@absolunet/private-registry';



const DICTIONARY = {
	silentError: {
		en: `A silent error has occurred`,
		fr: `Une erreur silencieuse s'est produite`
	}
};


const runOptionsSchema = Joi.object({
	directory:   Joi.string(),
	environment: Joi.object().pattern(Joi.string(), Joi.string())
});


const translate = (self, key) => {
	return DICTIONARY[key][self.theme.language] || '';
};






/**
 * Process utilities.
 */
class AbsolunetTerminalProcess {

	/**
	 * Create a process instance.
	 *
	 * @param {AbsolunetTerminal} terminal - Instance of AbsolunetTerminal.
	 */
	constructor(terminal) {
		validateArgument('terminal', terminal, Joi.object().required());

		__(this).set('terminal', terminal);
	}


	/**
	 * Terminal instance.
	 *
	 * @type {AbsolunetTerminal}
	 */
	get terminal() {
		return __(this).get('terminal');
	}


	/**
	 * Process run options.
	 *
	 * @param {object} [options] - Options.
	 * @param {string} [options.directory] - Current working directory of the command.
	 * @param {object} [options.environment] - Environment key-value pairs to add.
	 * @returns {{ cwd: string, env: { string: string }}} Parsed run options.
	 */
	parseOptions(options) {
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

		execSync(command, { stdio: 'inherit', ...this.parseOptions(options) });
	}


	/**
	 * Run a command in async mode.
	 *
	 * @param {string} command - Command to run.
	 * @param {object} [options] - Options.
	 * @param {string} [options.directory] - Current working directory of the command.
	 * @param {object} [options.environment] - Environment key-value pairs to add.
	 * @param {string|RegExp} [options.ignoreError=''] - Error message string to ignore.
	 * @param {boolean} [options.silent=false] - Silence all errors.
	 * @returns {Promise<{error: string, stdout: string, stderr: string}>} Terminal outputs.
	 */
	runAsync(command, { directory, environment,	ignoreError = '', silent = false } = {}) {
		validateArgument('command',             command,     Joi.string().required());
		validateArgument('options.directory',   directory,   Joi.string());
		validateArgument('options.environment', environment, Joi.object().pattern(Joi.string(), Joi.string()));
		validateArgument('options.ignoreError', ignoreError, Joi.alternatives().try(Joi.string().allow(''), Joi.object().instance(RegExp)));
		validateArgument('options.silent',      silent,      Joi.boolean());

		return new Promise((resolve) => {
			exec(command, { stdio: 'inherit', ...this.parseOptions({ directory, environment }) }, (error, stdout, stderr) => {
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
							this.terminal.echo(output);
						}

						if (errorMessage) {
							if (!errorOutput) {
								this.terminal.error(translate(this.terminal, 'silentError'));
							}

							this.terminal
								.error(`
									${errorMessage || ''}
									${errorOutput || ''}
								`)
								.exit()
							;

						} else {
							this.terminal.warning(errorOutput);
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

		return execSync(command, { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8', ...this.parseOptions(options) });
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

		this.terminal.echo(this.runAndReadLines(command, options).join('\n'));
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

		this.terminal.titleBox(title);
		this.run(command, options);
		this.terminal.completionBox();
	}

}


export default AbsolunetTerminalProcess;
