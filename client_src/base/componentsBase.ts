import { Ripple } from "ui/paper/ripple/paperRipple";
import * as events from "vendor/cferdinandi/events/events";

var componentsRegistry: Component[] = [];


export interface Component
{
    /** The name of the Component */
    name: string,

    /** A main selector to listen to. "*" listens across the entire document. */
    selector: string,
    
    /** A list of event names and their respective handlers. */
    events: ComponentEvents,

    /** 
     * A method added by the Component service after registration for unregistering
     * said component.
     */
    unload?: Function
}

export interface ComponentEvents
{
    /** An event handler or ComplexComponentEvent. */
    [eventName: string]: Function|ComplexComponentEvent
}

export interface ComplexComponentEvent
{
    /** Override the main selector definition */
    selector: string,

    /** Event handler */
    function: Function
}

export function registerComponent(component: Component): void
{
    componentsRegistry.push(component);
    initComponent(component);
}

function initComponent(component: Component): void
{
    for (var name of Object.keys(component.events))
    {
        var selector: string = component.selector;
        var callback: Function|ComplexComponentEvent = component.events[name];

        // Complex declaration
        if ("function" != typeof callback)
        {
            var data = callback as ComplexComponentEvent;

            selector = data.selector;
            callback = data.function;
        }
        
        events.on(name, selector, callback as Function);
    }

    component.unload = unloadComponent.bind(component);
}

/**
 * TODO: rework to match initComponent progress
 */
function unloadComponent(component: Component|null): void
{
    if (null == component) component = this as Component;

    for (var name of Object.keys(component.events))
    {
        var callback = component.events[name];

        events.off(name, "." + component.selector, callback as Function);
    }

    delete component.unload;
}