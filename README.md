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

Originally developed for use in [Membrane](https://github.com/Elijah-Bodden/Membrane), kNow is a fully functional, if lightweight, event-management utility which I hope may be at least marginally useful elsewhere.

## Examples
### Pause function execution for X miliseconds
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

  setTimeout(() => know.clearWhen(changeListener), 5001)
  /* Expected Output:
    "Variable was changed to (some value)" *1 second pause* x 5
  */

```
