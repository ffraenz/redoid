/*!
 * redoid
 * Copyright (c) 2016 Fränz Friederes <fraenz@frieder.es>
 * MIT Licensed
 */

'use strict';

var piblaster = require('pi-blaster.js');
var easingFunctions = require('./easing-functions');

/**
 * Redoid prototype
 */

var StaticRedoid = function(options) {
    this._init.apply(this, arguments);
};

var Redoid = StaticRedoid.prototype;

/**
 * Initialize the dioder.
 *
 * @param {Array|null} options
 * @private
 */

Redoid._init = function(options)
{
    options = options || {};

    // attributes
    this._color = null;
    this._queue = [];
    this._loopIntervalPointer = null;
    this._idleTimeoutPointer = null;
    this._isInIdleTransition = false;

    // options
    var color = this._interpretColor(options.color || '#000000');
    this._colorComponentPins = options.colorComponentPins || [4, 17, 18];
    this._loopInterval = options.loopInterval || 25;
    this._defaultEasing = options.defaultEasing || 'easeInOutQuad';
    this._idleCallback = options.idleCallback || null;
    this._idleTimeout = options.idleTimeout || 0;
    this._idleColor = this._interpretColor(options.idleColor) || null;
    this._idleColorTransitionDuration = options.idleColorTransitionDuration || 4000;
    this._loopTransition = options.loopTransition || false;

    // apply initial color
    this._applyColor(color);
};

/**
 * Fires at each tick of the transition loop.
 *
 * @private
 */

Redoid._loop = function()
{
    var time = this._loopInterval;

    // fill up elapsed time of entries in queue until we reach the current one
    var entry = null;
    while (entry === null && this._queue.length > 0)
    {
        // get current queue entry
        var entry = this._queue[0];

        // add elapsed time
        entry.elapsedTime += time;

        // calculate time overflow
        time = Math.max(entry.elapsedTime - entry.duration, 0);

        // check if this entry has been completed
        if (entry.elapsedTime >= entry.duration)
        {
            // remove entry from queue
            this._queue.splice(0, 1);

            // call the callback if available
            if (entry.callback !== null) {
                entry.callback(this);
            }

            if (this._loopTransition && !this._isInIdleTransition)
            {
                // reset elapsed time and requeue this entry
                entry.elapsedTime = 0;
                entry.from = this.getLastQueuedColor();
                this._queue.push(entry);
            }

            if (this._queue.length === 0)
            {
                // apply the to color of the last entry in queue
                this._applyColor(entry.to);
            }
            
            // this transition step is completed
            entry = null;
        }
    }

    if (entry === null)
    {
        // reached end of queue

        // clear loop interval
        clearInterval(this._loopIntervalPointer);
        this._loopIntervalPointer = null;

        // transition completed
        if (this._idleTimeout > 0)
        {
            this._idleTimeoutPointer = setTimeout(
                this._onIdle.bind(this), this._idleTimeout);
        }
        else
        {
            this._onIdle();
        }

        return;
    }

    // loop tick fires inside transition step
    // calculate intermediate color
    var intermediateColor = [0, 0, 0];

    // ease time
    var percent = (entry.elapsedTime / entry.duration);
    var easedTime = this._easeTime(percent, entry.easing);

    // go through components
    for (var i = 0; i < 3; i ++)
    {
        // calculate intermediate component value
        intermediateColor[i] =
            (1 - easedTime) * entry.from[i]
            + easedTime * entry.to[i];
    }

    // apply color
    this._applyColor(intermediateColor);
};

/**
 * Ease time using a named or directly provided function.
 *
 * @param {int} time
 * @param {String|Function} easing
 * @return {int}
 * @private
 */

Redoid._easeTime = function(time, easing)
{
    if (typeof easing === 'function')
    {
        // use provieded easing function
        return easing(time);
    }
    
    if (
        typeof easing === 'string' &&
        easingFunctions[easing] !== undefined
    ) {
        // use known easing function
        return (easingFunctions[easing])(time);
    }

    // use default easing
    return easingFunctions['easeInOutQuad'];
};

