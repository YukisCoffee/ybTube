/**
 * A relative pather for preprocessing ECMAScript modular code.
 * 
 * This gets rid of a ../../../.. chain issue by allowing the
 * file to be referenced relative to the project root or current file,
 * similarly to PHP.
 * 
 * This is compatible with both ES6-style and CommonJS-style module
 * imports, as well as supporting helper comments to ignore following
 * lines.
 * 
 * To ignore the following line, insert above or before it:
 * // @pather-ignore
 */

// Polyfill (old node lacks replaceAll)
String.prototype.replaceAll = String.prototype.replaceAll || function(a, b) {
    if (a instanceof RegExp) return this.replace(a, b);
    return this.replace(
        new RegExp(a, "g"), b
    );
};

// Prerequisites
const fs = require("fs");
const path = require("path");

// Module definition
module.exports = main;

const STD_JS_EXTS = ["js", "ts"];
const IGNORE_COMMENT_DIRECTIVE = "@pather-ignore";
const PATTERN_ES6 = /import .* from .*(?=;*)/g;
const PATTERN_CJS = /require\s*\(.*\)(?=;*)/g;
const PATTERN_QUOTE = /('|"|`).*(?<=('|"|`))/g;
const TOKEN_WHITESPACE = " ";
const TOKEN_COMMENT_SINGLE = "//";
const TOKEN_COMMENT_MULTI_OPEN = "/*";
const TOKEN_COMMENT_MULTI_CLOSE = "*/";

var projectRoot;
var filePath;
var jsExtensions;

function replaceBetween(origin, startIndex, endIndex, insertion) {
    return origin.substring(0, startIndex) + insertion + origin.substring(endIndex);
}

/**
 * Process through one JS file.
 * 
 * @param {string} file encoded in UTF-8
 * @param {object} options
 * @param {string} options.projectRoot Root folder of the project.
 * @param {string} options.filePath Path of the current file.
 * @param {?string} options.jsExtensions Overrides for the JS file extensions.
 * @param {?string} options.ignoreCommentDirective Declaration for the ignore comment directive.
 * @return {string} Modified file.
 */
function main(file, options)
{
    // Validation
    switch (true)
    {
        case (null == options.projectRoot):
            throw new Error("options.projectRoot must be set.");
    }

    // Combine both patterns
    var importPattern = new RegExp(
        `(${PATTERN_ES6.source})|(${PATTERN_CJS.source})`, "g"
    );

    // Options configuration
    jsExtensions = options.jsExtensions || STD_JS_EXTS;
    var ignoreCommentDirective = options.ignoreCommentDirective || IGNORE_COMMENT_DIRECTIVE;

    projectRoot = options.projectRoot;
    filePath = options.filePath;

    // Iterate through and collect all matches in the file
    var statements = [];

    var match;
    while (null != (match = importPattern.exec(file)))
    {
        statements.push(new IncludeStatement({
            string: match[0],
            start: match.index,
            end: importPattern.lastIndex
        }));
    }

    // Re-iterate and parse each line
    var startAdd = 0;
    for (var i = 0; i < statements.length; i++)
    {
        //console.log("[DEBUG]", statements[i]);

        var cur = statements[i];
        cur.start = cur.start + startAdd;
        cur.end = cur.end + startAdd;
        var initialSize = cur.end - cur.start;

        // Capture the previous comment
        var previousComment = prevComment(file, cur.start);
        //console.log("[DEBUG] Previous comment: ", previousComment);
        
        // If the previous comment has the ignore directive, skip
        if (null != previousComment && previousComment.match(new RegExp(ignoreCommentDirective, "g")))
        {
            continue;
        }

        // Rewrite the file paths otherwise
        relativeisePath(cur);
        //console.log("[DEBUG]", cur.string);
        //file = replaceBetween(file, cur.start, cur.end - cur.start, cur.string);
        file = file.replace(cur.originalString, cur.string);

        // Get size differences and shift all the next ones
        startAdd += (cur.end - cur.start) - initialSize;
    }

    // Return the modified file
    return file;
}

class IncludeStatement
{
    originalString = "";

    stringFrags = [];

    quote = "";

    quoteToken = "";
    
    /** @type {number} */
    start = 0;

    /**
     * @param {object} match Object encoding metadata about the regex match (defined in main).
     * @param {string} match.string String of the array
     * @param {number} match.start Starting index of the match.
     * @return {void}
     */
    constructor(match)
    {
        this.originalString = match.string;
        this.start = match.start;

        var quote = IncludeStatement.getQuote(this.originalString);
        this.quoteToken = IncludeStatement.getQuoteToken(quote);
        this.quote = quote.replaceAll(this.quoteToken, "");

        // Parse the string and follow up
        // Should always result in a two item array
        this.stringFrags = this.originalString.split(quote);
    }

    get end()
    {
        return this.start + this.stringFrags.length;
    }

    get string()
    {
        return this.stringFrags[0] + this.quoteToken + this.quote + 
            this.quoteToken + this.stringFrags[1];
    }

    /** @return {?string} */
    static getQuote(originalString)
    {
        return originalString.match(PATTERN_QUOTE)[0] || "";
    }

    static getQuoteToken(quoteString)
    {
        for (var i = 0; i < quoteString.length; i++)
        {
            switch (quoteString[i])
            {
                case "\"":
                    return "\"";
                case "'":
                    return "'";
                case "`":
                    return "`";
            }
        }

        return null;
    }
}

/**
 * @param {IncludeStatement} statement
 * @return {IncludeStatement} modified statement
 */
function relativeisePath(statement)
{
    // Ignore already relative paths
    if (statement.quote.startsWith("./")) return statement;

    var currentFileName = statement.quote;

    // Encodes the path
    var _ = statement.quote;

    // Full path (from project root) to the file
    var fullPath = `${projectRoot}/${currentFileName}`;

    // Does full path exist?
    var fullPathExists = fileExists(fullPath);
    
    if (fullPathExists)
    {
        var fileRootDir = path.dirname(fullPath);
        var relativeToFile = `${fileRootDir}/${currentFileName}`;
        var relativeToRoot = `${projectRoot}/${currentFileName}`;

        // Relative
        if (fileExists(relativeToFile))
        {
            _ = `./${currentFileName}`;
        }
        // From root
        else if (fileExists(relativeToRoot))
        {
            var relativePath = path.relative(
                path.dirname(filePath), relativeToRoot
            );

            _ = "./" + relativePath.replaceAll("\\", "/");
        }
    }

    statement.quote = _;

    return statement;
}

function fileExists(filePath)
{
    for (var i = -1; i < jsExtensions.length; i++)
    {
        var comparer;
        switch (i)
        {
            case -1:
                comparer = filePath;
                break;
            default:
                comparer = `${filePath}.${jsExtensions[i]}`;
                break;
        }

        if (fs.existsSync(comparer)) return true;
    }

    return false;
}

/**
 * Get the previous token relative to the pointer.
 * 
 * @param {number} input file string.
 * @param {number} offset of the current pointer.
 * @param {number} size of the token
 * @return {string}
 */
function prevToken(input, offset, size)
{
    return input.substr(offset - size, size);
}

function prevComment(input, offset)
{
    var pointer = offset - 1;

    while (pointer > 0)
    {
        var hitCommentClose = false;
        var commentClose;

        switch (input[pointer])
        {
            case TOKEN_WHITESPACE:
                break;
            case "\n":
                return singleLineComment(input, pointer - 1);
            default:
                switch(prevToken(input, pointer, 2))
                {
                    // Begin capturing comment and return
                    case TOKEN_COMMENT_MULTI_CLOSE:
                        commentClose = pointer;
                        hitCommentClose = true;
                        break;
                    case TOKEN_COMMENT_MULTI_OPEN:
                        commentOpen = pointer;
                        return input.substr(commentOpen, commentClose)
                    default:
                        if (!hitCommentClose) return null;
                }
                break;
        }
        pointer--;
    }

    return null;
}

function singleLineComment(input, offset)
{
    var line = singleLine(input, offset);
    line = line.split("//").splice(0, 1).join("");
    return line;
}

/**
 * From the end of one line, splice it until the start
 * 
 * (really specialised function)
 */
function singleLine(input, offset)
{
    var start = 0;
    var end = offset;

    // Backtrace until previous line
    var pointer = offset;
    function set()
    {
        while (pointer > 0)
        {
            if ("\n" == input[pointer])
            {
                return pointer + 1;
            }

            pointer--;
        }
    }
    end = set();
    start = set();

    return input.substr(start, end);
}