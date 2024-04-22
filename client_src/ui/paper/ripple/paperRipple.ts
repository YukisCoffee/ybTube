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

import * as events from "vendor/cferdinandi/events/events";

/**
 * General utility definitions
 */
class Utility
{
    static distance(x1: number, y1: number, x2: number, y2: number): number
    {
        var xDelta = (x1 - x2);
        var yDelta = (y1 - y2);

        return Math.sqrt(xDelta ** 2 + yDelta ** 2);
    }

    static now = window.performance && window.performance.now ?
        window.performance.now.bind(window.performance) :
        Date.now
    ;

    /**
     * "class is not allowed as a parameter name" :nerd:
     */
    static getClass(element: HTMLElement, clazz: string): HTMLElement
    {
        return element.getElementsByClassName(clazz)[0] as HTMLElement;
    }
}

/**
 * Element metrics utilities
 */
class ElementMetrics
{
    element: Element;
    width: number;
    height: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    size: number;

    constructor(e: Element)
    {
        this.element = e;
        this.width = this.boundingRect.width;
        this.height = this.boundingRect.height;
        this.top = this.boundingRect.top;
        this.right = this.boundingRect.right;
        this.bottom = this.boundingRect.bottom;
        this.left = this.boundingRect.left;
        
        this.size = Math.max(this.width, this.height);
    }

    get boundingRect(): DOMRect // dom rekt lol
    {
        return this.element.getBoundingClientRect();
    }

    farthestCornerDistanceFrom(x: number, y: number): number
    {
        var topLeft = Utility.distance(x, y, 0 , 0);
        var topRight = Utility.distance(x, y, this.width, 0);
        var bottomLeft = Utility.distance(x, y, 0, this.height);
        var bottomRight = Utility.distance(x, y, this.width, this.height);

        return Math.max(topLeft, topRight, bottomLeft, bottomRight);
    }
}

const MOUSE_BUTTON_LEFT: number = 0;
const MOUSE_BUTTON_MIDDLE: number = 1;
const MOUSE_BUTTON_RIGHT: number = 2;
const MOUSE_BUTTON_FOUR: number = 3;
const MOUSE_BUTTON_FIVE: number = 4;

const MAX_RADIUS: number = 300;
const DEFAULT_INITIAL_OPACITY: number = 0.25;
const DEFAULT_OPACITY_DECAY_VELOCITY: number = 0.8;
export const HOST_SELECTOR: string = ".paper-ripple";
const CONTAINER_CLASS: string = "paper-ripple-container";
const CONTAINER_BACKGROUND: string = "background";
const CONTAINER_WAVES: string = "waves";
const WAVE_INSTANCE_CONTAINER: string = "wave-container";

var rippleGlobalDisableLeftClick: boolean = false;

export class Ripple
{
    static getHost(element: HTMLElement): HTMLElement
    {
        return element.closest(HOST_SELECTOR);
    }

    /** 
     * Property getters
     */
    static getRecenters(host: HTMLElement): boolean
    {
        return host.dataset.paperRippleRecenters
            ? true
            : false
        ;
    }

    static getCenter(host: HTMLElement): boolean
    {
        return host.dataset.paperRippleCenter
            ? true
            : false
        ;
    }

    static getInitialOpacity(host: HTMLElement): number
    {
        var a: string;

        if ((a = host.dataset.initialOpacity) && !isNaN(+a))
        {
            return +a;
        }
    }

    static getOpacityDecayVelocity(host: HTMLElement): number
    {
        var a: string;

        if ((a = host.dataset.opacityDecayVelocity) && !isNaN(+a))
        {
            return +a; // Ugly ass js type cast cuz ts doesn't have working better syntax
        }
    }

    static createContainer(element: HTMLElement)
    {
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
    static createRipple(element: any /** ts hack */, x: number = null, y: number = null)
    {
        element._ripples = element._ripples || {};

        var uid = Math.floor(Math.random() * 100000);

        // Create a new ripple instance
        element._ripples[uid] = (new RippleInstance(
            [x, y],
            element as HTMLElement,
            uid
        ));
    }
}

export class RippleEventAdapter
{
    static tabElement: any = null;

