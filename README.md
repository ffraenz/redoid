dioder
======

A node package that gives your Raspberry Pi control over your IKEA DIODER LED light strip.

## Install

Make sure you have `node` and `npm` installed on your Raspberry Pi.

Install the [pi-blaster daemon](https://github.com/sarfata/pi-blaster).

Finally install `dioder`:

    npm install dioder


## Usage

### Constructor

Creates a dioder object. You don't need to provide any options, these are the defaults.

```javascript
var Dioder = require('dioder');
var Color = require('color');

var dioder = Dioder({
    color: Color('#ffffff'),
    easing: function(t, b, c, d) { ... },
    colorComponentPins: [4, 17, 18],
    animationInterval: 25
});
```

### changeTo

Changes the color without transition. Calls the callback when completed.

```javascript
changeTo(color, [callback]);
```

### animateTo

Animates from the current color to a specified one in a given duration and easing. Calls the callback when completed.

```javascript
animateTo(color, transitionDuration, [callback], [easing]);
```

### delay

Delays the next queued animations by a given duration.

```javascript
delay(duration);
```

### stop

Interrupts the current transition and clears the queue. In this case, no callbacks (sent to `changeTo` or `animateTo`) are called.

```javascript
stop();
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
function animateToRed() {
    dioder.animateTo(Color('#ff0000'), 1500, animateToBlack);
}

function animateToBlack() {
    dioder.animateTo(Color('#300000'), 1500, animateToRed);
}

// start animation
animateToBlack();

// stop animation after 30 seconds
setTimeout(function() {
    dioder.stop();
}, 30000);
```


## License

The MIT License (MIT)

Copyright (c) 2013 Fränz Friederes <[fraenz@frieder.es](mailto:fraenz@frieder.es)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
