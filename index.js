'use strict';
/**
 * Created by xenotime on 19/10/16.
 */
 
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

// Consolidate all Error Messages
const ERROR_MESSAGE = {
  AUTH0_CLIENT_ID: 'Auth0 client id is required. set AUTH0_CLIENT_ID as an environment variable',
  AUTH0_CLIENT_SECRET: 'Auth0 client secret is required. set AUTH0_CLIENT_SECRET as an environment variable',
  AUTH0_CONNECTION: 'Auth0 connection name is required. set AUTH0_CONNECTION as an environment variable',
  AUTH0_DOMAIN: 'Auth0 domain name is required. set AUTH0_DOMAIN as an environment variable',
};

// Validate inputs to the middleware
function validate(config) {
  if (!config.AUTH0_CLIENT_ID) {
    throw new Error(ERROR_MESSAGE.AUTH0_CLIENT_ID);
  }
  if (!config.AUTH0_CLIENT_SECRET) {
    throw new Error(ERROR_MESSAGE.AUTH0_CLIENT_SECRET);
  }
  if (!config.AUTH0_CONNECTION) {
    throw new Error(ERROR_MESSAGE.AUTH0_CONNECTION);
  }
  if (!config.AUTH0_DOMAIN) {
    throw new Error(ERROR_MESSAGE.AUTH0_DOMAIN);
  }
}

// Environment variables are stored as strings only, we need boolean values
// allowing user the flexibilty to enter
// yes, True etc
function stringToBoolean(string) {
  switch (string.toLowerCase().trim()) {
    case 'true': case 'yes': case '1': return true;
    case 'false': case 'no': case '0': case null: return false;
    default: return Boolean(string);
  }
}

// ====================================================================================//
// Middleware code begins here, options is optional, if no value is passed, it is fine
// is provided to override any environment configuration
// ====================================================================================//
const lillyAuth = (app, options) => {
  const defaultConfig = {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_CONNECTION: process.env.AUTH0_CONNECTION,
    ALLOW_ANONYMOUS: process.env.ALLOW_ANONYMOUS,
    HOST: process.env.HOST || 'http://localhost:3000',
    CALLBACK_URL: process.env.CALLBACK_URL || '/callback',
    ERROR_PAGE: process.env.ERROR_PAGE || '/error',
    SESSION_SECRET: process.env.SESSION_SECRET || 'lillyshhhhh',
  };

  defaultConfig.ALLOW_ANONYMOUS = defaultConfig.ALLOW_ANONYMOUS ?
      stringToBoolean(defaultConfig.ALLOW_ANONYMOUS.toLowerCase()) : false;

  // By default assume we need authentication
  if (!defaultConfig.ALLOW_ANONYMOUS) {
    const config = {
      AUTH0_DOMAIN: (options && options.AUTH0_DOMAIN) || defaultConfig.AUTH0_DOMAIN,
      AUTH0_CLIENT_ID: (options && options.AUTH0_CLIENT_ID) || defaultConfig.AUTH0_CLIENT_ID,
      AUTH0_CLIENT_SECRET: (options && options.AUTH0_CLIENT_SECRET)
                        || defaultConfig.AUTH0_CLIENT_SECRET,
      HOST: (options && options.HOST) || defaultConfig.HOST,
      AUTH0_CONNECTION: (options && options.AUTH0_CONNECTION) || defaultConfig.AUTH0_CONNECTION,
      CALLBACK_URL: (options && options.CALLBACK_URL)
                        || defaultConfig.CALLBACK_URL,
      ERROR_PAGE: (options && options.ERROR_PAGE) || defaultConfig.ERROR_PAGE,
      SESSION_SECRET: (options && options.SESSION_SECRET) || defaultConfig.SESSION_SECRET,
    };

    // run validation for input values
    validate(config);

    const strategy = new Auth0Strategy({
      domain: config.AUTH0_DOMAIN,
      clientID: config.AUTH0_CLIENT_ID,
      clientSecret: config.AUTH0_CLIENT_SECRET,
      callbackURL: config.HOST + config.CALLBACK_URL,
    }, (accessToken, refreshToken, extraParams, profile, done) => done(null, profile));

    passport.use(strategy);

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({
      secret: config.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get(config.CALLBACK_URL,
        passport.authenticate('auth0', { connection: config.AUTH0_CONNECTION, failureRedirect: config.ERROR_PAGE }),
        (req, res) => {
          res.redirect(req.session.returnTo || '/');
        });

    return (req, res, next) => {
      if (!req.isAuthenticated() && req.originalUrl.indexOf(config.CALLBACK_URL) === -1) {
        passport.authenticate('auth0', { connection: config.AUTH0_CONNECTION })(res, res, next);
      } else {
        next();
      }
    };
  }
  return (req, res, next) => {
    next();
  };
};

module.exports = lillyAuth;
