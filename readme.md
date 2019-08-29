# @absolunet/terminal

[![npm](https://img.shields.io/npm/v/@absolunet/terminal.svg)](https://www.npmjs.com/package/@absolunet/terminal)
[![npm dependencies](https://david-dm.org/absolunet/node-terminal/status.svg)](https://david-dm.org/absolunet/node-terminal)
[![npms](https://badges.npms.io/%40absolunet%2Fterminal.svg)](https://npms.io/search?q=%40absolunet%2Fterminal)
[![Travis CI](https://api.travis-ci.org/absolunet/node-terminal.svg?branch=master)](https://travis-ci.org/absolunet/node-terminal/builds)
[![Code style ESLint](https://img.shields.io/badge/code_style-@absolunet/node-659d32.svg)](https://github.com/absolunet/eslint-config-node)

> Terminal utilities


## Install

```sh
$ npm install @absolunet/terminal
```


## Usage

```js
const { terminal } = require('@absolunet/terminal');
const { chalk }    = terminal;

terminal.setDefaults({
	logo:         '🍭',
	textColor:    chalk.magenta,
	bgColor:      chalk.white.bgMagenta,
	spinnerColor: 'magenta'
});

terminal.titleBox('Start');

terminal.startSpinner('Checking dependencies');

terminal.runPromise('npm outdated', { silent:true }).then(({ stdout }) => {
	spinner.stop();

	if (stdout) {
		terminal.spacer();
		terminal.failure('Please update your project');
	} else {
		terminal.success('You are up to date!');
	}

	terminal.completionBox();
});


// Extend it
const { Terminal } = require('@absolunet/terminal');

class MyBetterTerminal extends Terminal {

}
```


## API - Base

### `chalk`
Chalk instance.




<br>

### `defaults`
Default values.




<br>

### `scripts`
Scripts path and titles.




<br>

### `setDefaults(options)`
Set the default terminal properties.

#### options
*Required*<br>
Type: `Object`

##### indent
Type: `number`<br>
Default: 2<br>
Indentation used

##### logo
Type: `string`<br>
Default: '•'<br>
Emoji to be used as logo in TitleBox

##### textColor
Type: `Function`<br>
Default: chalk.blue<br>
[Chalk definition](https://www.npmjs.com/package/chalk) to be used in project colored outputs

##### bgColor
Type: `Function`<br>
Default: chalk.white.bgBlue<br>
[Chalk definition](https://www.npmjs.com/package/chalk) to be used in project colored outputs

##### spinnerColor
Type: `string`<br>
Default: 'blue'<br>
[Color](https://www.npmjs.com/package/chalk) to be used with spinner

##### lang
Type: `string`<br>
Default: 'en'<br>
Language to be used in localized outputs (fr|en)

##### spinnerType
Type: `string`<br>
Default: 'dots3'<br>
[Spinner](https://www.npmjs.com/package/cli-spinners) theme




<br>

### `setLang(lang)`
Set the default output language.

#### lang
*Required*<br>
Type: `string`<br>
Language [fr|en]




<br>

### `setScriptsFiles(path, titles)`
Set executable script files root path and associate the file names with a human title.

#### path
*Required*<br>
Type: `string`<br>
Path to scripts files.

#### titles
*Required*<br>
Type: `Object`<br>
Matching object of script filename to title to be use via `runScript`.




<br>

### `exit(*[text]*)`
Exit the process and show an optional exit message in an error box.

#### text
Type: `string`<br>
ErrorBox message to display




<br>

### `cleanUp(text)`
Clean up the string content and adjust intent.<br>
Returns cleaned text.

#### text
*Required*<br>
Type: `string`<br>
Text to clean.




<br>

### `trans(key *[, lang]*)`
Translate the given key in current language.<br>
Returns translated text.

#### key
*Required*<br>
Type: `string`<br>
Translation key.

#### lang
Type: `string`<br>
Language (fr|en).




<br>

### `addTrans(key, values)`
Add translations in the translation dictionary.

#### key
*Required*<br>
Type: `string`<br>
Translation key.

#### values
*Required*<br>
Type: `object`<br>
Translations for each language.








<br>
<br>

## API - Text outputs

### `echo(text)`
Output a text in the terminal.

#### text
*Required*<br>
Type: `string`<br>
Text to output.





<br>

### `echoIndent(text)`
Echo a text after cleaning and indenting it.

#### text
*Required*<br>
Type: `string`<br>
Text to echo.




<br>

### `print(text)`
Print a string with default color and indentation.

#### text
*Required*<br>
Type: `string`<br>
Text to print.




<br>

### `println(text)`
Print a string with default color, indentation and new line at the end.

#### text
*Required*<br>
Type: `string`<br>
Text to print.




<br>

### `spacer(*[number]*)`
Print one or multiple line breaks.

#### number
Type: `number`<br>
Default: 1<br>
Number of line breaks to print.




<br>

### `warning(text *[, newline]*)`
Display a warning message.

#### text
*Required*<br>
Type: `string`<br>
Text to output.

#### newline
Type: `boolean`<br>
Default: true<br>
Add a newline.




<br>

### `error(text)`
Display an error message.

#### text
*Required*<br>
Type: `string`<br>
Text to output.




<br>

### `success(text)`
Display a success message with a check mark icon.

#### text
*Required*<br>
Type: `string`<br>
Text to output.



<br>

### `failure(text)`
Display a failure message with an ⨉ mark icon.

#### text
*Required*<br>
Type: `string`<br>
Text to output.








<br>
<br>

## API - Formatted outputs

### `dontSudoMe()`
Display an error message indicating not to use "sudo".




<br>

### `printState(options)`
Print the given state, if the state is falsy, the given message will be display.

#### options
*Required*<br>
Type: `Object`

##### state
*Required*
Type: `boolean`<br>
If a success or a failure

##### name
*Required*<br>
Type: `string`<br>
Name of the property

##### value
*Required*<br>
Type: `string`<br>
Value of the property

##### msg
Type: `string`<br>
Detailled error message in case of failure




<br>

### `printStatus(status)`
Print the given files status depending if they were not added, created, modified, renamed or deleted, with a Git flavor.
The available status are: "not_added", "created", "modified", "renamed" and "deleted".

#### status
*Required*<br>
Type: `Object`<br>
A [simple-git](https://www.npmjs.com/package/simple-git) status object




<br>

### `startSpinner(text)`
Start a spinner with a given text.<br>
Returns a [ora spinner](https://www.npmjs.com/package/ora) object

#### text
*Required*<br>
Type: `string`<br>
Text to output.








<br>
<br>

## API - Boxes


### `box(text, style *[, padding, extraPadding]*)`
Print a text in a box.

#### text
*Required*<br>
Type: `string`<br>
Text to output.

#### style
Type: `Function`<br>
Default: defaults.bgColor<br>
[Chalk definition](https://www.npmjs.com/package/chalk).

#### padding
Type: `boolean`<br>
Default: true<br>
Add vertical padding.

#### extraPadding
Type: `boolean`<br>
Default: false<br>
Needs extra padding.




### `startTimer()`
Start timer.




### `isTimerStarted()`
Check if the timer was started.<br>
Returns if timer started.




### `stopTimer()`
Stop timer and retrieve the time elapsed between the call and the last startTimer() call.<br>
Returns the number of milliseconds.




### `titleBox(text)`
Print a title in a box, the logo will be shown as well.

#### text
*Required*<br>
Type: `string`<br>
Text to output.




<br>

### `infoBox(text)`
Display an informative message box.

#### text
*Required*<br>
Type: `string`<br>
Text to output.




<br>

### `warningBox(text)`
Display a warning message box.

#### text
*Required*<br>
Type: `string`<br>
Text to output.




<br>

### `errorBox(text)`
Display an error message box.

#### text
*Required*<br>
Type: `string`<br>
Text to output.




<br>

### `completionBox(*[showDuration]*)`
Display a completion box by using the timer if wanted and started.

#### showDuration
Type: `boolean`<br>
Default: `true`<br>
Show amount of time since last TitleBox







<br>
<br>

## API - Run command lines

### `run(command)`
Run a command in sync mode.

#### command
*Required*<br>
Type: `string`<br>
Command to run.




<br>

### `runPromise(command *[, options]*)`
Run a command in async mode.<br>
`Promise` returns a `object` of terminal output `{ error, stdout, stderr }`

#### command
*Required*<br>
Type: `string`<br>
Command to run.

#### options
Type: `Object`

##### ignoreError
Type: `string`<br>
Error message string to ignore.

##### silent
Type: `boolean`<br>
Silence all errors.




<br>

### `runAndRead(command)`
Run a command in sync mode and get its output.<br>
Returns a `string` of terminal output

#### command
*Required*<br>
Type: `string`<br>
Command to run.




<br>

### `runAndReadLines(command)`
Run a command in sync mode and get its output line by line, by excluding empty lines.<br>
Returns an `Array` of `string` of terminal output

#### command
*Required*<br>
Type: `string`<br>
Command to run.




<br>

### `runAndGet(command)`
Run a command in sync mode and get its output separated by a slash.<br>
Returns a `string` of terminal output

#### command
*Required*<br>
Type: `string`<br>
Command to run.




<br>

### `runAndEcho(command)`
Run a command in sync mode and echo its output.

#### command
*Required*<br>
Type: `string`<br>
Command to run.




<br>

### `runTask(title, command)`
Print the task to be executed, run the command in sync mode and display a completion box.

#### title
*Required*<br>
Type: `string`<br>
Task title to output

#### command
*Required*<br>
Type: `string`<br>
Command to run.




<br>

### `runScript(file *[, ...arg]*)`
Print the script file title to be run, run shell script file in sync mode from configured scripts path and given file with given parameters and display a completion box.

#### file
*Required*<br>
Type: `string`<br>
Script filename under path defined via `setScriptsFiles`

#### arg
Type: `string`<br>
Arguments to pass to the script








<br>
<br>

## License

MIT © [Absolunet](https://absolunet.com)
