require("polyfill/Element.closest");
require("polyfill/Element.remove");

import loadComponents from "components";

function boot(): void
{
    loadComponents();
}

function init(): void
{
    document.addEventListener("DOMContentLoaded", function _(): void {
        boot();

        document.removeEventListener("DOMContentLoaded", _);
    });
}

init();