/**
 * Apply color.
 *
 * @param {Array} color
 * @return {Redoid} for chaining
 * @private
 */

Redoid._applyColor = function(color)
{
    // apply each changed color component
    for (var i = 0; i < 3; i ++) {
        if (this._color === null || color[i] != this._color[i]) {
            piblaster.setPwm(this._colorComponentPins[i], color[i] / 255.0);
        }
    }

    // track current color
    this._color = color;

    return this;
};

/**
 * Queue transition.
 *
 * @param {Array|String} color
 * @param {int} duration
 * @param {String|Function} easing
 * @param {Function|null} callback
 * @return {Redoid} for chaining
 * @private
 */

Redoid._queueTransition = function(color, duration, easing, callback)
{
    // stop idle transition before queuing next transition
    if (this._isInIdleTransition) {
        this._isInIdleTransition = false;
        this.stop();
    }

    var toColor = this._interpretColor(color);
    callback = callback || null;

    if (
        !this._loopTransition &&
        this._queue.length === 0 &&
        duration < this._loopInterval * 0.5
    ) {
        // immediately apply color
        this._applyColor(toColor);

        if (callback !== null) {
            callback(this);
        }

        // no need to add an entry to the queue
        return this;
    }

    var fromColor = this.getLastQueuedColor();

    // queue
    this._queue.push({
        from: fromColor,
        to: toColor,
        elapsedTime: 0,
        duration: duration,
        easing: easing,
        callback: callback
    });

    // clear idle timeout
    clearTimeout(this._idleTimeoutPointer);

    // start transition loop if not already running
    if (this._loopIntervalPointer === null)
    {
        this._loopIntervalPointer =
            setInterval(this._loop.bind(this), this._loopInterval);
    }

    return this;
};

/**
 * Returns `true` when currently inside transition.
 *
 * @return {Boolean}
 * @public
 */

Redoid.isTransitioning = function()
{
    return (this._loopIntervalPointer !== null && !this._isInIdleTransition);
};

/**
 * Event triggered when redoid is idle.
 *
 * @private
 */

Redoid._onIdle = function()
{
    // call idle callback if available
    if (this._idleCallback !== null) {
        this._idleCallback(this);
    }

    // idle callback could have changed idle state
    if (!this.isTransitioning() && this._idleColor !== null)
    {
        // check if the current color is different from the idle color
        if (!this.isColorEqual(this._color, this._idleColor))
        {
            // transition to idle color
            this.transition(this._idleColor, this._idleColorTransitionDuration);

            // this transition gets cancelled when anything else gets queued
            this._isInIdleTransition = true;

            return;
        }
    }
};

/**
 * Interpret color.
 *
 * @param {Array|String} color
 * @return {Array}
 * @private
 */

Redoid._interpretColor = function(color)
{
    if (typeof color === 'string')
    {
        return this._hexValueToColor(color);
    }
    
    if (
        Object.prototype.toString.call(color) === '[object Array]'
        && color.length == 3
    ) {
        return [
            parseInt(color[0]),
            parseInt(color[1]),
            parseInt(color[2])
        ];
    }

    return color;
};

/**
 * Convert hex value to color.
 *
 * @param {String} hexValue
 * @return {Array}
 * @private
 */

Redoid._hexValueToColor = function(hexValue)
{
    // expand shorthand (#03F) to full form (#0033FF)
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hexValue = hexValue.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    // retrieve components
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    return (result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null);
};

/**
 * Convert color to hex value.
 *
 * @param {Array} color
 * @return {String}
 * @private
 */

Redoid._colorToHexValue = function(color)
{
    var hexValue = '#';
    for (var i = 0; i < 3; i ++) {
        var componentHexValue = color[i].toString(16);
        hexValue += (componentHexValue.length === 1 ? '0' : '') + componentHexValue;
    }
    return hexValue;
};

