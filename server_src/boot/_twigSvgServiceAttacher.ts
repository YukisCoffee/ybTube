// Register the SVG service as a Twig method
var iconCallable: TwingCallable<string> = async function(icon: string): Promise<string> {
    return SvgService.get(icon);
}

// @ts-ignore
var iconFunction = new TwingFunction("icon", iconCallable, [
    {"name": "icon", "defaultValue": ""}
], {
    is_safe: ["html"]
});

twig.addFunction(iconFunction);