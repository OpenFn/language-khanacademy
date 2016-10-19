'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;

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

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

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
* @returns  {Operation}
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
        return _languageCommon.execute.apply(undefined, [requestToken(), authorizeToken()].concat(operations))(_extends({}, initialState, state));
    };
}

function requestToken() {
    return function (state) {
        var _state$configuration = state.configuration;
        var email = _state$configuration.email;
        var password = _state$configuration.password;
        var consumerKey = _state$configuration.consumerKey;
        var secretKey = _state$configuration.secretKey;


        if (state.configuration.oauth_token) {
            return state;
        } else {

            return new Promise(function (resolve, reject) {

                var getTokenURL = 'https://www.khanacademy.org/api/auth2/request_token';
                var nativeOAuthOptions = {
                    consumer_key: consumerKey,
                    consumer_secret: secretKey
                };

                _request2.default.post({
                    url: getTokenURL,
                    oauth: nativeOAuthOptions
                }, function (error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        var req_data = _querystring2.default.parse(body);
                        state.configuration.oauth_token = req_data.oauth_token;
                        resolve(state);
                    }
                });
            });
        }
    };
}

//
// /**
//  * Fetch data from the Khan Academy API
//  * @example
//  * execute(
//  *   fetch(params)
//  * )(state)
//  * @constructor
//  * @param {object} params - data to make the query
//  * @returns {Operation}
//  */
// export function getToken(params) {
//
//   return state => {

// const {
//   email,
//   password,
//   consumerKey,
//   secretKey
// } = state.configuration;
//
//     const { getEndpoint, postUrl } = expandReferences(params)(state);
//
//     const getUrl = resolveUrl('https://www.khanacademy.org/api/v1' + '/', getEndpoint)
//
//     console.log("Fetching data from URL: " + getUrl);
//
//
//
//
//         // authorize the token
//         request.post({followAllRedirects: true, url: authorizeURL, form: bodyParams},
//           function (e2, rsp2, body2) {
//           console.log("Response status", rsp2.statusCode);
//           console.log("Response body", rsp2.body);
//
//           // configure authorized request for oauth
//           var hasToken = {
//               consumer_key: consumerKey,
//               consumer_secret: secretKey,
//               token: req_data.oauth_token,
//               token_secret: req_data.oauth_token_secret
//           }
//
//           request.get({url: accessTokenUrl, oauth: hasToken}, function (e3, rsp3, body3) {
//             console.log("Response status", rsp3.statusCode);
//             console.log("Response body", rsp3.body);
//
//             var access_data = qs.parse(body3);
//
//           });
//
//         });
//
//     });
//
//   }
// }

// // confiure request with shiny new access token
// var hasAccess = {
//     consumer_key: consumerKey,
//     consumer_secret: secretKey,
//     token: access_data.oauth_token,
//     token_secret: access_data.oauth_token_secret
// }
//
// // var uri = `https://www.khanacademy.org/api/v1/user?oauth_token=${access_data.oauth_token}&oauth_consumer_key=${consumerKey}`
//
// // make authenticated request
// request.get({url: "https://www.khanacademy.org/api/v1/user", oauth: hasAccess}, function (e4, rsp4, body4) {
//   console.log("Response status", rsp4.statusCode);
//   console.log("Response body", rsp4.body);
//
//   if ([200,201,202].indexOf(rsp4.statusCode) == -1 || e4) {
//     console.error("GET failed.");
//   } else {
//     console.log("GET succeeded.");
//     request.post ({
//       url: postUrl,
//       json: JSON.parse(body4)
//     }, function(error, response, postResponseBody){
//       if(error) {
//         console.error("Post failed.")
//       } else {
//         console.log("POST succeeded.");
//       }
//     })
//   }
// });
