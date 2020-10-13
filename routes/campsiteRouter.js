//This module will contain the code for handling the rest API endpoints
//for campsites and campsites/campsitesId
const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/campsite');
const { response } = require('express');
const { Mongoose } = require('mongoose');

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
.get((req, res, next) => {//we use next if run into an error
    Campsite.find()
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsites);//method sends data to the client in the res stream and automatically closes the res stream afterward
    })
    .catch(err => next(err));//passes the err to the overall err handler for this express app, and lets express handle the error.
})
.post((req, res, next) => {//the body parser middleware will have already parsed it into a format that we can work with
    Campsite.create(req.body)//creates a new campsite doc from the req body(contains the info for the campsite to post from the client) and saves it to the mongoDB server
    //THROUGH the create method mongoose will automatically handle checking the data (req.body) to make sure it fits the SCHEMA
    //CREATE a new CAMPSITE doc
    .then(campsite => {//campsite holds info about the doc that was posted
        console.log('Campsite Created', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT opration not supported on /campsites');
})
.delete((req, res, next) => {
    Campsite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});



campsiteRouter.route('/:campsiteId')
// .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)//id is getting parsed from the HTTP req from whatever the user on the client typed in as the id they want to access
    .then(campsite => {//if doc found it will be in this campsite var
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {//it updates the seen res in postman after 1 send if PUT, but if no "new: true" then we see the updated res after the 1st click
        $set: req.body//updates the ? with the req.body | uses as the new/updated res what is in in the req.body|still in the res we can see the updated without the new:true, so maybe its only not updated in the db
    }, { new: true })//true so we get info about the updated doc as the result from this method, and not from the unupdated doc
    .then(campsite => {//the doc with id and updated?
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)//saved route parameter, saved parameter in the router
    .then(response => {//the res that indicates that a deletion has occurred
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err))
});

campsiteRouter.route('/:campsiteId/comments')//already setting path here no need in next method

.get((req, res, next) => {//we use next if run into an error
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {//the campsites doc gets returned as a JS OBJ
        if (campsite) {//we check if a campsite has been returned b/cits possible a null value was returned
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments);//method sends data to the client in the res stream and automatically closes the res stream afterward
            //the rest.json method ensures the campsite obj is properly formatted when it enters the res stream
        } else {
            err = new Error(`Campsite ${req.paramms.campsiteId} not found`);
            err.status = 404;
            return next(err);//passed the err tothe Express error handling mechanism
        }
    })
    .catch(err => next(err));//passes the err to the overall err handler for this express app, and lets express handle the error.
})
.post((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {//the campsites doc gets returned as a JS OBJ
        if (campsite) {//we check if a campsite has been returned b/cits possible a null value was returned
            campsite.comments.push(req.body)//we are assuming the req.body has a comment in it AND the bpdyParser middleware has already parsed(to JSON?) it so we can use it like this
            //THIS ONLY changes the (sub) comments array in the app's memory and not the comments subdoc in the MongoDB
            campsite.save()//saves it in the mongodb, NON-STATIC method bc it's performed on this particular instance, does not start w a capital C the doc itself. Returns a PROM
            .then(campsite => {//if it resolves we get the saved doc back and we'll send it back to the client
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);//method sends data to the client in the res stream and automatically closes the res stream afterward
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.paramms.campsiteId} not found`);
            err.status = 404;
            return next(err);//passed the err tothe Express error handling mechanism
        }
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete((req, res, next) => {//Deletes ALL the comments in a particaular campsite
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            console.log('||||||||||')
            console.log(campsite)
            console.log('||||||||||')
            for (let i=campsite.comments.length-1; i >=0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            // campsite.comments = [];
            //THIS ONLY changes the (sub) comments array in the app's memory and not the comments subdoc in the MongoDB
            campsite.save()//saves it in the mongodb, NON-STATIC method bc it's performed on this particular instance, does not start w a capital C the doc itself. Returns a PROM
            .then(campsite => {//if it resolves we get the saved doc back and we'll send it back to the client
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);//method sends data to the client in the res stream and automatically closes the res stream afterward
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.paramms.campsiteId} not found`);
            err.status = 404;
            return next(err);//passed the err tothe Express error handling mechanism
        }
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId')//already setting path here no need in next method
.get((req, res, next) => {//we use next if run into an error
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {//the campsites doc gets returned as a JS OBJ
        console.log(req.params)
        if (campsite && campsite.comments.id(req.params.commentId)) {//we check if a campsite has been returned b/c its possible a null value was returned AND if it has a comments value
            res.statusCode = 200;//|||||||||||||||||||
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId));//method sends data to the client in the res stream and automatically closes the res stream afterward
            //the rest.json method ensures the campsite obj is properly formatted when it enters the res stream
        } else if(!campsite) {
            err = new Error(`Campsite ${req.paramms.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.paramms.commentId} not found`);//Al the IDs is located in req.params, regardless of if 1was first in the route or not.
            err.status = 404;
            return next(err);//passed the err tothe Express error handling mechanism
        }
    })
    .catch(err => next(err));//passes the err to the overall err handler for this express app, and lets express handle the error.
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {//the campsites doc gets returned as a JS OBJ
        console.log(req.params)
        if (campsite && campsite.comments.id(req.params.commentId)) {//we check if a campsite has been returned b/c its possible a null value was returned AND if it has a comments value
            if (req.body.rating) {
                campsite.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.text) {//These 2 ifs can potentially update them both, either, or neither the rating and comment text
                campsite.comments.id(req.params.commentId).text = req.body.text;
            }
            campsite.save()//save on the campsite doc.
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else if(!campsite) {
            err = new Error(`Campsite ${req.paramms.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.paramms.commentId} not found`);//Al the IDs is located in req.params, regardless of if 1was first in the route or not.
            err.status = 404;
            return next(err);//passed the err tothe Express error handling mechanism
        }
    })
    .catch(err => next(err));//passes the err to the overall err handler for this express app, and lets express handle the error.
})
.delete((req, res, next) => {//Deletes ONE particular comment in a particular campsite 
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {//we check if a campsite has been returned b/c its possible a null value was returned AND if it has a comments value
            campsite.comments.id(req.params.commentId).remove();
            campsite.save()//save on the campsite doc.
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else if(!campsite) {
            err = new Error(`Campsite ${req.paramms.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.paramms.commentId} not found`);//Al the IDs is located in req.params, regardless of if 1was first in the route or not.
            err.status = 404;
            return next(err);//passed the err tothe Express error handling mechanism
        }
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;