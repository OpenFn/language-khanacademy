import {execute as commonExecute, expandReferences} from 'language-common';
import {resolve as resolveUrl} from 'url';
import request from 'request';
import qs from 'querystring';

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
export function execute(...operations) {
    const initialState = {
        references: [],
        data: null
    }

    return state => {
        return commonExecute(
          requestToken(),
          authorizeToken(),
          // tradeForAccess(),
          ...operations
        )({ ...initialState, ...state })
    };

}

function requestToken() {
  return state => {
    const { email, password, consumerKey, secretKey } = state.configuration;

    if (state.configuration.oauth_token) {
        return state
    } else {

        return new Promise((resolve, reject) => {

            var getTokenURL = 'https://www.khanacademy.org/api/auth2/request_token';
            var nativeOAuthOptions = {
                consumer_key: consumerKey,
                consumer_secret: secretKey
            }

            request.post({
                url: getTokenURL,
                oauth: nativeOAuthOptions
            }, function(error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    var req_data = qs.parse(body);
                    state.configuration.oauth_token = req_data.oauth_token;
                    resolve(state)
                }
            })

        })

    }
  }
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

export {
    field,
    fields,
    sourceValue,
    fields,
    alterState,
    merge,
    dataPath,
    dataValue,
    lastReferenceValue
}
from 'language-common';
