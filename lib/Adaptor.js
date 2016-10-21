'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.fetch = fetch;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _url = require('url');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for khanacademy.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Fetch data from the Khan Academy API
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the query
 * @returns {Operation}
 */
function fetch(params) {

  function assembleError(_ref) {
    var response = _ref.response;
    var error = _ref.error;

    if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
    if (error) return error;
    return new Error('Server responded with ' + response.statusCode);
  }

  return function (state) {
    var _state$configuration = state.configuration;
    var email = _state$configuration.email;
    var password = _state$configuration.password;
    var consumerKey = _state$configuration.consumerKey;
    var secretKey = _state$configuration.secretKey;

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state);

    var getEndpoint = _expandReferences.getEndpoint;
    var queryParams = _expandReferences.queryParams;
    var postUrl = _expandReferences.postUrl;


    var query = _qs2.default.stringify(queryParams);

    var getUrl = (0, _url.resolve)('https://www.khanacademy.org/api/v1' + '/', getEndpoint + '?' + query);

    console.log("Fetching data from URL: " + getUrl);

    var getTokenURL = 'https://www.khanacademy.org/api/auth2/request_token';
    var authorizeURL = 'https://www.khanacademy.org/api/auth2/authorize';
    var accessTokenUrl = 'https://www.khanacademy.org/api/auth2/access_token';

    var nativeOAuthOptions = {
      consumer_key: consumerKey,
      consumer_secret: secretKey
    };

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: getTokenURL,
        oauth: nativeOAuthOptions
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          console.error("Token request failed.... KHAAAAAAN!");
          reject(error);
        } else {
          console.log("Token request successful.");
          resolve(_qs2.default.parse(body));
        }
      });
    }).then(function (body) {
      // save for later!
      var auth = {
        oauth_token: body.oauth_token,
        oauth_token_secret: body.oauth_token_secret
      };

      // pull out the oauth_token and use it in the next post to authorize
      var bodyParams = {
        oauth_token: body.oauth_token,
        identifier: email,
        password: password
      };

      // authorize the token
      return new Promise(function (resolve, reject) {
        _request2.default.post({
          followAllRedirects: true,
          url: authorizeURL,
          form: bodyParams
        }, function (error, response, body) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("Token authorization failed... KHAAAAAAN!");
            reject(error);
          } else {
            console.log("Token auhorization successful.");
            resolve(auth);
          }
        });
      });
    }).then(function (auth) {
      // configure authorized request for oauth
      var hasToken = {
        consumer_key: consumerKey,
        consumer_secret: secretKey,
        token: auth.oauth_token,
        token_secret: auth.oauth_token_secret
      };

      // exchange for an access token
      return new Promise(function (resolve, reject) {
        _request2.default.get({
          url: accessTokenUrl,
          oauth: hasToken
        }, function (error, response, body) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("Token exchange failed.... KHAAAAAAN!");
            reject(error);
          } else {
            console.log("Token exchange successful.");
            resolve(_qs2.default.parse(body));
          }
        });
      });
    }).then(function (body) {
      // confiure request with shiny new access token
      var hasAccess = {
        consumer_key: consumerKey,
        consumer_secret: secretKey,
        token: body.oauth_token,
        token_secret: body.oauth_token_secret
      };

      // make authenticated GET from Khan!
      return new Promise(function (resolve, reject) {
        _request2.default.get({
          url: getUrl,
          oauth: hasAccess
        }, function (error, response, body) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("GET failed.... KHAAAAAAN!");
            reject(error);
          } else {
            console.log("GET succeeded.");
            resolve(body);
          }
        });
      });
    })

    // post it somewhere else
    .then(function (body) {
      return new Promise(function (resolve, reject) {
        _request2.default.post({
          url: postUrl,
          json: JSON.parse(body)
        }, function (error, response, body) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("POST failed.... KHAAAAAAN!");
            reject(error);
          } else {
            console.log("POST succeeded.");
            resolve(body);
          }
        });
      });
    });
  };
}
