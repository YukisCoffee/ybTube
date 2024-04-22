"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.load = void 0;
const fs = require("fs");
/**
 * Common logger interface
 */
function log(message) {
    console.log(`[ybTube/SvgService] ${message}`);
}
/**
 * Initial load the iconset.
 *
 * @param {string} root folder containing the SVGs
 */
function load(root) {
    log("Beginning iconset registration...");
    var files = fs.readdirSync(root);
    for (var i = 0; i < files.length; i++) {
        var currentFile = files[i];
        // lazy
        var svgName = currentFile.replace(".svg", "").toLowerCase();
        try {
            var content = fs.readFileSync(`${root}/${currentFile}`, "utf-8");
            // Register the SVGs in the array.
            svgRegistry[svgName] = content;
            log("Registered icon: " + svgName);
        }
        catch (e) {
            log("Failed to register icon: " + svgName);
        }
    }
}
exports.load = load;
/**
 * Get an SVG string from the registry.
 */
function get(id) {
    if ("string" != typeof id)
        return "";
    id = id.toLowerCase();
    return null != svgRegistry[id] ? svgRegistry[id] : "";
    // try
    // {
    //     return svgRegistry[id];
    // }
    // catch (e)
    // {
    //     //throw new Error(`Icon "${id}" is not available in the registry. Does the icon exist?`);
    //     return "";
    // }
}
exports.get = get;
var svgRegistry = {};
