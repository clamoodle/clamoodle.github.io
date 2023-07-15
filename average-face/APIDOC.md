# CS132 Caltech Donut Directory API

**Author:** Pearl Chen
**Last Updated:** 06/04/23

The Caltech Donut Directory API enable you to get house affiliation, option, class etc information
for current and recent Caltech students.

Summary of endpoints:

-   GET /users

-   GET /average-face

In the current version of this API, all error responses are returned as plain text.
Any 500 errors represent a server-side issue and include a generic error message. Any 400-level errors represent an invalid request by a client, and are documented appropriately for any parameterized endpoint.

Contact the author at yishuc@caltech.edu for any bug reports or feature requests!

## _GET /users_

**Returned Data Format**: JSON, text

**Description:**
Returns a JSON collection of users with matching specified filter parameters, or the image paths to
their profile images (scrapable by my data scraper), or a text string of their names separated by
commas.

**Parameters**

-   option (optional)

    -   Filter parameter to specify the users' majors

-   house (optional)

    -   Filter parameter to specify the users' house affiliations

-   gender (optional)

    -   Filter parameter to specify the users' genders

-   graduation (optional)

    -   Filter parameter to specify the users' graduation year

-   type (optional)
    -   "names": returns a text string of users' names with matching specified filter parameters
    -   "image-paths": returns the image paths to their profile images
    -   "json" (default): returns the JSON collection of all their infs

**Example Request:** `/users?house=avery&gender=female&graduation=2024&type=names`

**Example Response:**

```text
Amelia Burns, Pearl Chen, Patill Daghlian, Lucy Gao, Catherine Ko, Eileen Li, Madeline Shao, Parul Singh, Brea Swartwood, Haruna Tomono, Alexis Wang, Clara Wang, Jia Yue Wu, Alice Yang, Eilleen Zhang, Theresa Zhang, Ann Zhu
```

**Example Request:** `/users?house=avery&gender=female&graduation=2024`

**Example Response:**

```json
[
    {
        "name": "Amelia Burns",
        "imageURL": "https://donut.caltech.edu/1/users/5777/image",
        "imagePath": "user-imgs/5777.png",
        "gender": "Female",
        "graduation": "2024",
        "option": ["Bioengineering"],
        "house": ["Avery"]
    },
    {
        "name": "Pearl Chen",
        "imageURL": "https://donut.caltech.edu/1/users/5821/image",
        "imagePath": "user-imgs/5821.png",
        "gender": "Female",
        "graduation": "2024",
        "option": ["Computer Science"],
        "house": ["Avery"]
    }
]
```

**Error Handling:**

-   Any query parameters not specified above will be ignored.

**Example Request:** `/users?doodle=boogle`

**Example Response:** Same response as `/users`

## _GET /average-face_

**Returned Data Format**: JSON

**Description:**
Makes an image of the average of faces of users with the specified filter parameters, and saves the resulting image to public/average-faces. Returns the image path and description in JSON.

**Parameters**

-   option (optional)

    -   Filter parameter to specify the users' majors

-   house (optional)

    -   Filter parameter to specify the users' house affiliations

-   gender (optional)

    -   Filter parameter to specify the users' genders

-   graduation (optional)

    -   Filter parameter to specify the users' graduation year

**Example Request:** `/users?house=avery&option=computer%20science&graduation=2024`

**Example Response:**

```json
{
    "description": "Caltech 2024 avery computer science face",
    "imgPath": "average-face/computer-science-avery-2024-face.png"
}
```

**Error Handling:**

-   Any query parameters not specified above will be ignored.
-   If there are no users matching the specified filters, there will be text error
-   If Mediapipe cannot detect a face in any of the users' photos matching the specified filters, there will be a text error message

**Example Request:** `/users?doodle=boogle`

**Example Response:** Same response as `/users`
