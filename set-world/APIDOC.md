# Set World Users API

**Author:** Pearl Chen
**Last Updated:** 06/17/23

The Set World Users API enable you to get information about Set World's users, log them in as cookie storage, add friends, get and update scores for Set World's leaderboard, and register new users.

Summary of endpoints:

- GET /users

- GET /login

- POST /newUser

- POST /addFriend/:username

- POST /updateScore

In the current version of this API, all error responses are returned as plain text.

Contact the author at yishuc@caltech.edu for any bug reports or feature requests!

## _GET /users_

**Returned Data Format**: JSON

**Description:**
Returns a JSON collection of users' info with matching specified filter parameters, except for the user logged in.

Requires curr_user cookie.

**Parameters**

- friend-status (optional)

  - Filter parameter to specify the users' friend status with the logged in user
  - Requires curr_user cookie for who logged in

- species (optional)

  - Filter parameter to specify the users' species

- min-highscore (optional)

  - Filter parameter to specify the users' minimum record high score in the game

- sort (optional)
  - "scores": returns the same list except in order of descending scores instead

**Example Request:** `/users?friend-status=&species=eel&sort=scores`

**Example Response:**

```json
[
  {
    "username": "party eel",
    "password": "123",
    "image_path": "media/avatars/purple-narrow.png",
    "species": "eel",
    "friends": [],
    "high_score": 4810,
    "email": "inthemistofoodles@gmail.com"
  },
  {
    "username": "happy eel",
    "password": "123",
    "image_path": "media/avatars/orange-wide.png",
    "species": "eel",
    "friends": [],
    "high_score": 4512,
    "email": "inthemistofoodles@gmail.com"
  },
  {
    "username": "sus eel",
    "password": "123",
    "image_path": "media/avatars/purple-wide.png",
    "species": "eel",
    "friends": [],
    "high_score": 2096,
    "email": "yishuc@caltech.edu"
  }
]
```

**Error Handling:**

- Any query parameters not specified above will be ignored.
- Missing cookies grants a text error

## _GET /login_

**Returned Data Format**: JSON

**Description:**
Logs in user and updates cookies for a new visit by logging user into "curr_user".

**Parameters**

- headers (required):
  - needs fields username and password

**Example Request:** `/login`

With headers:

```json
{
  "username": "happy eel",
  "password": "123"
}
```

**Example Response:**

```json
{
  "username": "happy eel",
  "password": "123",
  "image_path": "media/avatars/orange-wide.png",
  "species": "eel",
  "friends": [],
  "high_score": 4512,
  "email": "inthemistofoodles@gmail.com"
}
```

**Error Handling:**

- Missing username in users.json grants text error
- Incorrect password grants text error

## _POST /newUser_

**Returned Data Format**: text

**Description:**
Registers new user in database. Returns whether registration was successful.

**Parameters**

- body (required)

  - Requires fields username, password, image_path, species, and email

**Example Request:** `/newUser`

With body:

```json
{
  "username": "happy eel",
  "password": "123",
  "image_path": "media/avatars/orange-wide.png",
  "species": "eel",
  "email": "inthemistofoodles@gmail.com"
}
```

**Example Response:**

```text
Request to add new user party eel successfully received!
```

**Error Handling:**

- Missing required fields in body grants a text error
- If any field is empty string, returns text error
- If username repeats one already in database, a text error is returned

## _POST /addFriend/:username_

**Returned Data Format**: JSON

**Description:**
Returns a JSON object containing 2 updated friends lists: one of the current logged in user and one of friend after adding the current user as a friend.

Requires curr_user cookie.

**Parameters**

- username (required)

  - username of the friend that the current user would like to add

**Example Request:** `/addFriend/clamoodle`

With cookie:

```js
cookies.curr_user.username = "happy eel";
```

**Example Response:**

```json
{
  "curr_user": ["pol", "crunchy", "clamoodle"],
  "friend": ["pol", "happy eel"]
}
```

**Error Handling:**

- Missing username path parameter gives text error
- Missing cookie for current user gives text error

## _POST /updateScore_

**Returned Data Format**: JSON

**Description:**
Posts a new score for a specific user, if this score is higher than user's previous high score, or if user has no score records, this score will be saved as the user's high score.

Returns the JSON object of the user's info.

Requires curr_user cookie.

**Parameters**

- body (required)
  - Requires score entry

**Example Request:** `/updateScore`

With body:

```json
{
  "score": 2000
}
```

and cookie:

```js
cookies.curr_user.username = "party eel";
```

**Example Response:**

```json
{
  "username": "party eel",
  "password": "123",
  "image_path": "media/avatars/purple-narrow.png",
  "species": "eel",
  "friends": [],
  "high_score": 4810,
  "email": "inthemistofoodles@gmail.com"
}
```

Whereas for example if the previous high score was 1810, then the high_score field in the return JSON would've now been updated to 2000.

**Error Handling:**

- Missing fetch call body or body.score gives text error
- Missing cookie for current user gives text error
