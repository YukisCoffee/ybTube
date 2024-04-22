/**
 * Fork and TypeScript ES2020 translation of
 * https://github.com/cferdinandi/events/blob/master/src/js/events/events.js
 */

//
// Interfaces
//

interface ActiveEvents {
    [eventName: string]: ActiveEventDeclaration[];
}

interface ActiveEventDeclaration {
    /** The selector of the elements to listen for the event on. */
    selector: string;

    callback: Function;
}

/**
 * Little event wrapper to simplify things
 * 
 * @author kimly real 2010
 */
export interface IceEvent
{
    /** The selector used to fire the event */
    selector: string,

    /**
     * The indirect target that lead to the event being fired.
     * 
     * This isn't necessarily the selector, it's
     * functionally a symlink to {event.target}
     */
    indirectTarget: Element,

    /**
     * The element that the selector resolves to; the 
     * direct target of the event.
     */
    target: Element,

    /** A container for the original event metadata */
    originalEvent: Event
}

//
// Variables
//

var activeEvents: ActiveEvents = {};

//
// Methods
//

/**
 * Get the index for the listener
 * @param  arr      The listeners for an event
 * @param  selector The selector to get the index of.
 * @param  callback The callback to get the index of.
 * @return The index of the listener
 */
function getIndex(arr: ActiveEventDeclaration[], selector: string, callback: Function): number {
    for (var i = 0; i < arr.length; i++) {
        if (
            arr[i].selector === selector &&
            arr[i].callback.toString() === callback.toString()
        ) return i;
    }
    return -1;
};

/**
 * Check if the listener callback should run or not
 * @param  target   The event.target
 * @param  selector The selector to check the target against
 * @return If true, run listener
 */
function doRun(target: Element, selector: string): boolean | Element {
    if ([
        '*',
        'window',
        'document',
        'document.documentElement',
        window,
        document,
        document.documentElement
    ].indexOf(selector) > -1) return true;

    return target.closest(selector) ?? false;
};

/** 
 * Get the closest target to the event's indirect target,
 * in order to get the direct target.
 * 
 * @param target The event target
 * @param selector The event selector
 * @author kimly
 */
function getClosestTarget(target: Element, selector: string): Element
{
    return target.closest(selector);
}

/**
 * Handle listeners after event fires
 * @param event The event
 */
function eventHandler(event: Event) {
    if (!activeEvents[event.type]) return;
    activeEvents[event.type].forEach(function (listener) {
        var doRunResult = doRun(event.target as Element, listener.selector);
        var closestTarget = getClosestTarget(event.target as Element, listener.selector);
        if (!doRunResult) return;

        var data: IceEvent = {
            selector: listener.selector,
            target: closestTarget,
            indirectTarget: event.target as Element,
            originalEvent: event
        };

        listener.callback(data);
    });
};

/**
 * Add an event
 * @param  types    The event type or types (comma separated)
 * @param  selector The selector to run the event on
 * @param  callback The function to run when the event fires
 */
export function on(types: string, selector: string, callback: Function): void {

    // Loop through each event type
    types.split(',').forEach(function (type: string): void {

        // Remove whitespace
        type = type.trim();

        // If no event of this type yet, setup
        if (!activeEvents[type]) {
            activeEvents[type] = [];
            window.addEventListener(type, eventHandler, true);
        }

        // Push to active events
        activeEvents[type].push({
            selector: selector,
            callback: callback
        });

    });

};

/**
 * Remove an event
 * @param  types    The event type or types (comma separated)
 * @param  selector The selector to remove the event from
 * @param  callback The function to remove
 */
export function off(types: string, selector: string, callback: Function): void {

    // Loop through each event type
    types.split(',').forEach(function (type: string): void {

        // Remove whitespace
        type = type.trim();

        // if event type doesn't exist, bail
        if (!activeEvents[type]) return;

        // If it's the last event of it's type, remove entirely
        if (activeEvents[type].length < 2 || !selector) {
            delete activeEvents[type];
            window.removeEventListener(type, eventHandler, true);
            return;
        }

        // Otherwise, remove event
        var index: number = getIndex(activeEvents[type], selector, callback);
        if (index < 0) return;
        activeEvents[type].splice(index, 1);

    });

};

/**
 * Add an event, and automatically remove it after it's first run
 * @param  types    The event type or types (comma separated)
 * @param  selector The selector to run the event on
 * @param  callback The function to run when the event fires
 */
export function once(types: string, selector: string, callback: Function): void {
    on(types, selector, function temp(event: Event) {
        callback(event);
        off(types, selector, temp);
    });
};

/**
 * Get an immutable copy of all active event listeners
 * @return Active event listeners
 */
export function get(): ActiveEvents {
    var obj: ActiveEvents = {};
    for (var type in activeEvents) {
        if (activeEvents.hasOwnProperty(type)) {
            obj[type] = activeEvents[type];
        }
    }
    return obj;
};