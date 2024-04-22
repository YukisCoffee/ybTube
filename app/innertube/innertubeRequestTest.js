"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
async function innertubeRequestTest() {
    var a = await (0, node_fetch_1.default)("https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false", {
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-Goog-Visitor-Id": "CgtWUW5fejNjSDVHYyiqpbeTBg%3D%3D",
            "X-Youtube-Client-Name": "1",
            "X-Youtube-Client-Version": "2.20220429.00.00",
            "X-Goog-AuthUser": "0",
            "X-Origin": "https://www.youtube.com",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "same-origin",
            "Sec-Fetch-Site": "same-origin"
        },
        "body": "{\"context\":{\"client\":{\"hl\":\"en\",\"gl\":\"JP\",\"remoteHost\":\"[REDACTED]\",\"deviceMake\":\"\",\"deviceModel\":\"\",\"visitorData\":\"CgtWUW5fejNjSDVHYyiqpbeTBg%3D%3D\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20220429.00.00\",\"osName\":\"Windows\",\"osVersion\":\"10.0\",\"originalUrl\":\"https://www.youtube.com/\",\"platform\":\"DESKTOP\",\"clientFormFactor\":\"UNKNOWN_FORM_FACTOR\",\"configInfo\":{\"appInstallData\":\"CKqlt5MGEOiQrgUQmN79EhDqkK4FELfLrQUQ1IOuBRC4i64FEJjqrQUQ8IKuBRCUj64FEPyLrgUQ1-P9EhD3iq4FEJr0rQUQkfj8EhDYvq0F\"},\"userInterfaceTheme\":\"USER_INTERFACE_THEME_DARK\",\"timeZone\":\"Asia/Tokyo\",\"browserName\":\"Firefox\",\"browserVersion\":\"99.0\",\"screenWidthPoints\":1437,\"screenHeightPoints\":465,\"screenPixelDensity\":1,\"screenDensityFloat\":1,\"utcOffsetMinutes\":540,\"mainAppWebInfo\":{\"graftUrl\":\"/\",\"webDisplayMode\":\"WEB_DISPLAY_MODE_BROWSER\",\"isWebNativeShareAvailable\":false}},\"user\":{\"lockedSafetyMode\":false},\"request\":{\"useSsl\":true,\"internalExperimentFlags\":[],\"consistencyTokenJars\":[]},\"clickTracking\":{\"clickTrackingParams\":\"CCAQsV4iEwjJ7PedhL33AhVMSEwIHbmSDhU=\"},\"adSignalsInfo\":{\"params\":[{\"key\":\"dt\",\"value\":\"1651364522839\"},{\"key\":\"flash\",\"value\":\"0\"},{\"key\":\"frm\",\"value\":\"0\"},{\"key\":\"u_tz\",\"value\":\"540\"},{\"key\":\"u_his\",\"value\":\"2\"},{\"key\":\"u_h\",\"value\":\"1080\"},{\"key\":\"u_w\",\"value\":\"1920\"},{\"key\":\"u_ah\",\"value\":\"1080\"},{\"key\":\"u_aw\",\"value\":\"1858\"},{\"key\":\"u_cd\",\"value\":\"24\"},{\"key\":\"bc\",\"value\":\"31\"},{\"key\":\"bih\",\"value\":\"465\"},{\"key\":\"biw\",\"value\":\"1422\"},{\"key\":\"brdim\",\"value\":\"362,20,362,20,1858,0,1449,961,1437,465\"},{\"key\":\"vis\",\"value\":\"1\"},{\"key\":\"wgl\",\"value\":\"true\"},{\"key\":\"ca_type\",\"value\":\"image\"}]}},\"browseId\":\"FEwhat_to_watch\"}",
        "method": "POST"
    });
    return a;
}
exports.default = innertubeRequestTest;
