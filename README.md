# coffee-to-ts

> A command line utility to transform CoffeeScript files to TypeScript

## Prerequisites

1. `node >= v4.0.0`

## Usage

1. `npm install -g nikaspran/coffee-to-ts#master`
2. `coffee-to-ts <glob>`

## Examples:

1. Convert all CoffeeScript files in the current directory

  ```bash
  > coffee-to-ts "*.coffee"
  Converted productPreviewDirective.coffee => productPreviewDirective.ts
  ```
  
2. Use a different version of Node via `nvm` and convert all subdirectories of the current directory

  ```bash
  > nvm exec stable coffee-to-ts "**/*.coffee"
  Converted productPreviewDirective.coffee => productPreviewDirective.ts
  Converted productDirective.coffee => productDirective.ts
  ```
