"use strict";

var router = require("express").Router(); //initiate Router

/**
 * This function is used to document/debug all the request which are received by the mockserver.
 * We need this functionality because we are always delivering the same response and would not be able to check the correctness.
 * 
 * @param {any} request 
 */
function logGETParameters(request) {
    console.log(request.query);
}

/**
 * This route delivers the timeseries of an aspect of a single asset.
 */
router.get("/config", function (request, response, next) {
    logGETParameters(request);
    var itemsConfig = require("./config.json");
    response.status(200).json(itemsConfig);
});

router.get("/order", function(request, response) {
    logGETParameters(request);
    response.status(200).json({message: "OK"});
});

module.exports = router;