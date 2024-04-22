/**
 * Helper function for generating single-line element attribute
 * strings.
 * 
 * Attribute names prefixed or suffixed with a "?" character are
 * optional elements that will not be echoed if they don't have a valid
 * value.
 */
export default function NunjucksAttributesHelper(attributes: object): string
{
    var output: string = "";

    // Iterate all keys and check if their values are
    // truthy, and pass if so.
    for (var name of Object.keys(attributes))
    {
        var value = attributes[name];
        var isOptional: boolean = true;

        // Perform transformations on the name (as requested)
        name = transformName(name);

        // Lil post behaviour for optional attributes
        if ("*" == name.charAt(0))
        {
            name = name.replace("*", "");
            isOptional = false;
        }

        switch (true)
        {
            // Do nothing if the item doesn't exist or is null
            case (null == value):
            case ("undefined" == typeof value): 
                if (isOptional)
                {
                    break;
                }
                else
                {
                    // Convert the value to an empty string and continue on
                    value = "";
                }

            /**
             * Convert various non-string types to string
             * 
             * NOTICE (kimly): Numbers and booleans must not be explicitly
             * converted to string. Doing so causes the quotation marks to double
             * and thus causes the string to parse wrong. Let ECMAScript do its thing.
             */
            case ("object" == typeof value):
                // If array
                if (Array.isArray(value))
                {
                    value = value.join(" ");
                }
                else
                {
                    value = JSON.stringify(value); // Convert to string
                }

            // Add to the definitions list
            default:
                // If there's already a string in the output, then
                // add a space
                if ("" !== output)
                {
                    output += " ";
                }

                output += `${name}="${value}"`;
        }
    }

    return output;
}

const TRANSFORM_TOKENS: string[] = ["@", "*"];

/**
 * Allow the use of some characters to apply
 * specific attributes.
 */
function transformName(orig: string): string
{
    // 'new' is not allowed as a variable declaration name.ts(1389) :nerd:
    var nyuu: string = orig;

    // Default behaviours
    var changeCase: boolean = true;

    // Tokenise
    var tokens: string[] = [];
    for (var originalToken of TRANSFORM_TOKENS)
    {
        // RegExps are hard to read, so here's how this works
        // Negative lookbehind (?<!) for the \ escape character
        // for ignorance.
        // If the escape character is at the end of the line
        // (matches that character followed by $ which is EOL)
        // then accept that.
        // Otherwise, OR chain leads to a similar regex that uses
        // any character as a escape character and doesn't need to match
        // with EOL.
        var t = escapeRegExp(originalToken);

        var tokenRegexp = new RegExp(
            `(?<!\\\\)${t}$|(?<!.)${t}`,
            "m"
        );

        if (null != orig.match(tokenRegexp))
        {
            // Remove the token from the string
            nyuu = nyuu.replace(tokenRegexp, "");

            tokens.push(originalToken);
        }
    }

    // Remove escapes and replace nonstandard characters with HTML entities
    nyuu = nyuu.replace("\\", "").replace(/[^a-zA-Z0-9]/g, 
        c => `&#${c.charCodeAt(0)};`
    );

    // Iterate through all found tokens and process
    for (var i = 0; i < tokens.length; i++) switch (tokens[i])
    {
        /**
         * @ character
         * 
         * Echo a string as-is, i.e. don't change camelCase to hyphen-case
         */
        case "@": changeCase = false;

        /**
         * ? character
         * 
         * This should be prepended since it's handled elsewhere.
         */
        case "*": nyuu = "*" + nyuu;
    }

    // Main handler
    if (changeCase)
    {
        // Convert to hyphen case
        nyuu = nyuu.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    }

    // Return
    return nyuu;
}

// https://stackoverflow.com/a/6969486
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}