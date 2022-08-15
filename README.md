<h1 align="center">
  <img src="./Assets/logo.svg" width="128" height="128"></img><br>
  kNow
</h1>
<p align="center">
Blazing-fast callback/promise-based events with a tiny footprint
</p>
<p align="center">
  <img src="https://img.shields.io/bundlephobia/minzip/@elijah-bodden/know?label=Minzipped%20size&style=flat-square"/>
  <img src="https://img.shields.io/github/license/Elijah-Bodden/kNow?style=flat-square"/>
  <a href="https://www.npmjs.com/package/@elijah-bodden/know"><img src="https://img.shields.io/npm/dw/@elijah-bodden/know?color=%23009eb0&label=NPM%20downloads&style=flat-square"/></a>
  <img src="https://img.shields.io/maintenance/yes/2022?label=Maintained&style=flat-square"/>
  <a href="https://twitter.com/intent/tweet?text=A+tiny+event+emitter+that+packs+a+punch.&url=https%3A%2F%2Fgithub.com%2FElijah-Bodden%2FkNow&hashtags=javascript+js+opensource+javascriptdev+eventhandler+emitter+github&original_referer=http%3A%2F%2Fgithub.com%2F&tw_p=tweetbutton" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png" title="A tiny event emitter that packs a punch."></img>
  </a>
</p>

## What is this?
With kNow (pronounced "*now*"), JavaScript event management has never been more intuitive—or lighter-weight. Want to append custom actions to functions on-the-fly? To use awaitable timers to pause and resume execution at any time? To create large numbers of listeners without worrying about performance degradation? If so, you want kNow.

Originally developed for use in [Membrane](https://github.com/Elijah-Bodden/Membrane), kNow is a fully functional, if lightweight, native event-management utility for many other use-cases.

## Getting Started
### Node.js + npm
#### Installation:
To install in the root of your node project:
```bash
npm i @elijah-bodden/know
```
Or else globally:
```bash
npm i @elijah-bodden/know -g
```
#### Use in-script
To import the module into your node script, simply paste the following line at the very top:
```JavaScript
const kNow = require('@elijah-bodden/know')
```
Then, to create a usable intance, add `const someVariable = new kNow()` anywhere, where 'someVariable' is the name you wish to access it by.
### HTML `script` tag
#### Inclusion
To include the script in your HTML, add the following tag to the top of your document:
```HTML
<script src="https://cdn.jsdelivr.net/npm/@elijah-bodden/know@latest/index.min.js">
```
## Examples
### Pause function execution for n miliseconds
```JavaScript
  const kNow = require("@elijah-bodden/know");
  const know = new kNow()
  
  async function test() {
    console.log("foo")
    console.log("bar")
    //Creates and awaits a promise that resolves in 3000ms or 3 seconds
    await know.in(3000)
    console.log("baz")
  }
  
  test()
  
  /* Expected Output:
    1. "foo"
    2. "bar"
    *Three-second pause*
    3. "baz"
  */
```

### Track changes to a variable
```JavaScript
  const kNow = require("@elijah-bodden/know");
  const know = new kNow()
  
  var variable
  
  function setVariable(newVal) {
    variable = newVal
    know.dispatch("variableChanged", variable)
  }
  
  setInterval(() => setVariable(Math.random()), 1000)
  
  //Listener callbacks can be created and destroyed at any time, on-the-fly.
  const changeListener = know.when("variableChanged", (newVal) => console.log(`Variable "variable" was changed to ${newVal}.`))

  setTimeout(() => know.clearWhen(changeListener), 5000)
  /* Expected Output:
    *1 second pause* "Variable was changed to (some value)" x 4
  */

```
### Call function X next time Y completes
```JavaScript
  const kNow = require("@elijah-bodden/know");
  const know = new kNow()

  function unpredictableFunction() {
    for (let i = 0; i < 10000000; i++) {
      //Doing some valuable operations
    }
    console.log("Alerting that task was completed.")
    know.dispatch("taskCompleted")
    setTimeout(unpredictableFunction, Math.floor(Math.random()*10000))
  }
  
  setTimeout(unpredictableFunction, Math.floor(Math.random()*10000))
  
  know.next("taskCompleted").then(() => console.log("Task completed!"))
  
  /* Expected Output:
    *Indefinite pause*
    1. "Alerting that task was completed."
    2. "Task completed!"
  */
```
