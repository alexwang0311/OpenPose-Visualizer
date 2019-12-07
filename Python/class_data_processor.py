# -*- coding: utf-8 -*-
"""
Created on Tue Oct 29 16:49:25 2019

@author: wangz29
"""

import json
import math

class DataProcessor(object):
    def process(self, input_path, output_file):
        # Open the file and read the metadata into the container
        with open(input_path, 'r') as json_file:
            meta_data = json.load(json_file)
            
        # Iterate through the metadata and compute the Euclidean distance between every two frames
        # If either one of the frames does not have the meatadata, an empty list is inserted
        processed = {}
        
        pose_keypoints_2d_distance = []
        face_keypoints_2d_distance = []
        hand_left_keypoints_2d_distance = []
        hand_right_keypoints_2d_distance = []
        
        for prev, cur in zip(meta_data, meta_data[1:]):    
            prev_pose_keypoints_2d = []
            prev_face_keypoints_2d = []
            prev_hand_left_keypoints_2d = []
            prev_hand_right_keypoints_2d = []
            if 'pose_keypoints_2d' in prev:
                prev_pose_keypoints_2d = prev['pose_keypoints_2d']
            if 'face_keypoints_2d' in prev:
                prev_face_keypoints_2d = prev['face_keypoints_2d']
            if 'hand_left_keypoints_2d' in prev:
                prev_hand_left_keypoints_2d = prev['hand_left_keypoints_2d']
            if 'hand_right_keypoints_2d' in prev:
                prev_hand_right_keypoints_2d = prev['hand_right_keypoints_2d']
            
            cur_pose_keypoints_2d = []
            cur_face_keypoints_2d = []
            cur_hand_left_keypoints_2d = []
            cur_hand_right_keypoints_2d = []
            if 'pose_keypoints_2d' in cur:
                cur_pose_keypoints_2d = cur['pose_keypoints_2d']
            if 'face_keypoints_2d' in cur:
                cur_face_keypoints_2d = cur['face_keypoints_2d']
            if 'hand_left_keypoints_2d' in cur:
                cur_hand_left_keypoints_2d = cur['hand_left_keypoints_2d']
            if 'hand_right_keypoints_2d' in cur:
                cur_hand_right_keypoints_2d = cur['hand_right_keypoints_2d']
            
            # pose keypoints distance calculation
            if len(prev_pose_keypoints_2d) > 0 and len(cur_pose_keypoints_2d) > 0:
                all_distance = []
                for i in range(len(prev_pose_keypoints_2d) // 3):
                    x1 = prev_pose_keypoints_2d[int(3 * i)]
                    y1 = prev_pose_keypoints_2d[int(3 * i + 1)]
                    c1 = prev_pose_keypoints_2d[int(3 * i + 2)]
                    
                    x2 = cur_pose_keypoints_2d[int(3 * i)]
                    y2 = cur_pose_keypoints_2d[int(3 * i + 1)]
                    c2 = cur_pose_keypoints_2d[int(3 * i + 2)]
                    
                    #print('x1: ', x1, 'y1: ', y1, 'x2: ', x2, 'y2: ', y2, 'c1: ', c1, 'c2: ', c2)
                    
                    # compute the Euclidean distance
                    distance = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                    all_distance.append(distance)
                    all_distance.append(c1)
                    all_distance.append(c2)
                
                #print(all_distance)
                pose_keypoints_2d_distance.append(all_distance)
            else:
                #print('no data')
                pose_keypoints_2d_distance.append([])
                
            # face keypoints distance calculation
            if len(prev_face_keypoints_2d) > 0 and len(cur_face_keypoints_2d) > 0:
                all_distance = []
                for i in range(len(prev_face_keypoints_2d) // 3):
                    x1 = prev_face_keypoints_2d[int(3 * i)]
                    y1 = prev_face_keypoints_2d[int(3 * i + 1)]
                    c1 = prev_face_keypoints_2d[int(3 * i + 2)]
                    
                    x2 = cur_face_keypoints_2d[int(3 * i)]
                    y2 = cur_face_keypoints_2d[int(3 * i + 1)]
                    c2 = cur_face_keypoints_2d[int(3 * i + 2)]
                    
                    #print('x1: ', x1, 'y1: ', y1, 'x2: ', x2, 'y2: ', y2, 'c1: ', c1, 'c2: ', c2)
                    
                    # compute the Euclidean distance
                    distance = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                    all_distance.append(distance)
                    all_distance.append(c1)
                    all_distance.append(c2)
                
                #print(all_distance)
                face_keypoints_2d_distance.append(all_distance)
            else:
                #print('no data')
                face_keypoints_2d_distance.append([])
            
            # left hand keypoints distance calculation
            if len(prev_hand_left_keypoints_2d) > 0 and len(cur_hand_left_keypoints_2d) > 0:
                all_distance = []
                for i in range(len(prev_hand_left_keypoints_2d) // 3):
                    x1 = prev_hand_left_keypoints_2d[int(3 * i)]
                    y1 = prev_hand_left_keypoints_2d[int(3 * i + 1)]
                    c1 = prev_hand_left_keypoints_2d[int(3 * i + 2)]
                    
                    x2 = cur_hand_left_keypoints_2d[int(3 * i)]
                    y2 = cur_hand_left_keypoints_2d[int(3 * i + 1)]
                    c2 = cur_hand_left_keypoints_2d[int(3 * i + 2)]
                    
                    #print('x1: ', x1, 'y1: ', y1, 'x2: ', x2, 'y2: ', y2, 'c1: ', c1, 'c2: ', c2)
                    
                    # compute the Euclidean distance
                    distance = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                    all_distance.append(distance)
                    all_distance.append(c1)
                    all_distance.append(c2)
                
                #print(all_distance)
                hand_left_keypoints_2d_distance.append(all_distance)
            else:
                #print('no data')
                hand_left_keypoints_2d_distance.append([])
                
            # right hand keypoints distance calculation
            if len(prev_hand_right_keypoints_2d) > 0 and len(cur_hand_right_keypoints_2d) > 0:
                all_distance = []
                for i in range(len(prev_hand_right_keypoints_2d) // 3):
                    x1 = prev_hand_right_keypoints_2d[int(3 * i)]
                    y1 = prev_hand_right_keypoints_2d[int(3 * i + 1)]
                    c1 = prev_hand_right_keypoints_2d[int(3 * i + 2)]
                    
                    x2 = cur_hand_right_keypoints_2d[int(3 * i)]
                    y2 = cur_hand_right_keypoints_2d[int(3 * i + 1)]
                    c2 = cur_hand_right_keypoints_2d[int(3 * i + 2)]
                    
                    #print('x1: ', x1, 'y1: ', y1, 'x2: ', x2, 'y2: ', y2, 'c1: ', c1, 'c2: ', c2)
                    
                    # compute the Euclidean distance
                    distance = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                    all_distance.append(distance)
                    all_distance.append(c1)
                    all_distance.append(c2)
                
                #print(all_distance)
                hand_right_keypoints_2d_distance.append(all_distance)
            else:
                #print('no data')
                hand_right_keypoints_2d_distance.append([])
                
        #for i in range(len(pose_keypoints_2d_distance)):
        #   print(i, ' ', pose_keypoints_2d_distance[i])
        #for i in range(len(face_keypoints_2d_distance)):
        #   print(i, ' ', face_keypoints_2d_distance[i])
        #for i in range(len(hand_left_keypoints_2d_distance)):
        #   print(i, ' ', hand_left_keypoints_2d_distance[i])
        #for i in range(len(hand_right_keypoints_2d_distance)):
        #   print(i, ' ', hand_right_keypoints_2d_distance[i])
        
        processed = {'pose_keypoints_2d_distance' : pose_keypoints_2d_distance, 'face_keypoints_2d_distance' : face_keypoints_2d_distance, 'hand_left_keypoints_2d_distance' : hand_left_keypoints_2d_distance, 'hand_right_keypoints_2d_distance' : hand_right_keypoints_2d_distance}
        with open(output_file, 'w') as json_file:
          json.dump(processed, json_file)
        
        print('Processing done')
        return output_file

# input_path = 'F:\\Data\\Test_2_raw.json'
# output_file = 'F:\\Data\\Test_2_processed.json'
# myProcessor = DataProcessor()
# print(myProcessor.process(input_path, output_file))