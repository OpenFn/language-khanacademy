Language HTTP
=============

Language Pack for building expressions and operations to make HTTP calls.

Documentation
-------------
## get

#### required configuration for a Khan teacher/school account
```json
{
  "username": "some-host-url.compute-1.amazonaws.com",
  "password": "5432",
  "apiToken": "wouldntyouliketoknow"
}

```

#### sample usage
```js
get("badges", "username")
```

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
