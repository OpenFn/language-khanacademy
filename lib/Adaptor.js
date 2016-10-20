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

    var req = _request2.default.post({ url: getTokenURL, oauth: nativeOAuthOptions }, function (e, rsp, body) {
      console.log("Response status", rsp.statusCode);
      console.log("Response body", rsp.body);

      // pull out the oauth_token and use it in the next post to authorize
      var req_data = _qs2.default.parse(body);

      var bodyParams = {
        oauth_token: req_data.oauth_token,
        identifier: email,
        password: password
      };

      // authorize the token
      _request2.default.post({ followAllRedirects: true, url: authorizeURL, form: bodyParams }, function (e2, rsp2, body2) {
        console.log("Response status", rsp2.statusCode);
        console.log("Response body", rsp2.body);

        // configure authorized request for oauth
        var hasToken = {
          consumer_key: consumerKey,
          consumer_secret: secretKey,
          token: req_data.oauth_token,
          token_secret: req_data.oauth_token_secret
        };

        _request2.default.get({ url: accessTokenUrl, oauth: hasToken }, function (e3, rsp3, body3) {
          console.log("Response status", rsp3.statusCode);
          console.log("Response body", rsp3.body);

          var access_data = _qs2.default.parse(body3);

          // confiure request with shiny new access token
          var hasAccess = {
            consumer_key: consumerKey,
            consumer_secret: secretKey,
            token: access_data.oauth_token,
            token_secret: access_data.oauth_token_secret
          };

          // make authenticated request
          _request2.default.get({ url: getUrl, oauth: hasAccess }, function (e4, rsp4, body4) {
            console.log("Response status", rsp4.statusCode);
            console.log("Response body", rsp4.body);

            if ([200, 201, 202].indexOf(rsp4.statusCode) == -1 || e4) {
              console.error("GET failed.");
            } else {
              console.log("GET succeeded.");
              _request2.default.post({
                url: postUrl,
                json: JSON.parse(body4)
              }, function (error, response, postResponseBody) {
                if (error) {
                  console.error("Post failed.");
                } else {
                  console.log("POST succeeded.");
                }
              });
            }
          });
        });
      });
    });
  };
}