    // Shhhh
    // Don't worry about the any type
    // It's a TypeScript hack to assign
    // custom properties to HTML elements.
    static handleMouseDown(this: any, iceEvent: any)
    {
        // Skip if it's not a left click
        if (MOUSE_BUTTON_LEFT != iceEvent.originalEvent.button) return;

        var element: any = iceEvent.target;

        // Move element container to the child ripple container
        element = Utility.getClass(element, CONTAINER_CLASS) ?? Ripple.createContainer(element);

        if (!rippleGlobalDisableLeftClick)
        {
            var x: number = iceEvent.originalEvent.clientX;
            var y: number = iceEvent.originalEvent.clientY;

            // Create a new ripple under this element with the 
            Ripple.createRipple(element, x, y);

            // Temporarily delegate mouseup event on everything
            events.once("mouseup", "*", RippleEventAdapter.handleMouseUp.bind(element));
        }
    }

    static handleMouseUp()
    {
        var element: any = this;

        // Message all ripple instances telling them
        // that the mouse is up
        for (var i of Object.keys(element._ripples))
        {
            var instance: RippleInstance = element._ripples[i];

            instance.onMouseUp();
        }
    }

    /**
     * Specifically, this function is for handling tab 
     *//*
    static handleFocus(iceEvent: any)
    {
        var element: any = iceEvent.target;

        if (document.activeElement == element)
        {
            Ripple.createRipple(element);
            RippleEventAdapter.tabElement = element;
        }
        else if (null != RippleEventAdapter.tabElement)
        {
            (RippleEventAdapter.handleMouseUp.bind(
                RippleEventAdapter.tabElement
            ))();

            RippleEventAdapter.tabElement = null;
        }
    }*/
}

class RippleInstance
{
    instanceId: number;
    removeAfterAnimation: boolean = false;

    // Specific to this implementation, the ripple
    // effect starts with a mousedown state assumed.
    isMouseDown: boolean = true;
    mouseDownStart: number = 0;
    mouseUpStart: number = 0;
    ignoreMouseUp: boolean = false;

    element: HTMLElement;
    host: HTMLElement;
    metrics: ElementMetrics;
    background: HTMLElement
    waves: HTMLElement;
    waveContainer: HTMLElement;
    wave: HTMLElement;

    xStart: number;
    yStart: number;
    xEnd: number;
    yEnd: number;
    slideDistance: number;
    maxRadius: number;

    get mouseDownElapsed(): number
    {
        var elapsed: number;

        elapsed = Utility.now() - this.mouseDownStart;

        if (null != this.mouseUpStart)
        {
            elapsed -= this.mouseUpElapsed;
        }

        return elapsed;
    }

    get mouseUpElapsed(): number
    {
        return this.mouseUpStart ? Utility.now() - this.mouseUpStart : 0;
    }

    get mouseDownElapsedSeconds(): number
    {
        return this.mouseDownElapsed / 1000;
    }

    get mouseUpElapsedSeconds(): number
    {
        return this.mouseUpElapsed / 1000;
    }

    get mouseInteractionSeconds(): number
    {
        return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
    }

    //
    // Drawing
    //

    get opacity()
    {
        if (!this.mouseUpStart) return this.initialOpacity;

        return Math.max(
            0,
            this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity
        );
    }

    get initialOpacity()
    {
        return Ripple.getInitialOpacity(this.host) ?? DEFAULT_INITIAL_OPACITY;
    }

    get opacityDecayVelocity()
    {
        return Ripple.getOpacityDecayVelocity(this.host) ?? DEFAULT_OPACITY_DECAY_VELOCITY;
    }

    get outerOpacity()
    {
        var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
        var waveOpacity = this.opacity;

        return Math.max(0, Math.min(outerOpacity, waveOpacity));
    }

    get translationFraction()
    {
        return Math.min(
            1, this.radius / this.metrics.size * 2 / Math.sqrt(2)
        );
    }

    get xNow()
    {
        if (this.xEnd)
        {
            return this.xStart + this.translationFraction *
                (this.xEnd - this.xStart);
        }
        
        return this.xStart;
    }

    get yNow()
    {
        if (this.yEnd)
        {
            return this.yStart + this.translationFraction *
                (this.yEnd - this.yStart);
        }

        return this.yStart;
    }

    isOpacityFullyDecayed()
    {
        return this.opacity < 0.01 &&
            this.radius >= Math.min(this.maxRadius, MAX_RADIUS);
    }

