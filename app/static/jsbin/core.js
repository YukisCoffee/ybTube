"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }

        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }

      return n[i].exports;
    }

    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
      o(t[i]);
    }

    return o;
  }

  return r;
})()({
  1: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.registerComponent = void 0;

    var events = require("./../vendor/cferdinandi/events/events");

    var componentsRegistry = [];

    function registerComponent(component) {
      componentsRegistry.push(component);
      initComponent(component);
    }

    exports.registerComponent = registerComponent;

    function initComponent(component) {
      for (var _i = 0, _Object$keys = Object.keys(component.events); _i < _Object$keys.length; _i++) {
        var name = _Object$keys[_i];
        var selector = component.selector;
        var callback = component.events[name]; // Complex declaration

        if ("function" != typeof callback) {
          var data = callback;
          selector = data.selector;
          callback = data.function;
        }

        events.on(name, selector, callback);
      }

      component.unload = unloadComponent.bind(component);
    }
    /**
     * TODO: rework to match initComponent progress
     */


    function unloadComponent(component) {
      if (null == component) component = this;

      for (var _i2 = 0, _Object$keys2 = Object.keys(component.events); _i2 < _Object$keys2.length; _i2++) {
        var name = _Object$keys2[_i2];
        var callback = component.events[name];
        events.off(name, "." + component.selector, callback);
      }

      delete component.unload;
    }
  }, {
    "./../vendor/cferdinandi/events/events": 8
  }],
  2: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    }); // Import modules base

    var componentsBase_1 = require("./base/componentsBase"); // Import and load all modules


    var PaperRippleComponent_1 = require("./ui/paper/ripple/PaperRippleComponent");

    function loadComponents() {
      (0, componentsBase_1.registerComponent)(PaperRippleComponent_1.PaperRippleComponent);
    }

    exports.default = loadComponents;
  }, {
    "./base/componentsBase": 1,
    "./ui/paper/ripple/PaperRippleComponent": 6
  }],
  3: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    require("./polyfill/Element.closest");

    require("./polyfill/Element.remove");

    var components_1 = require("./components");

    function boot() {
      (0, components_1.default)();
    }

    function init() {
      document.addEventListener("DOMContentLoaded", function _() {
        boot();
        document.removeEventListener("DOMContentLoaded", _);
      });
    }

    init();
  }, {
    "./components": 2,
    "./polyfill/Element.closest": 4,
    "./polyfill/Element.remove": 5
  }],
  4: [function (require, module, exports) {
    /**
     * Element.closest() polyfill
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
     */
    if (!Element.prototype.closest) {
      if (!Element.prototype.matches) {
        // @ts-ignore
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
      }

      Element.prototype.closest = function (s) {
        var el = this;
        var ancestor = this;
        if (!document.documentElement.contains(el)) return null;

        do {
          if (ancestor.matches(s)) return ancestor;
          ancestor = ancestor.parentElement;
        } while (ancestor !== null);

        return null;
      };
    }
  }, {}],
  5: [function (require, module, exports) {
    (function (arr) {
      arr.forEach(function (item) {
        if (item.hasOwnProperty('remove')) {
          return;
        }

        Object.defineProperty(item, 'remove', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: function remove() {
            this.parentNode && this.parentNode.removeChild(this);
          }
        });
      });
    })([Element.prototype, CharacterData.prototype, DocumentType.prototype].filter(Boolean));
  }, {}],
  6: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.PaperRippleComponent = void 0;

    var paperRipple_1 = require("./paperRipple");

    exports.PaperRippleComponent = {
      name: "PaperRippleComponent",
      selector: ".paper-ripple",
      events: {
        mousedown: paperRipple_1.RippleEventAdapter.handleMouseDown
        /*,
        focusin: {
        selector: "*",
        function: Ripple.handleFocus
        }*/

      }
    };
  }, {
    "./paperRipple": 7
  }],
  7: [function (require, module, exports) {
    "use strict";
    /**
     * Material "Paper Ripple" effect implementation
     * without Polymer.js
     *
     * Much of the style of this code is taken from the
     * official implementation of the effect, per:
     * https://github.com/PolymerElements/paper-ripple/blob/master/paper-ripple.js
     *
     *
     * @license
     * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
     * found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
     * part of the polymer project is also subject to an additional IP rights grant
     * found at http://polymer.github.io/PATENTS.txt
     */

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.RippleEventAdapter = exports.Ripple = exports.HOST_SELECTOR = void 0;

    var events = require("./../../../vendor/cferdinandi/events/events");
    /**
     * General utility definitions
     */


    var Utility = /*#__PURE__*/function () {
      function Utility() {
        _classCallCheck(this, Utility);
      }

      _createClass(Utility, null, [{
        key: "distance",
        value: function distance(x1, y1, x2, y2) {
          var xDelta = x1 - x2;
          var yDelta = y1 - y2;
          return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
        }
        /**
         * "class is not allowed as a parameter name" :nerd:
         */

      }, {
        key: "getClass",
        value: function getClass(element, clazz) {
          return element.getElementsByClassName(clazz)[0];
        }
      }]);

      return Utility;
    }();

    Utility.now = window.performance && window.performance.now ? window.performance.now.bind(window.performance) : Date.now;
    /**
     * Element metrics utilities
     */

    var ElementMetrics = /*#__PURE__*/function () {
      function ElementMetrics(e) {
        _classCallCheck(this, ElementMetrics);

        this.element = e;
        this.width = this.boundingRect.width;
        this.height = this.boundingRect.height;
        this.top = this.boundingRect.top;
        this.right = this.boundingRect.right;
        this.bottom = this.boundingRect.bottom;
        this.left = this.boundingRect.left;
        this.size = Math.max(this.width, this.height);
      }

      _createClass(ElementMetrics, [{
        key: "boundingRect",
        get: function get() {
          return this.element.getBoundingClientRect();
        }
      }, {
        key: "farthestCornerDistanceFrom",
        value: function farthestCornerDistanceFrom(x, y) {
          var topLeft = Utility.distance(x, y, 0, 0);
          var topRight = Utility.distance(x, y, this.width, 0);
          var bottomLeft = Utility.distance(x, y, 0, this.height);
          var bottomRight = Utility.distance(x, y, this.width, this.height);
          return Math.max(topLeft, topRight, bottomLeft, bottomRight);
        }
      }]);

      return ElementMetrics;
    }();

    var MOUSE_BUTTON_LEFT = 0;
    var MOUSE_BUTTON_MIDDLE = 1;
    var MOUSE_BUTTON_RIGHT = 2;
    var MOUSE_BUTTON_FOUR = 3;
    var MOUSE_BUTTON_FIVE = 4;
    var MAX_RADIUS = 300;
    var DEFAULT_INITIAL_OPACITY = 0.25;
    var DEFAULT_OPACITY_DECAY_VELOCITY = 0.8;
    exports.HOST_SELECTOR = ".paper-ripple";
    var CONTAINER_CLASS = "paper-ripple-container";
    var CONTAINER_BACKGROUND = "background";
    var CONTAINER_WAVES = "waves";
    var WAVE_INSTANCE_CONTAINER = "wave-container";
    var rippleGlobalDisableLeftClick = false;

    var Ripple = /*#__PURE__*/function () {
      function Ripple() {
        _classCallCheck(this, Ripple);
      }

      _createClass(Ripple, null, [{
        key: "getHost",
        value: function getHost(element) {
          return element.closest(exports.HOST_SELECTOR);
        }
        /**
         * Property getters
         */

      }, {
        key: "getRecenters",
        value: function getRecenters(host) {
          return host.dataset.paperRippleRecenters ? true : false;
        }
      }, {
        key: "getCenter",
        value: function getCenter(host) {
          return host.dataset.paperRippleCenter ? true : false;
        }
      }, {
        key: "getInitialOpacity",
        value: function getInitialOpacity(host) {
          var a;

          if ((a = host.dataset.initialOpacity) && !isNaN(+a)) {
            return +a;
          }
        }
      }, {
        key: "getOpacityDecayVelocity",
        value: function getOpacityDecayVelocity(host) {
          var a;

          if ((a = host.dataset.opacityDecayVelocity) && !isNaN(+a)) {
            return +a; // Ugly ass js type cast cuz ts doesn't have working better syntax
          }
        }
      }, {
        key: "createContainer",
        value: function createContainer(element) {
          /**
           * <div class="paper-ripple-container">
           *     <div class="background"></div>
           *     <div class="waves"></div>
           * </div>
           */
          var a = document.createElement("DIV");
          var b = document.createElement("DIV");
          var c = document.createElement("DIV");
          a.className = "paper-ripple-container";
          b.className = "background";
          c.className = "waves";
          a.appendChild(b);
          a.appendChild(c);
          element.appendChild(a);
          return a;
        }
        /**
         * Create a ripple under an element
         */

      }, {
        key: "createRipple",
        value: function createRipple(element
        /** ts hack */
        ) {
          var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
          element._ripples = element._ripples || {};
          var uid = Math.floor(Math.random() * 100000); // Create a new ripple instance

          element._ripples[uid] = new RippleInstance([x, y], element, uid);
        }
      }]);

      return Ripple;
    }();

    exports.Ripple = Ripple;

    var RippleEventAdapter = /*#__PURE__*/function () {
      function RippleEventAdapter() {
        _classCallCheck(this, RippleEventAdapter);
      }

      _createClass(RippleEventAdapter, null, [{
        key: "handleMouseDown",
        value: // Shhhh
        // Don't worry about the any type
        // It's a TypeScript hack to assign
        // custom properties to HTML elements.
        function handleMouseDown(iceEvent) {
          var _Utility$getClass;

          // Skip if it's not a left click
          if (MOUSE_BUTTON_LEFT != iceEvent.originalEvent.button) return;
          var element = iceEvent.target; // Move element container to the child ripple container

          element = (_Utility$getClass = Utility.getClass(element, CONTAINER_CLASS)) !== null && _Utility$getClass !== void 0 ? _Utility$getClass : Ripple.createContainer(element);

          if (!rippleGlobalDisableLeftClick) {
            var x = iceEvent.originalEvent.clientX;
            var y = iceEvent.originalEvent.clientY; // Create a new ripple under this element with the 

            Ripple.createRipple(element, x, y); // Temporarily delegate mouseup event on everything

            events.once("mouseup", "*", RippleEventAdapter.handleMouseUp.bind(element));
          }
        }
      }, {
        key: "handleMouseUp",
        value: function handleMouseUp() {
          var element = this; // Message all ripple instances telling them
          // that the mouse is up

          for (var _i3 = 0, _Object$keys3 = Object.keys(element._ripples); _i3 < _Object$keys3.length; _i3++) {
            var i = _Object$keys3[_i3];
            var instance = element._ripples[i];
            instance.onMouseUp();
          }
        }
      }]);

      return RippleEventAdapter;
    }();

    exports.RippleEventAdapter = RippleEventAdapter;
    RippleEventAdapter.tabElement = null;

    var RippleInstance = /*#__PURE__*/function () {
      function RippleInstance(xy, element, instanceId) {
        _classCallCheck(this, RippleInstance);

        this.removeAfterAnimation = false; // Specific to this implementation, the ripple
        // effect starts with a mousedown state assumed.

        this.isMouseDown = true;
        this.mouseDownStart = 0;
        this.mouseUpStart = 0;
        this.ignoreMouseUp = false;
        this.resetInteractionState();
        this.instanceId = instanceId;
        this.element = element;
        this.host = Ripple.getHost(element);
        this.metrics = new ElementMetrics(element);
        this.background = Utility.getClass(element, CONTAINER_BACKGROUND);
        this.waves = Utility.getClass(element, CONTAINER_WAVES);
        this.waveContainer = this.createWaveContainer();
        this.wave = this.createWave();
        this.mouseDownStart = Utility.now();
        var xCenter = this.metrics.width / 2;
        var yCenter = this.metrics.height / 2;

        if (Ripple.getCenter(this.host) || null == xy[0]) {
          this.xStart = xCenter;
          this.yStart = yCenter;
        } else {
          this.xStart = xy[0] - this.metrics.left;
          this.yStart = xy[1] - this.metrics.top;
        }

        if (Ripple.getRecenters(this.host)) {
          this.xEnd = xCenter;
          this.yEnd = yCenter;
          this.slideDistance = Utility.distance(this.xStart, this.yStart, this.xEnd, this.yEnd);
        }

        this.maxRadius = this.metrics.farthestCornerDistanceFrom(this.xStart, this.yStart);
        this.waves.appendChild(this.waveContainer);
        this.waveContainer.style.top = (this.metrics.height - this.metrics.size) / 2 + "px";
        this.waveContainer.style.left = (this.metrics.width - this.metrics.size) / 2 + "px";
        this.waveContainer.style.width = this.metrics.size + "px";
        this.waveContainer.style.height = this.metrics.size + "px";
        this.wave = this.createWave();
        this.waveContainer.appendChild(this.wave); // console.log("Ripple ready to animate", this);

        this.animate();
      }

      _createClass(RippleInstance, [{
        key: "mouseDownElapsed",
        get: function get() {
          var elapsed;
          elapsed = Utility.now() - this.mouseDownStart;

          if (null != this.mouseUpStart) {
            elapsed -= this.mouseUpElapsed;
          }

          return elapsed;
        }
      }, {
        key: "mouseUpElapsed",
        get: function get() {
          return this.mouseUpStart ? Utility.now() - this.mouseUpStart : 0;
        }
      }, {
        key: "mouseDownElapsedSeconds",
        get: function get() {
          return this.mouseDownElapsed / 1000;
        }
      }, {
        key: "mouseUpElapsedSeconds",
        get: function get() {
          return this.mouseUpElapsed / 1000;
        }
      }, {
        key: "mouseInteractionSeconds",
        get: function get() {
          return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
        } //
        // Drawing
        //

      }, {
        key: "opacity",
        get: function get() {
          if (!this.mouseUpStart) return this.initialOpacity;
          return Math.max(0, this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity);
        }
      }, {
        key: "initialOpacity",
        get: function get() {
          var _Ripple$getInitialOpa;

          return (_Ripple$getInitialOpa = Ripple.getInitialOpacity(this.host)) !== null && _Ripple$getInitialOpa !== void 0 ? _Ripple$getInitialOpa : DEFAULT_INITIAL_OPACITY;
        }
      }, {
        key: "opacityDecayVelocity",
        get: function get() {
          var _Ripple$getOpacityDec;

          return (_Ripple$getOpacityDec = Ripple.getOpacityDecayVelocity(this.host)) !== null && _Ripple$getOpacityDec !== void 0 ? _Ripple$getOpacityDec : DEFAULT_OPACITY_DECAY_VELOCITY;
        }
      }, {
        key: "outerOpacity",
        get: function get() {
          var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
          var waveOpacity = this.opacity;
          return Math.max(0, Math.min(outerOpacity, waveOpacity));
        }
      }, {
        key: "translationFraction",
        get: function get() {
          return Math.min(1, this.radius / this.metrics.size * 2 / Math.sqrt(2));
        }
      }, {
        key: "xNow",
        get: function get() {
          if (this.xEnd) {
            return this.xStart + this.translationFraction * (this.xEnd - this.xStart);
          }

          return this.xStart;
        }
      }, {
        key: "yNow",
        get: function get() {
          if (this.yEnd) {
            return this.yStart + this.translationFraction * (this.yEnd - this.yStart);
          }

          return this.yStart;
        }
      }, {
        key: "isOpacityFullyDecayed",
        value: function isOpacityFullyDecayed() {
          return this.opacity < 0.01 && this.radius >= Math.min(this.maxRadius, MAX_RADIUS);
        }
      }, {
        key: "isRestingAtMaxRadius",
        value: function isRestingAtMaxRadius() {
          return this.opacity >= this.initialOpacity && this.radius >= Math.min(this.maxRadius, MAX_RADIUS);
        }
      }, {
        key: "isAnimationComplete",
        value: function isAnimationComplete() {
          return this.mouseUpStart ? this.isOpacityFullyDecayed() : this.isRestingAtMaxRadius();
        }
      }, {
        key: "shouldKeepAnimating",
        value: function shouldKeepAnimating() {
          return !this.isAnimationComplete();
        }
      }, {
        key: "radius",
        get: function get() {
          var width2 = this.metrics.width * this.metrics.width;
          var height2 = this.metrics.height * this.metrics.height;
          var waveRadius = Math.min(Math.sqrt(width2 + height2), MAX_RADIUS) * 1.1 + 5;
          var duration = 1.1 - 0.2 * (waveRadius / MAX_RADIUS);
          var timeNow = this.mouseInteractionSeconds / duration;
          var size = waveRadius * (1 - Math.pow(80, 0 - timeNow));
          return Math.abs(size);
        } //
        // Logic
        //

      }, {
        key: "resetInteractionState",
        value: function resetInteractionState() {
          this.maxRadius = 0;
          this.mouseDownStart = 0;
          this.mouseUpStart = 0;
          this.isMouseDown = true;
          this.xStart = 0;
          this.yStart = 0;
          this.xEnd = 0;
          this.yEnd = 0;
          this.slideDistance = 0;
        }
      }, {
        key: "onMouseUp",
        value: function onMouseUp() {
          if (!this.ignoreMouseUp) {
            // Only fires once per instance
            if (!this.isMouseDown) return;
            this.mouseUpStart = Utility.now();
            this.isMouseDown = false;
            this.removeAfterAnimation = true;
          }
        }
      }, {
        key: "draw",
        value: function draw() {
          var scale, dx, dy;
          this.wave.style.opacity = "" + this.opacity;
          scale = this.radius / (this.metrics.size / 2);
          dx = this.xNow - this.metrics.width / 2;
          dy = this.yNow - this.metrics.height / 2; // Inherited safari bug patch from Polymer implementation

          this.waveContainer.style.webkitTransform = 'translate(' + dx + 'px, ' + dy + 'px)';
          this.waveContainer.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
          this.wave.style.webkitTransform = 'scale(' + scale + ',' + scale + ')';
          this.wave.style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
        }
      }, {
        key: "animate",
        value: function animate() {
          this.draw();
          this.background.style.opacity = "" + this.outerOpacity;

          if (this.isOpacityFullyDecayed() && !this.isRestingAtMaxRadius()) {
            this.removeRipple();
            return;
          }

          if (this.shouldKeepAnimating) {
            window.requestAnimationFrame(this.animate.bind(this));
          } else {
            this.removeRipple();
            return;
          }
        }
      }, {
        key: "createWaveContainer",
        value: function createWaveContainer() {
          var waveContainer = document.createElement("div");
          waveContainer.setAttribute("class", WAVE_INSTANCE_CONTAINER);
          return waveContainer;
        }
      }, {
        key: "createWave",
        value: function createWave() {
          var wave = document.createElement("div");
          wave.setAttribute("class", "wave");
          return wave;
        }
        /**
         * Queue removal
         *
         * Promise wrapped to catch odd edge cases
         * where it won't go away otherwise
         */

      }, {
        key: "removeRipple",
        value: function removeRipple() {
          if (this.removeAfterAnimation) {
            this.waveContainer.remove();
            this.background.removeAttribute("style");
            this.destroy();
          }
        }
        /**
         * Kill myself (mood)
         *
         * Possibly my favourite part about ecmascript is the
         * still manual memory management
         */

      }, {
        key: "destroy",
        value: function destroy() {
          // Remove the instance reference
          // console.log("Destroyed ripple", this);
          delete this.element._ripples[this.instanceId]; // ts hack
        }
      }]);

      return RippleInstance;
    }();
  }, {
    "./../../../vendor/cferdinandi/events/events": 8
  }],
  8: [function (require, module, exports) {
    "use strict";
    /**
     * Fork and TypeScript ES2020 translation of
     * https://github.com/cferdinandi/events/blob/master/src/js/events/events.js
     */

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.get = exports.once = exports.off = exports.on = void 0; //
    // Variables
    //

    var activeEvents = {}; //
    // Methods
    //

    /**
     * Get the index for the listener
     * @param  arr      The listeners for an event
     * @param  selector The selector to get the index of.
     * @param  callback The callback to get the index of.
     * @return The index of the listener
     */

    function getIndex(arr, selector, callback) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].selector === selector && arr[i].callback.toString() === callback.toString()) return i;
      }

      return -1;
    }

    ;
    /**
     * Check if the listener callback should run or not
     * @param  target   The event.target
     * @param  selector The selector to check the target against
     * @return If true, run listener
     */

    function doRun(target, selector) {
      var _target$closest;

      if (['*', 'window', 'document', 'document.documentElement', window, document, document.documentElement].indexOf(selector) > -1) return true;
      return (_target$closest = target.closest(selector)) !== null && _target$closest !== void 0 ? _target$closest : false;
    }

    ;
    /**
     * Get the closest target to the event's indirect target,
     * in order to get the direct target.
     *
     * @param target The event target
     * @param selector The event selector
     * @author kimly
     */

    function getClosestTarget(target, selector) {
      return target.closest(selector);
    }
    /**
     * Handle listeners after event fires
     * @param event The event
     */


    function eventHandler(event) {
      if (!activeEvents[event.type]) return;
      activeEvents[event.type].forEach(function (listener) {
        var doRunResult = doRun(event.target, listener.selector);
        var closestTarget = getClosestTarget(event.target, listener.selector);
        if (!doRunResult) return;
        var data = {
          selector: listener.selector,
          target: closestTarget,
          indirectTarget: event.target,
          originalEvent: event
        };
        listener.callback(data);
      });
    }

    ;
    /**
     * Add an event
     * @param  types    The event type or types (comma separated)
     * @param  selector The selector to run the event on
     * @param  callback The function to run when the event fires
     */

    function on(types, selector, callback) {
      // Loop through each event type
      types.split(',').forEach(function (type) {
        // Remove whitespace
        type = type.trim(); // If no event of this type yet, setup

        if (!activeEvents[type]) {
          activeEvents[type] = [];
          window.addEventListener(type, eventHandler, true);
        } // Push to active events


        activeEvents[type].push({
          selector: selector,
          callback: callback
        });
      });
    }

    exports.on = on;
    ;
    /**
     * Remove an event
     * @param  types    The event type or types (comma separated)
     * @param  selector The selector to remove the event from
     * @param  callback The function to remove
     */

    function off(types, selector, callback) {
      // Loop through each event type
      types.split(',').forEach(function (type) {
        // Remove whitespace
        type = type.trim(); // if event type doesn't exist, bail

        if (!activeEvents[type]) return; // If it's the last event of it's type, remove entirely

        if (activeEvents[type].length < 2 || !selector) {
          delete activeEvents[type];
          window.removeEventListener(type, eventHandler, true);
          return;
        } // Otherwise, remove event


        var index = getIndex(activeEvents[type], selector, callback);
        if (index < 0) return;
        activeEvents[type].splice(index, 1);
      });
    }

    exports.off = off;
    ;
    /**
     * Add an event, and automatically remove it after it's first run
     * @param  types    The event type or types (comma separated)
     * @param  selector The selector to run the event on
     * @param  callback The function to run when the event fires
     */

    function once(types, selector, callback) {
      on(types, selector, function temp(event) {
        callback(event);
        off(types, selector, temp);
      });
    }

    exports.once = once;
    ;
    /**
     * Get an immutable copy of all active event listeners
     * @return Active event listeners
     */

    function get() {
      var obj = {};

      for (var type in activeEvents) {
        if (activeEvents.hasOwnProperty(type)) {
          obj[type] = activeEvents[type];
        }
      }

      return obj;
    }

    exports.get = get;
    ;
  }, {}]
}, {}, [3]);