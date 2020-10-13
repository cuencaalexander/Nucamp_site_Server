//This module will contain the code for handling the rest API endpoints
//for campsites and campsites/campsitesId
const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/campsite');

//the router is like a mini express app therF it has access to the use method for attaching middleware.
const campsiteRouter = express.Router();

//we add to this mini-like router the bodyParser middleware for handling requests bodies formatted in JSON
campsiteRouter.use(bodyParser.json());

//handling the routing: // Slash means is for the campsites path
campsiteRouter.route('/')//already setting path here no need in next method

//Instead of having 5 routing methods that are called seperately we are going to CHAIN the methods together, all these methdos share the same path
//1 statement that handles all the endpoints for routing to campsites
//.all is a routing method that catches all HTTP verbs, well use this to set some props on the RES obj that well use as a default for all the routing methods for this path
//so that we dont have to set it repeatedly on each one.
//any http req to this path will trigger this method
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res) => {
    res.end('Will send all the campsites to you');
})
.post((req, res) => {
    res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT opration not supported on /campsites');
})
.delete((req, res) => {
    res.end('Deleting all campsites');
});



campsiteRouter.route('/:campsiteId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res) => {
    res.end(`Will send details of the campsite: ${req.params.campsiteId} to you`);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res) => {

    res.write(`Updating the campsite: ${req.params.campsiteId}\n`);
    res.end(`Will update the campsite: ${req.body.name}
    with description: ${req.body.description}`);
})
.delete((req, res) => {
    res.end(`Deleting campsite: ${req.params.campsiteId}`);
})

module.exports = campsiteRouter;