    isRestingAtMaxRadius()
    {
        return this.opacity >= this.initialOpacity &&
            this.radius >= Math.min(this.maxRadius, MAX_RADIUS);
    }

    isAnimationComplete()
    {
        return this.mouseUpStart ? this.isOpacityFullyDecayed() :
                                   this.isRestingAtMaxRadius();
    }

    shouldKeepAnimating()
    {
        return !this.isAnimationComplete();
    }

    get radius(): number
    {
        var width2: number = this.metrics.width * this.metrics.width;
        var height2: number = this.metrics.height * this.metrics.height;

        var waveRadius: number =
            Math.min(Math.sqrt(width2 + height2), MAX_RADIUS) * 1.1 + 5;
        
        var duration: number = 1.1 - 0.2 * (waveRadius / MAX_RADIUS);
        var timeNow = this.mouseInteractionSeconds / duration;
        var size = waveRadius * (1 - Math.pow(80, 0-timeNow));

        return Math.abs(size);
    }

    //
    // Logic
    //

    resetInteractionState()
    {
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

    constructor(xy: number[], element: HTMLElement, instanceId: number)
    {
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

        var xCenter: number = this.metrics.width / 2;
        var yCenter: number = this.metrics.height / 2;

        if (Ripple.getCenter(this.host) || null == xy[0])
        {
            this.xStart = xCenter;
            this.yStart = yCenter;
        }
        else
        {
            this.xStart =
                xy[0] - this.metrics.left;
            this.yStart =
                xy[1] - this.metrics.top;
        }

        if (Ripple.getRecenters(this.host))
        {
            this.xEnd = xCenter;
            this.yEnd = yCenter;
            this.slideDistance = Utility.distance(
                this.xStart, this.yStart,
                this.xEnd, this.yEnd
            );
        }

        this.maxRadius = this.metrics.farthestCornerDistanceFrom(
            this.xStart, this.yStart
        );

        this.waves.appendChild(this.waveContainer);
        
        this.waveContainer.style.top =
            (this.metrics.height - this.metrics.size) / 2 + "px";
        this.waveContainer.style.left =
            (this.metrics.width - this.metrics.size) / 2 + "px";

        this.waveContainer.style.width = this.metrics.size + "px";
        this.waveContainer.style.height = this.metrics.size + "px";

        this.wave = this.createWave();
        this.waveContainer.appendChild(this.wave);


        // console.log("Ripple ready to animate", this);
        this.animate();
    }

    onMouseUp(): void
    {
        if (!this.ignoreMouseUp)
        {
            // Only fires once per instance
            if (!this.isMouseDown) return;

            this.mouseUpStart = Utility.now();
            this.isMouseDown = false;
            this.removeAfterAnimation = true;
        }
    }

    draw(): void
    {
        var scale: number, dx: number, dy: number;

        this.wave.style.opacity = ""+this.opacity;

        scale = this.radius / (this.metrics.size / 2);
        dx = this.xNow - (this.metrics.width / 2);
        dy = this.yNow - (this.metrics.height / 2);

        // Inherited safari bug patch from Polymer implementation
        this.waveContainer.style.webkitTransform =
            'translate(' + dx + 'px, ' + dy + 'px)';
        this.waveContainer.style.transform =
            'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
        this.wave.style.webkitTransform = 'scale(' + scale + ',' + scale + ')';
        this.wave.style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
    }

    animate(): void
    {
        this.draw();

        this.background.style.opacity = ""+this.outerOpacity;
        
        if (this.isOpacityFullyDecayed() && !this.isRestingAtMaxRadius())
        {
            this.removeRipple();
            return;
        }

        if (this.shouldKeepAnimating)
        {
            window.requestAnimationFrame(this.animate.bind(this));
        }
        else
        {
            this.removeRipple();
            return;
        }
    }

    createWaveContainer(): HTMLElement
    {
        var waveContainer = document.createElement("div");
        waveContainer.setAttribute("class", WAVE_INSTANCE_CONTAINER);

        return waveContainer;
    }

    createWave(): HTMLElement
    {
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
    removeRipple()
    {
        if (this.removeAfterAnimation)
        {
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
    destroy(): void
    {
        // Remove the instance reference
        // console.log("Destroyed ripple", this);
        delete (this.element as any)._ripples[this.instanceId]; // ts hack
    }
}