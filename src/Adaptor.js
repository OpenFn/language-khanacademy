import { execute as commonExecute, expandReferences } from 'language-common';
import { resolve as resolveUrl } from 'url';
import request from 'request';
import qs from 'qs';

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
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
export function fetch(params) {

  return state => {

    const {
      email,
      password,
      consumerKey,
      secretKey
    } = state.configuration;

    const { getEndpoint, queryParams, postUrl } = expandReferences(params)(state);

    const query = qs.stringify(queryParams)

    const getUrl = resolveUrl('https://www.khanacademy.org/api/v1' + '/', getEndpoint + '?' + query)

    console.log("Fetching data from URL: " + getUrl);

    var getTokenURL = 'https://www.khanacademy.org/api/auth2/request_token';
    var authorizeURL  = 'https://www.khanacademy.org/api/auth2/authorize';
    var accessTokenUrl = 'https://www.khanacademy.org/api/auth2/access_token';

    var nativeOAuthOptions = {
        consumer_key: consumerKey,
        consumer_secret: secretKey
    }

    var req = request.post({url:getTokenURL, oauth: nativeOAuthOptions}, function (e, rsp, body) {

      if ([200,201,202].indexOf(rsp.statusCode) == -1 || e) {
        console.error("Token request failed.");
        throw new Error('Token request failed.')
      } else {

        // pull out the oauth_token and use it in the next post to authorize
        var req_data = qs.parse(body);

        var bodyParams = {
            oauth_token: req_data.oauth_token,
            identifier: email,
            password: password
        };

        // authorize the token
        request.post({followAllRedirects: true, url: authorizeURL, form: bodyParams}, function (e2, rsp2, body2) {

          if ([200,201,202].indexOf(rsp2.statusCode) == -1 || e2) {
            console.error("Token auhorization failed.");
            throw new Error('Token authorization failed.')
          } else {

            // configure authorized request for oauth
            var hasToken = {
                consumer_key: consumerKey,
                consumer_secret: secretKey,
                token: req_data.oauth_token,
                token_secret: req_data.oauth_token_secret
            }

            request.get({url: accessTokenUrl, oauth: hasToken}, function (e3, rsp3, body3) {

              if ([200,201,202].indexOf(rsp3.statusCode) == -1 || e3) {
                console.error("Token exchange failed.");
                throw new Error('Token exchange failed.')
              } else {
                // console.log("Token exchange succeeded.");
                var access_data = qs.parse(body3);

                // confiure request with shiny new access token
                var hasAccess = {
                    consumer_key: consumerKey,
                    consumer_secret: secretKey,
                    token: access_data.oauth_token,
                    token_secret: access_data.oauth_token_secret
                }

                // make authenticated request
                request.get({url: getUrl, oauth: hasAccess}, function (e4, rsp4, body4) {

                  if ([200,201,202].indexOf(rsp4.statusCode) == -1 || e4) {
                    console.error("GET failed.");
                    throw new Error('Get failed.')
                  } else {
                    console.log("GET succeeded.");
                    request.post ({
                      url: postUrl,
                      json: JSON.parse(body4)
                    }, function(error, response, postResponseBody){
                      if(error) {
                        console.error("Post failed.")
                      } else {
                        console.log("POST succeeded.");
                      }
                    })
                  }
                });
              };

            });
          };

        });

      }

    });

  }
}

export {
  field, fields, sourceValue, fields, alterState,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
