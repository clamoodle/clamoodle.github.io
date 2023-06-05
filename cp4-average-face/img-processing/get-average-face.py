# @Author Pearl Chen
# CS132 Spring 2023
#
# Morphs detected facial images into an average faces and returns the overlayed results
# average facial_landmarks.
# Because mediapipe on windows is a little funny, the facial landmarks from mediapipe
# facial_landmarks mesh were processed on Google Colab and hard-coded into facial-landmarks.
# They are in the form:
# -   facial-landmarks/0000.json => [[x1, y1], [x2, y2], ..., [x468, y468]]
#
# Colab link: https://colab.research.google.com/drive/1Z7mGYkfG-og2fGYLtFnJ0tJ88LwgWNtN?usp=sharing

import cv2
import json
import sys
import numpy as np
from scipy.spatial import Delaunay
from numpy.lib.twodim_base import tril

import os

# Parsing input parameter image-paths from string to JSON list
INPUT = sys.argv[1] # E.g. ["user-imgs/4857.png", "user-imgs/2262.png", ...]
IMG_PATHS = INPUT[1:-1].split(',')
SAVE_TO_PATH = sys.argv[2]

# Paths to get from and save to
IMG_FOLDER_PATH = '../data-scraper/'
LANDMARK_FOLDER_PATH = 'facial-landmarks/'

# Output images width and height
OUTPUT_WIDTH, OUTPUT_HEIGHT = 300, 400

# Normalizing eye landmarks to be in 1/3 and 2/3 horizontally, and 1/2 vertically
NORMALIZED_EYES_LEFT = 0.3 * OUTPUT_WIDTH
NORMALIZED_EYES_RIGHT = 0.7 * OUTPUT_WIDTH
NORMALIZED_EYES_Y = 0.5 * OUTPUT_HEIGHT

out_points = np.array([(NORMALIZED_EYES_LEFT, NORMALIZED_EYES_Y),
                       (NORMALIZED_EYES_RIGHT, NORMALIZED_EYES_Y)])


# Facial morphing
faces = []
pts_normalized = []
print("running")
for i in range(len(IMG_PATHS)):
    # Open facial landmarks file and get landmark coordinates
    landmark_path = LANDMARK_FOLDER_PATH + IMG_PATHS[i][-8:-4] + '.json'
    if not os.path.isfile(landmark_path):
        continue # Skip image processing if no face was found by MediaPipe
    f = open(landmark_path)
    facial_landmarks = json.load(f)
    
    # Get and read image file
    img = cv2.imread(IMG_FOLDER_PATH + IMG_PATHS[i])

    # Get coordinates to transform on
    left_eye = facial_landmarks[246]
    right_eye = facial_landmarks[263]
    left_eye = (left_eye[0], left_eye[1]) 
    right_eye = (right_eye[0], right_eye[1])
    
    crop = cv2.estimateAffinePartial2D(np.array([left_eye, right_eye]), out_points)

    face_img = cv2.warpAffine(img, crop[0], (OUTPUT_WIDTH, OUTPUT_HEIGHT))
    faces.append(face_img)

    # Apply similarity transform on points
    new_pts = np.transpose(np.dot(crop[0][:,:2], np.transpose(facial_landmarks)) ) + crop[0][:,2]

    # # Add boundary points for delaunay triangulation
    w, h = OUTPUT_WIDTH, OUTPUT_HEIGHT
    boundaryPts = np.array([(0,0), (w/2,0), (w-1,0), (w-1,h/2), ( w-1, h-1 ), ( w/2, h-1 ), (0, h-1), (0,h/2) ])
    
    # # Append boundary points. Will be used in Delaunay Triangulation
    new_pts = np.append(new_pts, boundaryPts, axis=0)

    pts_normalized.append(new_pts)
    
    f.close()

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

# Triangulation of target average facial_landmarks
tri = Delaunay(pts_avg).simplices

# Factor out output image since np.mean can't handle big array
avg_face_delaunay = np.zeros_like(faces[0])

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
    avg_face_delaunay = avg_face_delaunay + img / len(IMG_PATHS)

cv2.imwrite(SAVE_TO_PATH, avg_face_delaunay) 

# Refs
# * https://learnopencv.com/average-facial_landmarks-opencv-c-python-tutorial/
# * https://towardsdatascience.com/facial_landmarks-landmark-detection-using-python-1964cb620837
# * https://github.com/ManuelTS/augmentedFaceMeshIndices
# * https://docs.opencv.org/3.4/d4/d61/tutorial_warp_affine.html
# * https://github.com/google/mediapipe/issues/2031
# * https://levelup.gitconnected.com/facemask-a-real-time-facial_landmarks-morphing-tool-5b343591a237
# * https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.Delaunay.html
