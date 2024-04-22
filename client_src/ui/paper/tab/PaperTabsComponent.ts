import { Component } from "base/componentsBase";
import { PaperTabs } from "./paperTab";

export var PaperTabsComponent: Component = {
    name: "PaperTabsComponent",
    selector: ".paper-tabs",
    events: {
        click: PaperTabs.handleClick
    }
}