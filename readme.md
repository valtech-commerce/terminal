# @absolunet/terminal

[![npm](https://img.shields.io/npm/v/@absolunet/terminal.svg)](https://www.npmjs.com/package/@absolunet/terminal)
[![npm dependencies](https://david-dm.org/absolunet/node-terminal/status.svg)](https://david-dm.org/absolunet/node-terminal)
[![npms](https://badges.npms.io/%40absolunet%2Fterminal.svg)](https://npms.io/search?q=%40absolunet%2Fterminal)
[![Travis CI](https://api.travis-ci.org/absolunet/node-terminal.svg?branch=master)](https://travis-ci.org/absolunet/node-terminal/builds)

> Terminal utilities


## Install

```sh
$ npm install @absolunet/terminal
```


## Usage

```js
import { terminal } from '@absolunet/terminal';

terminal.setTheme({
	logo:                  '🍭',
	textColor:             'magenta',
	backgroundColor:       '#cc00cc',
	textOnBackgroundColor: 'white',
	spinnerColor:          'magenta'
});

terminal.titleBox('Start');

terminal.startSpinner('Checking dependencies');

terminal.runPromise('npm outdated', { silent:true }).then(({ stdout }) => {
	terminal.stopSpinner();

	if (stdout) {
		terminal.spacer();
		terminal.failure('Please update your project');
	} else {
		terminal.success('You are up to date!');
	}

	terminal.completionBox();
});


// Extend it
import { Terminal } from '@absolunet/terminal';

class MyBetterTerminal extends Terminal {

}
```


## Documentation

View [documentation](https://documentation.absolunet.com/node-terminal)






<br><br>

## License

MIT © [Absolunet](https://absolunet.com)
