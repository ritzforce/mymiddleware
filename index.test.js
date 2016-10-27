'use strict';

// This will create stubbed functions for our overrides
const sinon = require('sinon');
// Supertest allows us to make requests against an express object
const supertest = require('supertest');
// Natural language-like assertions
const expect = require('chai').expect;
const express = require('express');

describe('Auth Middleware Scenario Tests', function () {
  context('Allow Anonymous Access', function () {
    let app, getUserStub, request, lillyAuthMiddleware;
	
    beforeEach(function () {
      // A stub we can use to control conditionals
      getUserStub = sinon.stub();
      // Create an express application object
      app = express();
      app.get('/', function (req, res) {
        res.json({
          status: 'ok'
        });
      });
    });

    it('Validate Anonymous Access Is Allowed', function (done) {
      process.env.ALLOW_ANONYMOUS = '1';
      // Get our router module, with a stubbed out users dependency
      // we stub this out so we can control the results returned by
      // the users module to ensure we execute all paths in our code
      lillyAuthMiddleware = require('./index');
      // Bind a route to our application
      lillyAuthMiddleware(app);
      app.use(lillyAuthMiddleware);
      // Get a supertest instance so we can make requests
      request = supertest(app);

      getUserStub.returns(null);

      request
        .get('/')
        .expect(200, function (err, res) {
	      expect(res.body).to.deep.equal({
            status: 'ok'
          });
          done();
		});
    }); // close it
  }); // close context

  context('Allow Authentication When Anonymous Access not Present', function() {
    let app, getUserStub, request, lillyAuthMiddleware;

    beforeEach(function () {
      // A stub we can use to control conditionals
      getUserStub = sinon.stub();
      // Create an express application object
      app = express();
      app.get('/', function (req, res) {
        res.json({
          status: 'ok'
        });
      });
    });

    it('AUTH0_CLIENT_ID validation error', function (done) {
      process.env.ALLOW_ANONYMOUS = '0';

      // Get our router module, with a stubbed out users dependency
      // we stub this out so we can control the results returned by
      // the users module to ensure we execute all paths in our code
      lillyAuthMiddleware = require('./index');

      // Bind a route to our application
      try {
        lillyAuthMiddleware(app);
      }
      catch (ex) {
        expect(ex.message).equal('Auth0 client id is required. set AUTH0_CLIENT_ID as an environment variable');
        done();
      }
    });// close it
  
    it('AUTH0_CLIENT_SECRET validation error', function (done) {
      process.env.ALLOW_ANONYMOUS = '0';

      // Get our router module, with a stubbed out users dependency
      // we stub this out so we can control the results returned by
      // the users module to ensure we execute all paths in our code
      lillyAuthMiddleware = require('./index');
      // Bind a route to our application
      try {
        lillyAuthMiddleware(app, { AUTH0_CLIENT_ID: '1212121122' });
      }
      catch (ex) {
        expect(ex.message).equal('Auth0 client secret is required. set AUTH0_CLIENT_SECRET as an environment variable');
        done();
      }
    }); // close it
  
    it('AUTH0_CONNECTION validation error', function (done) {
      process.env.ALLOW_ANONYMOUS = '0';
      // Get our router module, with a stubbed out users dependency
      // we stub this out so we can control the results returned by
      // the users module to ensure we execute all paths in our code
      lillyAuthMiddleware = require('./index');

      // Bind a route to our application
      try {
        lillyAuthMiddleware(app, { AUTH0_CLIENT_ID: '1212121122', AUTH0_CLIENT_SECRET: 'wasdasjdhkjerefv' });
      }
      catch (ex) {
        expect(ex.message).equal('Auth0 connection name is required. set AUTH0_CONNECTION as an environment variable');
        done();
      }
    }); // close it
  
    it('AUTH0_DOMAIN validation error', function (done) {
      process.env.ALLOW_ANONYMOUS = '0';

      // Get our router module, with a stubbed out users dependency
      // we stub this out so we can control the results returned by
      // the users module to ensure we execute all paths in our code
      lillyAuthMiddleware = require('./index');
      // Bind a route to our application
      try {
        lillyAuthMiddleware(app, { AUTH0_CLIENT_ID: '1212121122', AUTH0_CLIENT_SECRET: 'wasdasjdhkjerefv', AUTH0_CONNECTION: 'lilly_auth_qa' });
      }
      catch (ex) {
        expect(ex.message).equal('Auth0 domain name is required. set AUTH0_DOMAIN as an environment variable');
        done();
      }
    }); // close it
  }); // close context
}); // close describe
