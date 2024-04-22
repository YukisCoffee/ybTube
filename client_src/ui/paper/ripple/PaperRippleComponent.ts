import { Component } from "base/componentsBase";
import { RippleEventAdapter as Ripple } from "ui/paper/ripple/paperRipple";

export var PaperRippleComponent: Component = {
    name: "PaperRippleComponent",
    selector: ".paper-ripple",
    events: {
        mousedown: Ripple.handleMouseDown/*,
        focusin: {
            selector: "*",
            function: Ripple.handleFocus
        }*/
    }
}