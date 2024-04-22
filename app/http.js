"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("./http");
function startServer(listener) {
    console.log("Running server on 127.0.0.1:8080");
    http.createServer(listener).listen(8080);
}
exports.default = startServer;
