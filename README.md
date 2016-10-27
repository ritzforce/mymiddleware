#LUSA WEB AUTH

#### Introduction
The web auth is an NodeJS Express middleware, that authenticates a Lilly user using Lilly's Single Sign On Implementation. 

#### Details
The middleware uses the following external libraries
* Passport
* Auth0 Heroku Add On
* Other helper libraries, like cookie-parser, body -parser etc.

#### Sample Usage 
Use the following syntax to use the middleware in your Express Application

    'use strict';
    const express = require('express');
    const path = require('path');
    const app = express();
    //Create an instance of the auth middleware
    const lillyAuth = require('lillyAuth')(app);
    //use the middleware, to be invoked in all requests
    app.use(lillyAuth);
#### Environment Variables
Auth0 and Passport require several several environment configuration variables to be able to work properly. Here is the list of all environment variables used the the middleware. In some cases, where feasible, the middleware assumes some defaults.

*Please note the the suffix after Auth is numerical zero (0) and not alphabetical O*

The Auth0 configuration options will be available via the Administrator. The following values needs to be set.
Usually the Auth0 will be consistent for all the applications.
* AUTH0_CLIENT_ID
* AUTH0_CLIENT_SECRET
* AUTH0_CONNECTION
* AUTH0_DOMAIN


Other Per Application Environment Variable Configuration
* ALLOW_ANONYMOUS (Allowed Values true/false, Default : false)
* HOST (No default)
* CALLBACK_URL (default /callback)
* ERROR_PAGE (default /error)
* SESSION_SECRET (default value present)

Notes
*The middleware searches for Allow Anonymous environment variable. If the variable is missing, it authenticates all requests, including css and images etc.
The Host value should be set to current Heroku host name. Auth0 will redirect back using the hostname and the callback url.*

#### Auth0 Configuration
1. Session Timeout
Session timeout is set to 1800 seconds i.e. 30 minutes, via the Auth0 Client.

#### Running Tests on Middleware
npm run tests

#### Running Lint on Middleware
npm run lint 
