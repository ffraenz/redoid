redoid
======

A node.js package that gives your Raspberry Pi control over your Ikea Dioder LED light strip.

## Installation

- Connect your Dioder LED light strip to your Raspberry Pi.
- Install the pi-blaster daemon ([instructions](https://github.com/sarfata/pi-blaster)).
- Make sure you have `node` and `npm` installed on your Raspberry Pi.

Finally install `redoid`:

    $ npm install redoid


## Examples

### Simple Alert

```javascript
var Redoid = require('redoid');
var redoid = Redoid({
    color: '#ffffff'
});

redoid.transition('#249db3', 250);
redoid.transition('#ffffff', 4000);
```

### Red Alert

```javascript
var Redoid = require('redoid');
var redoid = Redoid({
    color: '#300000',
    loopTransition: true
});

redoid.transition('#ff0000', 1500);
redoid.transition('#300000', 1500);
```

### Easing

```javascript
var Redoid = require('redoid');
var redoid = Redoid({
    color: '#ffffff'
});

var i = 0;

for (var easing in Redoid.easingFunctions)
{
    // trigger method logging the used easing function
    redoid.trigger(function() {
        console.log('' + this);
    }.bind(easing));

    redoid.delay(1000);
    redoid.transition(i ++ % 2 === 0 ? '#ff0000' : '#ffffff', 2000, easing);
}
```

## Usage

### Instance

You don't need to provide any options. These are the defaults.

```javascript
var Redoid = require('redoid');

var redoid = Redoid({
    color: '#ffffff',
    colorComponentPins: [4, 17, 18],
    loopInterval: 25,
    defaultEasing: 'easeInOutQuad',
    idleTimeout: 0,
    idleCallback: null,
    idleColor: null,
    idleColorTransitionDuration: 4000,
    loopTransition: false
});
```

Option | Description
------ | -----------
`color` | Initial color
`colorComponentPins` | Array having 3 integer values of the RGB GPIO pins dioder is connected to.
`loopInterval` | Duration between transitioning ticks.
`defaultEasing` | Default easing
`idleTimeout` | Delay between idle state and the idle event.
`idleCallback` | Function that gets called when the idle event is triggered.
`idleColor` | Idle color to transition to when the idle event is triggered. This feature is disabled if set to `null`.
`idleColorTransitionDuration` | Idle color transition duration
`loopTransition` | If set to `true` completed transition steps will be added to the end of the queue resulting in a never-ending transition loop.

### Color

Color values are expected to be rgb hexadecimal strings or arrays of rgb color components.

```javascript
// hexadecimal
var color = '#ff0000';

// shorthand hexadecimal
var color = '#f00';

// array of color components
var color = [255, 0, 0];
```


### Easing

Easing values are expected to be a `function` or one of the following keys: `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeInOutQuart`, `easeInQuint`, `easeOutQuint`, `easeInOutQuint`.

```javascript
// expressed by a function
var easing = function(t) {
    return t<.5 ? 2*t*t : -1+(4-2*t)*t;
}

// expressed by a key
var easing = 'easeInOutQuad';
```


### Methods

#### getColor

Return the current color. (e.g. `[255, 0, 0]`)

```javascript
var color = redoid.getColor();
```

#### getColorHexValue

Return hex value of current color. (e.g. `#ff0000`)

```javascript
var color = redoid.getColorHexValue();
```

#### getLastQueuedColor

Return the last queued color. If `loopTransition` is set to `true`, this value changes during transiton.

```javascript
var color = redoid.getLastQueuedColor();
```

#### getLastQueuedColorHexValue

Return hex value of last queued color.

```javascript
var color = redoid.getLastQueuedColorHexValue();
```

#### isColorEqual

Check if colors are equal.

```javascript
var isColorEqual = redoid.isColorEqual(a, b)
```

#### isTransitioning

Returns `true` when currently inside transition.

```javascript
var isTransitioning = redoid.isTransitioning();
```

#### transition

Queue transition from the last queued color (obtained by `getLastQueuedColor`) to the color provided.

```javascript
redoid.transition(color, [duration], [easing]);
```

#### change

Queue color change to color provided.

```javascript
redoid.change(color);
```

#### turnOff

Queue turning off the lights.

```javascript
redoid.turnOff([duration]);
```

#### delay

Delay next queue entry by given duration.

```javascript
redoid.delay(duration);
```

#### trigger

Trigger callback when transition reaches this transition step.

```javascript
redoid.trigger(callback);
```

#### stop

Interrupt the current transition and clear the queue. When firing this method, no callbacks set by `trigger` get called.

```javascript
redoid.stop();
```

#### setLoopTransition

Set the `loopTransition` option.

```javascript
redoid.setLoopTransition(loopTransition);
```

#### setIdleColor

Set the `idleColor` option.

```javascript
redoid.setIdleColor(idleColor);
```

## License

The MIT License (MIT)

Copyright (c) 2016 Fränz Friederes <[fraenz@frieder.es](mailto:fraenz@frieder.es)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
