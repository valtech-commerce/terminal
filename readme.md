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
const terminal = require('@absolunet/terminal');

terminal.setDefault({
	logo:  '🍭',
	color: 'magenta'
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
```


## API - Base

### `setDefault([options])`
Define project theme options to be used

#### options
Type: `Object`

##### logo
Type: `string`<br>
Default: '?'<br>
Emoji to be used as logo in TitleBox

##### color
Type: `string`<br>
Default: 'blue'<br>
[Color](https://www.npmjs.com/package/chalk) to be used in project colored outputs

##### lang
Type: `string`<br>
Default: 'en'<br>
Lang to be used in localizec outputs [fr|en]

##### spinnerType
Type: `string`<br>
Default: 'dots3'<br>
[Spinner](https://www.npmjs.com/package/cli-spinners) theme




<br>

### `setScriptsFiles(path, titles)`
Exits the current thread

#### path
Type: `string`<br>
Path to scripts files

#### titles
Type: `Object`<br>
Matching object of script filename to title to be use via `runScript`




<br>

### `exit([text])`
Exits the current thread

#### text
Type: `string`<br>
ErrorBox message to display








<br>
<br>

## API - Text outputs

### `echo(str)`
Outputs a string

#### str
*Required*<br>
Type: `string` <br>
Text to output




<br>

### `echoIndent(str)`
Outputs a indented string

#### str
*Required*<br>
Type: `string`<br>
Text to output



<br>

### `print(str)`
Outputs a indented project colored string

#### str
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `println(str)`
Outputs a indented project colored string with an added newline

#### str
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `spacer([nb])`
Outputs newlines

#### nb
Type: `number`<br>
Default: 1<br>
Text to output




<br>

### `warning(text[, newline])`
Outputs a colored string

#### text
*Required*<br>
Type: `string`<br>
Text to output

#### newline
Type: `boolean`<br>
Default: true<br>
Add a newline




<br>

### `error(text)`
Outputs a colored string

#### text
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `success(str)`
Outputs a colored string with a ✓

#### str
*Required*<br>
Type: `string`<br>
Text to output



<br>

### `failure(str)`
Outputs a colored string with a ✘

#### str
*Required*<br>
Type: `string`<br>
Text to output








<br>
<br>

## API - Formatted outputs

### `dontSudoMe()`
Outputs an ErrorBox with a localized predefined message




<br>

### `printState(options)`
Outputs a colored state of a property

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
Outputs a colored `git status` report

#### status
*Required*<br>
Type: `Object`<br>
A [simple-git](https://www.npmjs.com/package/simple-git) status object




<br>

### `startSpinner(text)`
Outputs a project themed waiting spinner<br>
Returns a [ora spinner](https://www.npmjs.com/package/ora) object

#### text
*Required*<br>
Type: `string`<br>
Text to output








<br>
<br>

## API - Boxes

### `titleBox(text)`
Outputs a project themed boxed title

#### text
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `infoBox(text)`
Outputs a project colored boxed string

#### text
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `warningBox(text)`
Outputs a colored boxed string

#### text
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `errorBox(text)`
Outputs a colored boxed string

#### text
*Required*<br>
Type: `string`<br>
Text to output




<br>

### `completionBox([showDuration])`
Outputs a project themed completion box

#### showDuration
Type: `boolean`<br>
Default: `true`<br>
Show amount of time since last TitleBox







<br>
<br>

## API - Run command lines

### `run(cmd)`
Execute a terminal command

#### cmd
*Required*<br>
Type: `string`<br>
Terminal command




<br>

### `runPromise(cmd[, options])`
Execute a terminal command<br>
`Promise` returns a `object` of terminal output `{ error, stdout, stderr }`

#### cmd
*Required*<br>
Type: `string`<br>
Terminal command

#### options
Type: `Object`

##### ignoreError
Type: `string`<br>
Error message string to ignore

##### silent
Type: `boolean`<br>
Silence all errors




<br>

### `runAndRead(cmd)`
Get a raw terminal command output <br>
Returns a `string` of terminal output

#### cmd
*Required*<br>
Type: `string`<br>
Terminal command




<br>

### `runAndGet(cmd)`
Get a terminal command output in a one-liner<br>
Returns a `string` of terminal output

#### cmd
*Required*<br>
Type: `string`<br>
Terminal command




<br>

### `runAndEcho(cmd)`
Execute a terminal command and output a cleaned up result

#### cmd
*Required*<br>
Type: `string`<br>
Terminal command




<br>

### `runTask(title, cmd)`
Execute a terminal command and wrap output in a TitleBox and CompletionBox

#### title
*Required*<br>
Type: `string`<br>
Task title to output

#### cmd
*Required*<br>
Type: `string`<br>
Terminal command




<br>

### `runScript(file[, ...arg])`
Execute a script file

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
