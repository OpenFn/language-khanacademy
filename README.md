# _⚠️ MOVED TO [OpenFn/adaptors](https://github.com/OpenFn/adaptors)! ⚠️_

**N.B.: New versions are available at:
https://github.com/OpenFn/adaptors/tree/main/packages/khanacademy**

# Language KhanAcademy (Archived)
=============

Language Pack for building expressions and operations to make HTTP calls.

Documentation
-------------
## fetch

#### Sample configuration

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
    "email": "thisoneuser@something.org"
  },
  "postUrl": "https://www.openfn.org/inbox/your-uuid",
})
```

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
