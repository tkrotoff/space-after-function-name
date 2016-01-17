# One or no space after function name?

Analyse occurrences of no-space-after-function-name vs one-space-after-function-name within top open-source JavaScript repositories in GitHub.

Quick and dirty hack based on https://github.com/ukupat/tabs-or-spaces

Couldn't make [popularconvention](https://github.com/outsideris/popularconvention) to work: https://github.com/outsideris/popularconvention/issues/64

Regular expressions used:
```JavaScript
var NO_SPACE_AFTER_FUNCTION_NAME = /function\s+\w+\(/;
var ONE_SPACE_AFTER_FUNCTION_NAME = /function\s+\w+\s\(/;
```

It checks for:
```JavaScript
function foo() { return 'Hello, World!'; }
// vs
function foo () { return 'Hello, World!'; }
```

Not for (too complex):
```JavaScript
class Foo {
  bar1() { return 'Hello, World!'; }
  // vs
  bar2 () { return 'Hello, World!'; }
}
```

## Results

```JavaScript
{
  "analysedRepos": 500,
  "noSpaceAfterFunctionNameLines": 42333,
  "oneSpaceAfterFunctionNameLines": 2420,
  "reposWithProperFiles": 497, // Repos with .js files not ending with .min.js or -min.js
  "reposWithResults": 452,
  "noSpaceAfterFunctionNameRepos": 417,
  "oneSpaceAfterFunctionNameRepos": 35,
  "unknownStyleRepos": 45
}
```

- **92%** (= 417/(452/100)) of the 452 "styled" repositories uses no-space-after-function-name
- 94% (= 42333/(44753/100)) of the 44727 "styled" lines uses no-space-after-function-name

## How to use it

Open up the `src/Boss.js` and fill up the `let` variables. After that install the dependencies and start the research.

```
$ npm install && npm start
```

## License

[MIT](//github.com/ukupat/tabs-or-spaces/blob/master/LICENSE)
