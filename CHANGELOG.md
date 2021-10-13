# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).






## [Unreleased]
### Added
- Add shell option to processes

### Changed
- Maintenance updates



## [3.1.0] - 2020-08-24
### Added
- `.updateSpinnerText()` method

### Changed
- Maintenance updates



## [3.0.4] - 2020-03-30
### Changed
- Maintenance updates

### Fixed
- Allow `null` for `status.tracking` in `.printGitStatus()`



## [3.0.3] - 2020-03-15
### Changed
- Maintenance updates

### Fixed
- Added support for RegExp on `process.runAsync` `ignoreError` option 



## [3.0.2] - 2020-01-31
### Fixed
- Correct definition for `StatusResult` parameter in `.printGitStatus()`



## [3.0.1] - 2020-01-29
### Changed
- Maintenance updates

### Removed
- Validation on logo length



## [3.0.0] - 2020-01-21
### Added
- API documentation
- Arguments validation for all methods
- Add options to `run` methods to specify a current working directory and environment variables
- `.language` property
- `.basicColor` property
- `.spinnerType` property
- `.colorizeText()` method
- `.colorizeBackground()` method
- `.confirmation()` method
- `.stopSpinner()` method
- `.confirmationBox()` method
- `.process.parseOptions()` method

### Changed
- Complete code refactor and standardization
- Colors are now defined by Chalk keyword or hex string
- All methods outputing are now chainable
- Renamed `.defaults` to `.theme` with renamed and new values
- Renamed `.setDefaults()` to `.setTheme()` with renamed and new options
- Renamed `.printStatus()` to `.printGitStatus()`
- Renamed `.run()` to `.process.run()`
- Renamed `.runPromise()` to `.process.runAsync()`
- Renamed `.runAndRead()` to `.process.runAndRead()`
- Renamed `.runAndReadLines()` to `.process.runAndReadLines()`
- Renamed `.runAndGet()` to `.process.runAndGet()`
- Renamed `.runAndEcho()` to `.process.runAndEcho()`
- Renamed `.runTask()` to `.process.runTask()`
- Renamed `.printState()` option `msg` to `message`
- Grouped `.box()` optional arguments under one argument with properties `colorizer`, `padding`, `extraPadding`
- `.warning()` does not add newline by default anymore
- `.startSpinner()` does not return `ora` instance anymore
- Maintenance updates

### Removed
- `.chalk` property
- `.scripts` property
- `.setDefault()` method
- `.setLang()` method
- `.setScriptsFiles()` method
- `.cleanUp()` method
- `.println()` method
- `.trans()` method
- `.addTrans()` method
- `.startTimer()` method
- `.isTimerStarted()` method
- `.stopTimer()` method
- `.runScript()` method



## [2.1.1] - 2019-08-29
### Fixed
- Added `borderColor` option to `.setDefaults()`



## [2.1.0] - 2019-08-29
### Added
- `.defaults` property
- `.scripts` property
- `.setLang()` method
- `.trans()` method
- `.addTrans()` method
- `.cleanUp()` method
- `.startTimer()` method
- `.isTimerStarted()` method
- `.stopTimer()` method
- `.box()` method
- `.borderedBox()` method
- `.runAndReadLines()` method
- Added JSDoc comments

### Changed
- Renamed `.setDefault()` to `.setDefaults()`
- Maintenance updates



## [2.0.0] - 2019-03-12
### Added
- Expose class definition

### Changed
- Maintenance updates


## [1.2.1] - 2019-02-22
### Fixed
- Removed test in `.titleBox()`



## [1.2.0] - 2019-02-22
### Changed
- Changed color specifications
- Maintenance updates

### Fixed
- Finally fixed logo spacing



## [1.1.1] - 2019-02-05
### Fixed
- Corrected variable emoji width



## [1.1.0] - 2019-01-28
### Changed
- Support boxes with a width larger than 80 characters



## [1.0.2] - 2019-01-25
### Fixed
- Correction to box with emoji



## [1.0.1] - 2019-01-25
### Fixed
- Update `@absolunet/terminal-pad` to correct box with emoji



## [1.0.0] - 2019-01-17
### Changed
- Refactor for standardization
- Maintenance updates



## [0.5.0] - 2018-05-02
### Added
- Duration on `.completionBox()`

### Changed
- Maintenance updates



## [0.4.4] - 2017-09-27
### Changed
- More documentation