/**
 * Check if colors are equal.
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Boolean}
 * @public
 */

Redoid.isColorEqual = function(a, b)
{
    // interpret colors
    var a = this._interpretColor(a);
    var b = this._interpretColor(b);

    // compare color components
    return (
        a[0] == b[0] &&
        a[1] == b[1] &&
        a[2] == b[2]
    );
};

/**
 * Return the current color. (e.g. `[255, 0, 0]`)
 *
 * @return {Array}
 * @public
 */

Redoid.getColor = function()
{
    return this._color;
};

/**
 * Return hex value of current color. (e.g. `#ff0000`)
 *
 * @return {String}
 * @public
 */

Redoid.getColorHexValue = function()
{
    return this._colorToHexValue(this._color);
};

/**
 * Return the last queued color. If `loopTransition` is set to `true`,
 * this value changes during transition.
 *
 * @return {Array}
 * @public
 */

Redoid.getLastQueuedColor = function()
{
    if (this._queue.length > 0) {
        return this._queue[this._queue.length - 1].to;
    }
    return this._color;
};

/**
 * Return hex value of last queued color.
 *
 * @return {String}
 * @public
 */

Redoid.getLastQueuedColorHexValue = function()
{
    return this._colorToHexValue(this.getLastQueuedColor());
};

/**
 * Queue transition from the last queued color (obtained
 * by `getLastQueuedColor`) to the color provided.
 *
 * @param {Array|String} color
 * @param {int|null} duration
 * @param {String|Function|null} easing
 * @return {Redoid} for chaining
 * @public
 */

Redoid.transition = function(color, duration, easing)
{
    return this._queueTransition(
        color,
        duration || 1000,
        easing || this._defaultEasing
    );
};

/**
 * Queue color change to color provided.
 *
 * @param {Array|String} color
 * @return {Redoid} for chaining
 * @public
 */

Redoid.change = function(color)
{
    return this._queueTransition(color, 0, 'linear');
};

/**
 * Queue turn off.
 *
 * @param {Int|null} duration
 * @return {Redoid} for chaining
 * @public
 */

Redoid.turnOff = function(duration)
{
    return this._queueTransition('#000000', duration || 0, 'linear');
};

/**
 * Delay next queue entry by given duration.
 *
 * @param {int} delay
 * @return {Redoid} for chaining
 * @public
 */

Redoid.delay = function(delay)
{
    // animate to same color to create delay between transition steps
    return this._queueTransition(this.getLastQueuedColor(), delay, 'linear');
};

/**
 * Trigger callback when transition reaches this transition step.
 *
 * @param {Function|null} callback
 * @return {Redoid} for chaining
 * @public
 */

Redoid.trigger = function(callback)
{
    return this._queueTransition(this.getLastQueuedColor(), 0, 'linear', callback);
};

/**
 * Interrupt the current transition and clear the queue.
 * When firing this method, no callbacks set by `trigger` get called.
 *
 * @return {Redoid} for chaining
 * @public
 */

Redoid.stop = function()
{
    // clear queued entries if there are any
    if (this._queue.length > 0) {
        this._queue = [];
    }
    return this;
};

/**
 * If set to `true` completed transition steps will be added
 * to the end of the queue resulting in a never-ending transition loop.
 *
 * @param {Boolean} loopTransition
 * @return {Redoid} for chaining
 * @public
 */

Redoid.setLoopTransition = function(loopTransition)
{
    this._loopTransition = loopTransition;
    return this;
};

/**
 * Idle color to transition to when the idle event is triggered.
 * This feature is disabled if set to `null`.
 *
 * @param {Array|String|null} idleColor
 * @return {Redoid} for chaining
 * @public
 */

Redoid.setIdleColor = function(idleColor)
{
    this._idleColor = (this._idleColor !== null ?
        this._interpretColor(idleColor) : null);
    return this;
};

/**
 * Populate module exports
 */

module.exports = function(options) {
    return new StaticRedoid(options);
};

module.exports.easingFunctions = easingFunctions;
