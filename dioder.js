
(function() {

	'use strict';

	var piblaster = require('pi-blaster.js');
	var Color = require('color');

	var EASING_FUNCTIONS = {
		linear: function(t) { return t },
		easeInQuad: function(t) { return t*t },
		easeOutQuad: function(t) { return t*(2-t) },
		easeInOutQuad: function(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
		easeInCubic: function(t) { return t*t*t },
		easeOutCubic: function(t) { return (--t)*t*t+1 },
		easeInOutCubic: function(t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
		easeInQuart: function(t) { return t*t*t*t },
		easeOutQuart: function(t) { return 1-(--t)*t*t*t },
		easeInOutQuart: function(t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
		easeInQuint: function(t) { return t*t*t*t*t },
		easeOutQuint: function(t) { return 1+(--t)*t*t*t*t },
		easeInOutQuint: function(t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
	};

	module.exports = function(options)
	{
		return new Dioder(options);
	};

	var Dioder = (function(options)
	{
		// attributes
		this._color = null;
		this._defaultEasing = null;
		this._colorComponentPins = null;

		this._animationQueue = [];
		this._animationLoopInterval = null;
		this._animationLoopTickDuration = null;
		this._loopAnimationQueue = false;

		this._idleCallback = null;

		// init
		this.init(options);
	});

	Dioder.prototype.init = function(options)
	{
		options = options || {};

		// read options
		var color = options.color || Color('#000000');
		this._defaultEasing = options.defaultEasing || 'easeInOutQuad';
		this._colorComponentPins = options.colorComponentPins || [4, 17, 18];
		this._animationLoopTickDuration = options.animationInterval || 25;
		this._idleCallback = options.idleCallback || null;
		this._loopAnimationQueue = options.loopQueue || false;

		// apply initial color
		this._applyColor(color);
	};

	Dioder.prototype.animateTo = function(color, duration, easing, callback)
	{
		var from = this.getLastQueuedColor();

		// queue animation step
		this._animationQueue.push({
			from: from,
			to: color,
			time: 0,
			duration: (duration !== undefined ? duration : 1000),
			easing: easing || this._defaultEasing,
			callback: callback || null
		});

		if (this._animationLoopInterval === null)
		{
			// turn on animation loop
			this._animationLoopInterval = setInterval(
				this._animationLoop.bind(this),
				this._animationLoopTickDuration);
		}

		return this;
	};

	Dioder.prototype.changeTo = function(color, callback)
	{
		return this.animateTo(color, 0, 'linear', callback);
	};

	Dioder.prototype.delay = function(delay, callback)
	{
		// animate to the same color in delay
		return this.animateTo(this.getLastQueuedColor(), delay, 'linear', callback);
	};

	Dioder.prototype.stop = function()
	{
		if (this._animationQueue.length > 0)
		{
			// remove all queued entries
			this._animationQueue = [];
		}

		return this;
	};

	Dioder.prototype.setLoopQueue = function(loopQueue)
	{
		this._loopAnimationQueue = loopQueue;
		return this;
	};

	Dioder.prototype._animationLoop = function()
	{
		var time = this._animationLoopTickDuration;

		// go through queue to find the current entry
		var currentEntry = null;
		while (currentEntry === null && this._animationQueue.length > 0)
		{
			// get current stack entry
			var currentEntry = this._animationQueue[0];

			// add up time
			currentEntry.time += time;

			// calculate how much time is left
			time = Math.max(currentEntry.time - currentEntry.duration, 0);

			// check if this entry has been completed
			if (currentEntry.time >= currentEntry.duration)
			{
				// remove entry from queue
				this._animationQueue.splice(0, 1);

				// call the callback if available
				if (currentEntry.callback !== null)
				{
					currentEntry.callback(this);
				}

				if (this._loopAnimationQueue)
				{
					// reset and requeue this entry
					currentEntry.time = 0;
					currentEntry.from = this.getLastQueuedColor();
					this._animationQueue.push(currentEntry);
				}

				// apply the entry's end color if it is the last one
				if (this._animationQueue.length === 1)
				{
					this._applyColor(currentEntry.to);
				}
				
				// this animation step is completed
				currentEntry = null;
			}
		}

		if (currentEntry !== null)
		{
			// we are inside an animation step
			// calculate intermediate color
			var fromColorComponents = currentEntry.from.rgbArray();
			var intermediateColorComponents = [0, 0, 0];
			var toColorComponents = currentEntry.to.rgbArray();

			// ease time
			var easedTime = this._easeTime(
				currentEntry.time / currentEntry.duration,
				currentEntry.easing);

			// go through components
			for (var i = 0; i < 3; i ++)
			{
				// calculate intermediate component value
				intermediateColorComponents[i] =
					(1 - easedTime) * fromColorComponents[i]
					+ easedTime * toColorComponents[i];
			}

			// compose color
			var intermediateColor = Color().rgb(intermediateColorComponents);

			// apply color
			this._applyColor(intermediateColor);
		}
		else
		{
			// turn off animation loop
			clearInterval(this._animationLoopInterval);
			this._animationLoopInterval = null;

			// the queue comes to an end
			if (this._idleCallback !== null)
			{
				this._idleCallback(this);
			}
		}
	};

	Dioder.prototype._easeTime = function(time, easing)
	{
		if (typeof easing === 'function')
		{
			// use given easing function
			return easing(time);
		}
		else if (typeof easing === 'string' && EASING_FUNCTIONS[easing] !== undefined)
		{
			// use known easing function
			return (EASING_FUNCTIONS[easing])(time);
		}

		// use default easing
		return EASING_FUNCTIONS['easeInOutQuad'];
	}

	Dioder.prototype.getColor = function()
	{
		return this._color;
	};

	Dioder.prototype.getLastQueuedColor = function()
	{
		var last = this._color;

		if (this._animationQueue.length > 0)
		{
			// take the color of the last stack entry
			last = this._animationQueue[this._animationQueue.length - 1].to;
		}

		return last;
	};

	Dioder.prototype._applyColor = function(color)
	{
		var colorComponents = color.rgbArray();
		var currentColorComponents = this._color ? this._color.rgbArray() : null;

		// go through components
		for (var i = 0; i < 3; i ++)
		{
			if (
				// check if this component has been changed
				currentColorComponents === null
				|| colorComponents[i] != currentColorComponents[i])
			{
				piblaster.setPwm(this._colorComponentPins[i], colorComponents[i] / 255.0);
			}
		}

		// keep track of the current color
		this._color = color;
	};

})();
