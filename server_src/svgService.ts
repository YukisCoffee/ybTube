import * as fs from "fs";

/**
 * Common logger interface
 */
function log(message: string): void
{
    console.log(`[ybTube/SvgService] ${message}`);
}

/** 
 * Initial load the iconset.
 * 
 * @param {string} root folder containing the SVGs 
 */
export function load(root: string)
{
    log("Beginning iconset registration...");

    var files: string[] = fs.readdirSync(root);

    for (var i = 0; i < files.length; i++)
    {
        var currentFile: string = files[i];

        // lazy
        var svgName: string = currentFile.replace(".svg", "").toLowerCase();

        try
        {
            var content: string = fs.readFileSync(`${root}/${currentFile}`, "utf-8");

            // Register the SVGs in the array.
            svgRegistry[svgName] = content;

            log("Registered icon: " + svgName);
        }
        catch (e)
        {
            log("Failed to register icon: " + svgName);
        }
    }
}

/**
 * Get an SVG string from the registry.
 */
export function get(id: string): string
{
    if ("string" != typeof id) return "";

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

var svgRegistry: object = {};