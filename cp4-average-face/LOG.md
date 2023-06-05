TODO:

-   using mediapipe, run facial-landmarks.py on all faces in user-imgs, save to       
    img-processing
    -   do this using express in get-landmarks.js, then do node get-landmarks.js
    -   landmarks.json should look like
        -   {imagePath: [landmarks], imagePath: [landmarks], ...}
-   add get endpoint calling to average-faces.py in app.js, with input being list of    
    image paths (return from the type: image-paths get endpoint)
    -   this endpoint should return path to new image in public folder, which is the
        average face of the input images
    -   show-face.js one line edit show this image
