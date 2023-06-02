from google.colab import files
from IPython.display import Image
import cv2
from google.colab.patches import cv2_imshow
# upload local folder of faces to be combined
uploaded = files.upload()

imgs = []
for pic in uploaded:
    img = cv2.imread(pic)
    imgs.append(img)
    # cv2_imshow()

!pip install mediapipe
# Basics
import matplotlib.pyplot as plt
import mediapipe as mp
import numpy as np

# INITIALIZING OBJECTS
mp_face_mesh = mp.solutions.face_mesh
face_mesh_result_pts = []
face_mesh_results = []
img_shapes = []

# DETECT THE FACE LANDMARKS
for image in imgs:
    face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    # Convert the color space from BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # To improve performance
    image.flags.writeable = False

    # Detect the face landmarks
    results = face_mesh.process(image)

    # To improve performance
    image.flags.writeable = True

    # Convert back to the BGR color space
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    if results.multi_face_landmarks:
        for face in results.multi_face_landmarks:
            face_mesh_results.append(face)

            # Keep track of image dimensions
            image_height, image_width, _ = image.shape
            img_shapes.append((image_width, image_height))

            # Create a new list in face_mesh_result_pts for every face
            landmark_pts = []
            for landmark in face.landmark:
                x = landmark.x * image_width
                y = landmark.y * image_height
                landmark_pts.append((x, y))
            face_mesh_result_pts.append(landmark_pts)

w, h = 300, 400
normalized_eyes_left = 0.3 * w
normalized_eyes_right = 0.7 * w
normalized_eyes_y = 0.5 * h

out_points = np.array([(normalized_eyes_left, normalized_eyes_y),
                       (normalized_eyes_right, normalized_eyes_y)])

faces = []
pts_normalized = []

for i in range(len(face_mesh_result_pts)):
    face = face_mesh_result_pts[i]

    left_eye = face[246]
    right_eye = face[263]

    # Get coordinates
    left_eye = (left_eye[0], left_eye[1]) 
    right_eye = (right_eye[0], right_eye[1])
    
    crop = cv2.estimateAffinePartial2D(np.array([left_eye, right_eye]), out_points)

    face_img = cv2.warpAffine(imgs[i], crop[0], (w, h))
    faces.append(face_img)
    # cv2_imshow(imgs[i])

    # Apply similarity transform on points
    new_pts = np.transpose(np.dot(crop[0][:,:2], np.transpose(face_mesh_result_pts[i])) ) + crop[0][:,2]

    # # Add boundary points for delaunay triangulation
    boundaryPts = np.array([(0,0), (w/2,0), (w-1,0), (w-1,h/2), ( w-1, h-1 ), ( w/2, h-1 ), (0, h-1), (0,h/2) ])
    
    # # Append boundary points. Will be used in Delaunay Triangulation
    new_pts = np.append(new_pts, boundaryPts, axis=0)

    pts_normalized.append(new_pts)

# Calculate location of average landmark points.
pts_avg = np.mean(pts_normalized, axis=0)

# Check if a point is inside a rectangle
def rectContains(rect, point) :
    if point[0] < rect[0] :
        return False
    elif point[1] < rect[1] :
        return False
    elif point[0] > rect[2] :
        return False
    elif point[1] > rect[3] :
        return False
    return True

# Make sure p is within width w and height h
def constrainPoint(p, w, h) :
    p =  ( min( max( p[0], 0 ) , w - 1 ) , min( max( p[1], 0 ) , h - 1 ) )
    return p


# Apply affine transform calculated using srcTri and dstTri to src and
# output an image of size.
def applyAffineTransform(src, srcTri, dstTri, size) :
    
    # Given a pair of triangles, find the affine transform.
    warpMat = cv2.getAffineTransform( np.float32(srcTri), np.float32(dstTri) )
    
    # Apply the Affine Transform just found to the src image
    dst = cv2.warpAffine( src, warpMat, (size[0], size[1]), None, flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101 )

    return dst


# Warps triangular regions from img1 and img2 to img
def warpTriangle(img1, img2, t1, t2) :

    # Find bounding rectangle for each triangle
    r1 = cv2.boundingRect(np.float32([t1]))
    r2 = cv2.boundingRect(np.float32([t2]))

    # Offset points by left top corner of the respective rectangles
    t1Rect = [] 
    t2Rect = []
    t2RectInt = []

    for i in range(0, 3):
        t1Rect.append(((t1[i][0] - r1[0]),(t1[i][1] - r1[1])))
        t2Rect.append(((t2[i][0] - r2[0]),(t2[i][1] - r2[1])))
        t2RectInt.append(((t2[i][0] - r2[0]),(t2[i][1] - r2[1])))


    # Get mask by filling triangle
    mask = np.zeros((r2[3], r2[2], 3), dtype = np.float32)
    cv2.fillConvexPoly(mask, np.int32(t2RectInt), (1.0, 1.0, 1.0), 16, 0)

    # Apply warpImage to small rectangular patches
    img1Rect = img1[r1[1]:r1[1] + r1[3], r1[0]:r1[0] + r1[2]]
    
    size = (r2[2], r2[3])

    img2Rect = applyAffineTransform(img1Rect, t1Rect, t2Rect, size)
    
    img2Rect = img2Rect * mask

    # Copy triangular region of the rectangular patch to the output image
    img2[r2[1]:r2[1]+r2[3], r2[0]:r2[0]+r2[2]] = img2[r2[1]:r2[1]+r2[3], r2[0]:r2[0]+r2[2]] * ( (1.0, 1.0, 1.0) - mask )
     
    img2[r2[1]:r2[1]+r2[3], r2[0]:r2[0]+r2[2]] = img2[r2[1]:r2[1]+r2[3], r2[0]:r2[0]+r2[2]] + img2Rect

from scipy.spatial import Delaunay
from numpy.lib.twodim_base import tril
faces_delaunay = []

# Triangulation of target average face
tri = Delaunay(pts_avg).simplices

# Warp input images to average image landmarks
for i in range(0, len(faces)) :
    img = np.zeros_like(faces[0])
    # Transform triangles one by one
    for j in range(0, len(tri)) :
        tin = []
        tout = []
        
        # Triangle vertices
        for k in range(0, 3) :                
            pIn = pts_normalized[i][tri[j][k]]
            pIn = constrainPoint(pIn, w, h)
            
            pOut = pts_avg[tri[j][k]]
            pOut = constrainPoint(pOut, w, h)
            
            tin.append(pIn)
            tout.append(pOut)
          
        warpTriangle(faces[i], img, tin, tout)
        faces_delaunay.append(img)

avg_face_delaunay = np.mean(faces_delaunay, axis=0)
cv2_imshow(avg_face_delaunay)

# Refs
# * https://learnopencv.com/average-face-opencv-c-python-tutorial/
# * https://towardsdatascience.com/face-landmark-detection-using-python-1964cb620837
# * https://github.com/ManuelTS/augmentedFaceMeshIndices
# * https://docs.opencv.org/3.4/d4/d61/tutorial_warp_affine.html
# * https://github.com/google/mediapipe/issues/2031
# * https://levelup.gitconnected.com/facemask-a-real-time-face-morphing-tool-5b343591a237
# * https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.Delaunay.html
