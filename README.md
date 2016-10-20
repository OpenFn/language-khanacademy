Language HTTP
=============

Language Pack for building expressions and operations to make HTTP calls.

Documentation
-------------
## fetch

#### required configuration for a Khan teacher/school account
```json
{
  "email": "yours",
  "password": "notmine",
  "consumerKey": "somEThINGkeyish",
  "secretKey": "otherThiNGfSECret"
}

```

#### sample usage
```js
fetch({
  "getEndpoint": "user",
  "queryParams": {
    "email": "jay.kloppenberg@ase.org.za"
  },
  "postUrl": "https://www.openfn.org/inbox/07a6ff42-f534-438e-99c4-5fb7e78efe99",
})
```

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
