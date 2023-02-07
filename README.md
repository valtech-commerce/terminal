# @valtech-commerce/terminal

[![npm](https://img.shields.io/npm/v/@valtech-commerce/terminal.svg)](https://www.npmjs.com/package/@valtech-commerce/terminal)
[![npm dependencies](https://david-dm.org/valtech-commerce/terminal/status.svg)](https://david-dm.org/valtech-commerce/terminal)
[![npms](https://badges.npms.io/%40valtech-commerce%2Fterminal.svg)](https://npms.io/search?q=%40valtech-commerce%2Fterminal)
[![Travis CI](https://api.travis-ci.org/valtech-commerce/terminal.svg?branch=main)](https://travis-ci.org/valtech-commerce/terminal/builds)

> Terminal utilities


## Install

```sh
$ npm install @valtech-commerce/terminal
```


## Usage

```js
import { terminal } from '@valtech-commerce/terminal';

terminal.setTheme({
	logo:                  '🍭',
	textColor:             terminal.basicColor.magenta,
	backgroundColor:       '#cc00cc',
	textOnBackgroundColor: terminal.basicColor.white,
	spinnerColor:          terminal.basicColor.magenta
});

terminal
	.titleBox('Start');
	.startSpinner('Checking dependencies')
;

terminal.process.runAsync('npm outdated', { silent:true }).then(({ stdout }) => {
	terminal.stopSpinner();

	if (stdout) {
		terminal
			.spacer();
			.failure('Please update your project')
		;
	} else {
		terminal.success('You are up to date!');
	}

	terminal.completionBox();
});


// Extend it
import { Terminal, Process } from '@valtech-commerce/terminal';

class MyBetterTerminal extends Terminal {

}

class MyBetterProcess extends Process {

}

```


## Documentation

View [documentation](https://valtech-commerce.github.io/terminal)






<br><br>

## License

MIT © [Valtech Canada inc.](https://www.valtech.ca/)
