// Import gulp and modules
const { gulp, src, dest, watch, emit } = require("gulp");

const babel = require("gulp-babel");
const tsc  = require("gulp-typescript");
const scss = require("gulp-sass")(require("sass"));
const REALBROWSERIFY = require("browserify");
const browserify = require("gulp-bro");
const postcss = require("gulp-postcss");
const postcssCustomProperties = require("postcss-custom-properties");
const relativepather = require("./misc/gulp-relativepather/gulp-relativepather");

const del = require("del");
const plumber = require("gulp-plumber");
const convertToBuffer = require("gulp-buffer");
const tap = require("gulp-tap");
const include = require("gulp-include");
const rename = require("gulp-rename");
const through2 = require('through2');

/** yabaitube compiler constants */
const SERVER_SRC = "server_src";
const SERVER_DEST = "app";
const CLIENT_SRC = "client_src";
const CLIENT_DEST = "app/static"; // ** Referenced in server src too

/**
 * Compile server
 */
function compileServer(cb)
{
    // Define typescript compiler
    var tsCompile = tsc.createProject(`${SERVER_SRC}/tsconfig.json`);

    function compileTs()
    {
        return new Promise( (r, reject) => {
            // Compile typescript
            src(`${SERVER_SRC}/**/!(_*).ts`)
                .pipe(include())
                .pipe(relativepather())
                .on('error', e => {
                    console.log(e);
                    reject();
                })
                .pipe(tsCompile())
                .on('error', () => {
                    console.log("[compileServer] TypeScript error.");
                    reject();
                })
                .pipe(dest(SERVER_DEST))
                .pipe(tap(() => {
                    r();
                }));
        });
    }

    // Copy templates, svg as used by the server
    // not promise-wrapped cuz I'm lazy and this is
    // fast enough as it is
    src([
        `${SERVER_SRC}/**/*.twig`,
        `${SERVER_SRC}/**/*.njk`,
        `${SERVER_SRC}/**/*.svg`
    ])
        .pipe(dest(SERVER_DEST));

    Promise.all([compileTs()]).then(() => {
        cb();
    });
}

/**
 * Compile client
 */
function compileClient(cb)
{
    // Define typescript compiler
    var tsCompile = tsc.createProject(`${CLIENT_SRC}/tsconfig.json`);

    // Generate a UID to prevent conflicts
    var currentUid = (Math.floor(Math.random() * 1e16)).toString(16);

    // Temporary folder name for browserify hack
    var tempFolderName = `temp_compileClientJs-${currentUid}`;

    // Fix browserify bug
    function delayedCompileJs()
    {
        return new Promise( r => {
            setTimeout(() => {
                compileJs().then(() => { r(); });
            }, 350)
        } );
    }
    
    function compileJs()
    {
        return new Promise( (r, reject) => {
            src(`${CLIENT_SRC}/**/*.raw.js`)
                .pipe(rename(path => {
                    path.basename = path.basename.replace(".raw", "");
                }))
                .pipe(dest(`${CLIENT_DEST}/jsbin`));

            // Compile typescript
            src(`${CLIENT_SRC}/**/*.ts`)
                .pipe(include())
                .pipe(relativepather())
                .pipe(tsCompile())
                .on("error", e => {
                    console.log("[compileClient] TypeScript error.");
                    reject(e);
                })
                .pipe(dest(tempFolderName))
                .pipe(tap(() => {
                    setTimeout(function() {
                        jsPart2();
                    }, 1000);
                }));
            
            // Copy .babelrc to temp path
            src(`${CLIENT_SRC}/.babelrc`)
                .pipe(dest(tempFolderName));

            function jsPart2()
            {
                // Compilation stage part 2
                // Run through browserify, etc.
                src(`${tempFolderName}/**/*.dist.js`)
                    .pipe(browserify({
                        error: "emit"
                    }))
                    .on("error", e => {
                        console.log("[compileClient] Browserify error.", e);
                        deleteTempFolder();
                        reject(e);
                    })
                    .pipe(convertToBuffer())
                    .pipe(babel({
                        sourceRoot: CLIENT_SRC
                    }))
                    .on("error", (e) => {
                        console.log("[compileClient] Babel error.", e.message);
                        deleteTempFolder();
                        reject(e);
                    })
                    .pipe(rename(path => {
                        // Remove .dist.js extension
                        path.basename = path.basename.replace(".dist", "");
                    }))
                    .pipe(dest(`${CLIENT_DEST}/jsbin`))
                    .pipe(tap(() => {
                        deleteTempFolder();
                        r();
                    }))
            }

            function deleteTempFolder()
            {
                del(tempFolderName);
            }
        });
    }
    
    function compileScss()
    {
        return new Promise( (r, reject) => {
            // Postcss plugins
            var plugins = [
                postcssCustomProperties()
            ];

            src(`${CLIENT_SRC}/**/*.dist.scss`)
                .pipe(scss())
                .on("error", e => {
                    console.log("[compileClient] SCSS error");
                    reject(e);
                })
                .pipe(postcss(plugins))
                .pipe(rename(path => {
                    // Remove folder
                    path.dirname = "";
                    
                    // Remove .dist.scss extension
                    path.basename = path.basename.replace(".dist", "");
                }))
                .pipe(dest(`${CLIENT_DEST}/cssbin`))
                .pipe(tap(() => {
                    r();
                }));
        })
    }

    Promise.all([delayedCompileJs(), compileScss()]).then(() => {
        cb();
    });
}

// Default compilation function
// Recompiles automatically and runs in the background to watch for
// changes.
// Runs if you just type "gulp" in this folder's command line
exports.default = function() {
    console.log("Watching for changes...");
    watch(`${SERVER_SRC}/**/*`, { ignoreInitial: false },  compileServer);
    watch(`${CLIENT_SRC}/**/*`, { ignoreInitial: false }, compileClient);
};