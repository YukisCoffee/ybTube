// Import modules base
import { registerComponent } from "base/componentsBase";

// Import and load all modules
import { PaperRippleComponent } from "ui/paper/ripple/PaperRippleComponent";

export default function loadComponents()
{
    registerComponent(PaperRippleComponent);
}