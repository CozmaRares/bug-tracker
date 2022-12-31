# Server requests return with the wrong status code

## Affected paths

* /api/login
  * should return 401 (unauthorized) for inexistent user
  * returns 404 (not found)
* /api/register
  * should return 400 (bad request) if the given email is in the database
  * returns 500 (server error)
  