## [0.4.3] - 2017-09-27
### Added
- Added documentation

### Changed
- Maintenance updates



## [0.4.2] - 2017-05-26
### Added
- Added a `silent` option in `.runPromise()`



## [0.4.1] - 2017-05-14
### Changed
- Better management of errors vs warnings in `.runPromise()`



## [0.4.0] - 2017-05-09
### Added
- Support ignore custom error messages in `.runPromise()`



## [0.3.1] - 2017-05-04
### Fixed
- Glitch with error output in `.runPromise()`



## [0.3.0] - 2017-05-04
### Changed
- Better handling of `.runPromise()` errors



## [0.2.0] - 2017-04-23
### Added
- `.startSpinner()` method



## [0.1.0] - 2017-04-18
### Added
- `.exit()` method
- `.runPromise()` method



## [0.0.5] - 2017-04-06
### Added
- `.infoBox()` method



## [0.0.4] - 2017-03-28
### Changed
- Cleanup output in `.echoIndent()`



## [0.0.3] - 2017-03-28
### Added
- `.echoIndent()` method
- `.println()` method
- `.spacer()` method
- `.printState()` method



## [0.0.2] - 2017-03-26
### Added
- Initial






[Unreleased]: https://github.com/absolunet/node-terminal/compare/3.1.0...HEAD
[3.1.0]:      https://github.com/absolunet/node-terminal/compare/3.0.4...3.1.0
[3.0.4]:      https://github.com/absolunet/node-terminal/compare/3.0.3...3.0.4
[3.0.3]:      https://github.com/absolunet/node-terminal/compare/3.0.2...3.0.3
[3.0.2]:      https://github.com/absolunet/node-terminal/compare/3.0.1...3.0.2
[3.0.1]:      https://github.com/absolunet/node-terminal/compare/3.0.0...3.0.1
[3.0.0]:      https://github.com/absolunet/node-terminal/compare/2.1.1...3.0.0
[2.1.1]:      https://github.com/absolunet/node-terminal/compare/2.1.0...2.1.1
[2.1.0]:      https://github.com/absolunet/node-terminal/compare/2.0.0...2.1.0
[2.0.0]:      https://github.com/absolunet/node-terminal/compare/1.2.1...2.0.0
[1.2.1]:      https://github.com/absolunet/node-terminal/compare/1.2.0...1.2.1
[1.2.0]:      https://github.com/absolunet/node-terminal/compare/1.1.1...1.2.0
[1.1.1]:      https://github.com/absolunet/node-terminal/compare/1.1.0...1.1.1
[1.1.0]:      https://github.com/absolunet/node-terminal/compare/1.0.2...1.1.0
[1.0.2]:      https://github.com/absolunet/node-terminal/compare/1.0.1...1.0.2
[1.0.1]:      https://github.com/absolunet/node-terminal/compare/1.0.0...1.0.1
[1.0.0]:      https://github.com/absolunet/node-terminal/compare/0.5.0...1.0.0
[0.5.0]:      https://github.com/absolunet/node-terminal/compare/0.4.4...0.5.0
[0.4.4]:      https://github.com/absolunet/node-terminal/compare/0.4.3...0.4.4
[0.4.3]:      https://github.com/absolunet/node-terminal/compare/0.4.2...0.4.3
[0.4.2]:      https://github.com/absolunet/node-terminal/compare/0.4.1...0.4.2
[0.4.1]:      https://github.com/absolunet/node-terminal/compare/0.4.0...0.4.1
[0.4.0]:      https://github.com/absolunet/node-terminal/compare/0.3.1...0.4.0
[0.3.1]:      https://github.com/absolunet/node-terminal/compare/0.3.0...0.3.1
[0.3.0]:      https://github.com/absolunet/node-terminal/compare/0.2.0...0.3.0
[0.2.0]:      https://github.com/absolunet/node-terminal/compare/0.1.0...0.2.0
[0.1.0]:      https://github.com/absolunet/node-terminal/compare/0.0.5...0.1.0
[0.0.5]:      https://github.com/absolunet/node-terminal/compare/0.0.4...0.0.5
[0.0.4]:      https://github.com/absolunet/node-terminal/compare/0.0.3...0.0.4
[0.0.3]:      https://github.com/absolunet/node-terminal/compare/0.0.2...0.0.3
[0.0.2]:      https://github.com/absolunet/node-terminal/releases/tag/0.0.2
