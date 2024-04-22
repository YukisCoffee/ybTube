"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultController {
    constructor() {
        this.pageTemplate = "main.njk";
    }
    static async handle(request, response) {
        // response.render(this.pageTemplate);
    }
}
exports.default = DefaultController;
