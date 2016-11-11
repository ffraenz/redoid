redoid
======

A Node.js package that provides an API to control your IKEA Dioder LED light strip on your Raspberry Pi. Read *redoid* the other way round to understand where its name comes from.

## Installation

### Connect Dioder to Raspberry Pi

Please notice that you need to change the circuit board of your Dioder control unit physically in order to connect it to the Raspberry Pi. After that you will not be able to use the buttons on the control unit to change the behavior of the LEDs.

![Dioder control unit circuit board](https://cloud.githubusercontent.com/assets/1041468/14026264/59c19de4-f1f2-11e5-82ae-3eb507588dcc.jpg)

- Open the IKEA Dioder control unit carefully with a screwdriver.
- Remove the micro controller `1` from the circuit board.
- Solder 4 wires to `2`, `R`, `G` and `B`.
- Connect `2` to a `GND` pin on the Raspberry Pi.
- Connect `R`, `G` and `B` to GPIO pins (preferably `GPIO4`, `GPIO17` and `GPIO18`) on the Raspberry Pi.

### Install Dependencies

Install the pi-blaster daemon ([instructions](https://github.com/sarfata/pi-blaster)) and Node.js with npm.

Finally install `redoid` using npm:

    npm install redoid


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

You can create one or more `Redoid` instances by calling its constructor. The constructor takes one optional associative array with following keys to configure the instance:

- **color** – Initial color to apply when an instance gets created.
- **colorComponentPins** – Array holding 3 integer values of the RGB GPIO pins dioder is connected to.
- **applyColorCallback** – Custom function that replaces the default mechanism for applying colors. This feature is disabled if set to `null`.
- **loopInterval** – Duration between transitioning ticks.
- **defaultEasing** – Default easing
- **idleTimeout** – Delay between the queue being idle and the idle event getting triggered.
- **idleCallback** – Function that gets called when the idle event gets triggered.
- **idleColor** – Idle color to transition to when the idle event gets triggered. This feature is disabled if set to `null`.
- **idleColorTransitionDuration** – Idle color transition duration
- **loopTransition** – If set to `true` completed transition steps will be added to the end of the queue resulting in a never-ending transition loop.

The following instance gets configured with the default values:

```javascript
var Redoid = require('redoid');

var redoid = Redoid({
    color: '#ffffff',
    colorComponentPins: [4, 17, 18],
    applyColorCallback: null,
    loopInterval: 25,
    defaultEasing: 'easeInOutQuad',
    idleTimeout: 0,
    idleCallback: null,
    idleColor: null,
    idleColorTransitionDuration: 4000,
    loopTransition: false
});
```

### Color

Color values are expected to be rgb hexadecimal strings or arrays having 3 integer values representing the rgb color components.

```javascript
// hexadecimal
var color = '#ff0000';

// shorthand hexadecimal
var color = '#f00';

// color components
var color = [255, 0, 0];
```


### Easing

Easing values are expected to be a `function` or one of the following keys: `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeInOutQuart`, `easeInQuint`, `easeOutQuint`, `easeInOutQuint`.

```javascript
// known easing function by name
var easing = 'easeInOutQuad';

// easing function
var easing = function(t) {
    return t<.5 ? 2*t*t : -1+(4-2*t)*t;
}
```

### API

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

#### isColorValid

Check if color is valid.

```javascript
var colorValid = redoid.isColorValid(color)
```

#### isColorEqual

Check if colors are equal.

```javascript
var colorEqual = redoid.isColorEqual(a, b)
```

#### isTransitioning

Returns `true` when currently inside transition.

```javascript
var transitioning = redoid.isTransitioning();
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
