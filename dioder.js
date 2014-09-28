
(function() {

	'use strict';

	var piblaster = require('pi-blaster.js');
	var Color = require('color');

	module.exports = function(options)
	{
		return new Dioder(options);
	};

	var Dioder = (function(options)
	{
		// attributes
		this._color = null;
		this._easing = null;
		this._colorComponentPins = null;

		this._animationQueue = [];
		this._animationLoopInterval = null;
		this._animationLoopTickDuration = null;

		// init
		this.init(options);
	});

	Dioder.prototype.init = function(options)
	{
		options = options || {};

		// read options
		var color = options.color || Color('#000000');
		this._easing = options.easing || this.easeInOutQuad;
		this._colorComponentPins = options.colorComponentPins || [4, 17, 18];
		this._animationLoopTickDuration = options.animationInterval || 25;

		// apply initial color
		this._applyColor(color);
	};

	Dioder.prototype.easeInOutQuad = function(t, b, c, d)
	{
		t /= d / 2;
		if (t < 1)
			return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	};

	Dioder.prototype.animateTo = function(color, transitionDuration, callback, easing)
	{
		var from = this._getLastQueuedColor();

		// queue animation step
		this._animationQueue.push({
			from: from,
			to: color,
			time: 0,
			duration: transitionDuration,
			easing: easing ? easing : this._easing,
			callback: callback ? callback : null
		});

		if (this._animationLoopInterval === null)
		{
			// turn on animation loop
			this._animationLoopInterval = setInterval(
				this._animationLoop.bind(this), this._animationLoopTickDuration);
		}

		return this;
	};

	Dioder.prototype.changeTo = function(color, callback)
	{
		return this.animateTo(color, 0, callback);
	};

	Dioder.prototype.delay = function(delay)
	{
		// animate to the same color in delay
		return this.animateTo(this._getLastQueuedColor(), delay, null);
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

	Dioder.prototype._getLastQueuedColor = function()
	{
		var last = this._color;

		if (this._animationQueue.length > 0)
		{
			// take the color of the last stack entry
			last = this._animationQueue[this._animationQueue.length - 1].to;
		}

		return last;
	}

	Dioder.prototype._animationLoop = function()
	{
		if (this._animationQueue.length > 0)
		{
			var time = this._animationLoopTickDuration;

			// go through queue to find the current entry
			var currentEntry = null;
			while (time > 0 && this._animationQueue.length > 0)
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
					// apply it's to color if there is no entry following
					if (this._animationQueue.length === 1)
					{
						this._applyColor(currentEntry.to);
					}

					// remove entry from queue
					this._animationQueue.splice(0, 1);

					// call the callback if available
					if (currentEntry.callback !== null)
					{
						currentEntry.callback(this);
					}
					
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

				// go through components
				for (var i = 0; i < 3; i ++)
				{
					// calculate intermediate component value
					intermediateColorComponents[i] = currentEntry.easing(
						currentEntry.time,
						fromColorComponents[i],
						toColorComponents[i] - fromColorComponents[i],
						currentEntry.duration
					);
				}

				// compose color
				var intermediateColor = Color().rgb(intermediateColorComponents);

				// apply color
				this._applyColor(intermediateColor);
			}
		}
		else
		{
			// turn off animation loop
			clearInterval(this._animationLoopInterval);
			this._animationLoopInterval = null;
		}
	}

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

		// keep track of the displayed color
		this._color = color;
	};

})();
