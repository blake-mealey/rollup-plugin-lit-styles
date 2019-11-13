# rollup-plugin-lit-styles

<p>
    <a href="https://david-dm.org/blake-mealey/rollup-plugin-lit-styles?type=dev" alt="David">
        <img src="https://img.shields.io/david/dev/blake-mealey/rollup-plugin-lit-styles" /></a>
</p>

A Rollup.js plugin.

## Installation

```sh
# yarn
yarn add rollup-plugin-lit-styles -D

# npm
npm i rollup-plugin-lit-styles -D
```

## Usage

```js
// rollup.config.js
import litStyles from 'rollup-plugin-lit-styles';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs'
    },
    plugins: {
        litStyles({
            optionName: 'value'
        })
    }
};
```
