"use strict";
/**
 * Welcome to hell
 *
 * If application path errors, run from ../ so that the launch command
 * is:
 *     node server/index.js
 *     nodemon server/index.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
//import { TwingEnvironment, TwingFunction, TwingLoaderFilesystem } from "twing";
const nunjucks = require("nunjucks");
// @pather-ignore
const SvgService = require("./svgService");
const innertubeRequestTest_1 = require("./innertube/innertubeRequestTest");
const attr_1 = require("./util/nunjucks/attr");
const PATH_SVG = "svg";
const PATH_VIEWS = "views";
function main() {
    console.log("Starting ybTube server...");
    var port = 8080;
    var app = express();
    var NunjucksEnv = nunjucks.configure(`${__dirname}/views`, {
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true,
        watch: true,
        noCache: true,
        express: app
    });
    NunjucksEnv.addGlobal("icon", SvgService.get);
    NunjucksEnv.addGlobal("attr", attr_1.default);
    //var fsLoader = new TwingLoaderFilesystem(`${__dirname}/${PATH_VIEWS}`);
    //var twig = new TwingEnvironment(fsLoader);
    // Bootstrap the SVG service.
    SvgService.load(`${__dirname}/${PATH_SVG}`);
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    app.get("/", async (request, response) => {
        var innertubeResponse = await (await (0, innertubeRequestTest_1.default)()).json();
        response.render("main.njk", {
            page: innertubeResponse,
            pageId: "browse"
        });
    });
    app.get("/uixtest", async (request, response) => {
        response.render("main.njk", {
            page: { uixTest: {} }
        });
    });
    app.get("/certtest", async (request, response) => {
        response.render("special/certtest.njk");
    });
    // static folder created during compilation
    app.use("/s", express.static(`${__dirname}/static`));
}
main();
