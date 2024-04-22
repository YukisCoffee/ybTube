/**
 * Welcome to hell
 * 
 * If application path errors, run from ../ so that the launch command
 * is:
 *     node server/index.js
 *     nodemon server/index.js
 */

import express = require('express');
//import { TwingEnvironment, TwingFunction, TwingLoaderFilesystem } from "twing";
import nunjucks = require("nunjucks");
// @pather-ignore
import * as SvgService from "svgService";
import innertubeRequestTest from "innertube/innertubeRequestTest";
import { TwingCallable } from 'twing/dist/types/lib/callable-wrapper';

import NunjucksAttributesHelper from 'util/nunjucks/attr';

const PATH_SVG: string = "svg";
const PATH_VIEWS: string = "views";

function main(): void {
    console.log("Starting ybTube server...");
    
    var port: number = 8080;

    var app: express.Express = express();

    var NunjucksEnv = nunjucks.configure(`${__dirname}/views`, {
        autoescape: false, // annoying
        trimBlocks: true,
        lstripBlocks: true,
        
        watch: true,
        noCache: true,
        express: app
    });

    NunjucksEnv.addGlobal("icon", SvgService.get);
    NunjucksEnv.addGlobal("attr", NunjucksAttributesHelper);

    //var fsLoader = new TwingLoaderFilesystem(`${__dirname}/${PATH_VIEWS}`);
    //var twig = new TwingEnvironment(fsLoader);

    // Bootstrap the SVG service.
    SvgService.load(`${__dirname}/${PATH_SVG}`);

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    app.get("/", async (request, response) => {
        var innertubeResponse: object = await (await innertubeRequestTest()).json();

        response.render("main.njk", {
            page: innertubeResponse,
            pageId: "browse"
        });
    });

    app.get("/uixtest", async (request, response) => {
        response.render("main.njk", {
            page: {uixTest: {}}
        });
    });

    app.get("/certtest", async (request, response) => {
        response.render("special/certtest.njk");
    });

    // static folder created during compilation
    app.use("/s", express.static(`${__dirname}/static`));
}

main();