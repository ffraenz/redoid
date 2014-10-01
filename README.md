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
var Color = require('color');

var dioder = Dioder({
    color: Color('#ffffff'),
    defaultEasing: 'easeInOutQuad',
    colorComponentPins: [4, 17, 18],
    animationInterval: 25,
    idleCallback: null,
    loopQueue: false
});
```

### Color

Color values are expected to be created by the [harthur/color](https://github.com/harthur/color) library. Only RGB values (no alpha) are supported.

```javascript
var color = Color('#ffffff');
var color = Color('rgb(255, 255, 255)');
var color = Color().rgb(255, 255, 255);
var color = Color().rgb([255, 255, 255]);
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

Returns the current color.

```javascript
dioder.getColor();
```

#### getLastQueuedColor

Returns the ending color of the animation queue. If `loopQueue` is set to `true`, this value changes during animation.

```javascript
dioder.getLastQueuedColor();
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

## Examples

### Simple Notification

```javascript
dioder
    .stop()
    .animateTo(Color('#249db3'), 250)
    .animateTo(Color('#ffffff'), 4000);
```

### Red Alert

```javascript
dioder
    .stop()
    .setLoopQueue(true)
    .animateTo(Color('#ff0000'), 1500)
    .animateTo(Color('#300000'), 1500);
```

### Easing

```javascript
var firstColor = Color('#ffffff');
var secondColor = Color('#ff0000');

var dioder = Dioder({
    color: firstColor
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

    // wait for 1 second and log the easing method
    dioder.delay(1000, function() { console.log('' + this); }.bind(easing));
    
    // animate to the other color using easing
    dioder.animateTo((i % 2 !== 0 ? firstColor : secondColor), 2000, easing);
}
```


## License

The MIT License (MIT)

Copyright (c) 2013 Fränz Friederes <[fraenz@frieder.es](mailto:fraenz@frieder.es)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
