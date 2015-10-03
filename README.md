dioder
======

A node package that gives your Raspberry Pi control over your Ikea Dioder LED light strip.

## Installation

- Connect your Dioder LED light strip to your Raspberry Pi ([instructions](http://krizzblog.de/2013/12/the-pidioder/)).
- Install the pi-blaster daemon ([instructions](https://github.com/sarfata/pi-blaster)).
- Make sure you have `node` and `npm` installed on your Raspberry Pi.

Finally install `dioder`:

    $ npm install dioder


## Usage

### Instance

Creates a dioder object. You don't need to provide any options, these are the defaults.

```javascript
var Dioder = require('dioder');

var dioder = Dioder({
    color: '#ffffff',
    defaultEasing: 'easeInOutQuad',
    colorComponentPins: [4, 17, 18],
    animationInterval: 25,
    idleCallback: null,
    loopQueue: false
});
```

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
    return t<.5 ? 2*t*t : -1+(4-2*t)*t
}

// expressed by a key
var easing = 'easeInOutQuad';
```


### Methods

#### getColor

Returns the current color. (e.g. `#ff0000`)

```javascript
dioder.getColor();
```

#### getColorComponents

Returns the components of the current color. (e.g. `[255, 0, 0]`)

```javascript
dioder.getColorComponents();
```

#### getLastQueuedColor

Returns the ending color of the animation queue. If `loopQueue` is set to `true`, this value changes during animation.

```javascript
dioder.getLastQueuedColor();
```

#### getLastQueuedColorComponents

Returns the components of the last queued color.

```javascript
dioder.getLastQueuedColorComponents();
```

#### changeTo

Changes the color without transition. Calls the callback when completed.

```javascript
dioder.changeTo(color, [callback]);
```

#### animateTo

Animates from the previous color (obtained by `getLastQueuedColor`) to a specified one in a given duration and easing. Calls the callback when completed.

```javascript
dioder.animateTo(color, [duration], [easing], [callback]);
```

#### delay

Delays the next queued animations by a given duration. Calls the callback when completed.

```javascript
dioder.delay(duration, [callback]);
```

#### stop

Interrupts the current transition and clears the queue. In this case, no callbacks (sent to `changeTo`, `animateTo` or `delay`) are called.

```javascript
dioder.stop();
```

#### setLoopQueue

If set to `true` completed animations will be readded to the end of the animation queue resulting in a never-ending animation loop.

```javascript
dioder.setLoopQueue(loopQueue);
```

#### turnOff

Turns off the LED-strips.

```javascript
dioder.turnOff(callback);
```

## Examples

### Simple Notification

```javascript
var dioder = require('dioder')({
    color: '#ffffff'
});

dioder
    .animateTo('#249db3', 250)
    .animateTo('#ffffff', 4000);
```

### Red Alert

```javascript
var dioder = require('dioder')({
    color: '#300000'
});

dioder
    .setLoopQueue(true)
    .animateTo('#ff0000', 1500)
    .animateTo('#300000', 1500);
```

### Easing

```javascript
var dioder = require('dioder')({
    color: '#ffffff'
});

var easingFunctions = [
    'linear',
    'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
    'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
    'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
    'easeInQuint', 'easeOutQuint', 'easeInOutQuint'
];

for (var i = 0; i < easingFunctions.length; i ++)
{
    var easing = easingFunctions[i];

    // wait for 1 second and log the easing method used
    dioder.delay(1000, function() {
        console.log('' + this);
    }.bind(easing));

    // animate to the other color using easing
    dioder.animateTo((i % 2 !== 0 ? '#ffffff' : '#ff0000'), 2000, easing);
}
```


## License

The MIT License (MIT)

Copyright (c) 2013 Fränz Friederes <[fraenz@frieder.es](mailto:fraenz@frieder.es)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
