# babel-plugin-js-to-ts



## Example

**In**

```js
// input code
```

**Out**

```js
"use strict";

// output code
```

## Installation

```sh
$ npm install babel-plugin-js-to-ts
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["js-to-ts"]
}
```

### Via CLI

```sh
$ babel --plugins js-to-ts script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["js-to-ts"]
});
```
