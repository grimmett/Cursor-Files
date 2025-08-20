import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Ionicons } from '@react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput, Button, Card, Chip } from 'react-native-paper';
import * as Location from 'expo-location';
import OfflinePhotoService, { OfflinePhotoData } from '../services/offlinePhotoService';
import { useOfflineStore } from '../stores/offlineStore';
import { Trade, Priority, ItemStatus } from '../../../shared/types';

const { width: screenWidth } = Dimensions.get('window');

interface CameraScreenParams {
  punchlistItemId: string;
  projectId: string;
  existingPhotos?: OfflinePhotoData[];
}

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { punchlistItemId, projectId, existingPhotos = [] } = route.params as CameraScreenParams;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const cameraRef = useRef<Camera>(null);
  const offlineStore = useOfflineStore();
  const photoService = OfflinePhotoService.getInstance();
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Get location permission
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      }
    })();
  }, []);
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: true,
      });
      
      setCapturedImage(photo.uri);
      setShowPreview(true);
      
      // Auto-fill location if available
      if (currentLocation && !location) {
        setLocation(`${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      console.error('Error taking picture:', error);
    } finally {
      setIsCapturing(false);
    }
  };
  
  const retakePicture = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setCaption('');
    setLocation('');
  };
  
  const savePhoto = async () => {
    if (!capturedImage) return;
    
    setIsSaving(true);
    try {
      // Save photo offline
      const photoData = await photoService.captureAndStorePhoto(
        capturedImage,
        punchlistItemId,
        projectId,
        'current-user-id', // This would come from auth store
        caption || undefined,
        location || undefined
      );
      
      Alert.alert(
        'Success',
        'Photo saved offline and will be uploaded when connected to the internet.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo');
      console.error('Error saving photo:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleCameraType = () => {
    setCameraType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  };
  
  const toggleFlash = () => {
    setFlashMode(current => (
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    ));
  };
  
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color="#ef4444" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access in your device settings to take photos.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  if (showPreview && capturedImage) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.previewContainer}>
          <Card style={styles.previewCard}>
            <Card.Cover source={{ uri: capturedImage }} style={styles.previewImage} />
            <Card.Content style={styles.previewContent}>
              <TextInput
                label="Caption (optional)"
                value={caption}
                onChangeText={setCaption}
                mode="outlined"
                style={styles.input}
                placeholder="Describe what this photo shows..."
              />
              
              <TextInput
                label="Location (optional)"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Room 101, North wall"
              />
              
              {currentLocation && (
                <View style={styles.locationInfo}>
                  <Chip icon="location" mode="outlined">
                    GPS: {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
                  </Chip>
                </View>
              )}
              
              <View style={styles.previewActions}>
                <Button
                  mode="outlined"
                  onPress={retakePicture}
                  style={[styles.button, styles.retakeButton]}
                  icon="camera-retake"
                >
                  Retake
                </Button>
                
                <Button
                  mode="contained"
                  onPress={savePhoto}
                  style={[styles.button, styles.saveButton]}
                  icon="content-save"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Save Photo
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ratio="16:9"
      >
        <View style={styles.cameraOverlay}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flashMode === FlashMode.on ? "flash" : "flash-off"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          
          {/* Camera frame guide */}
          <View style={styles.cameraFrame}>
            <View style={styles.frameCorner} />
            <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
            <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
            <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
          </View>
          
          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.navigate('PhotoGallery', { punchlistItemId })}
            >
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
      
      {/* Photo count indicator */}
      {existingPhotos.length > 0 && (
        <View style={styles.photoCount}>
          <Chip icon="camera" mode="outlined">
            {existingPhotos.length} photos taken
          </Chip>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  cameraFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    marginLeft: -(screenWidth * 0.4),
    marginTop: -(screenWidth * 0.3),
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  frameCornerTopRight: {
    right: 0,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  frameCornerBottomLeft: {
    bottom: 0,
    borderBottomWidth: 3,
    borderTopWidth: 0,
  },
  frameCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  photoCount: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  previewCard: {
    margin: 16,
  },
  previewImage: {
    height: 300,
  },
  previewContent: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  locationInfo: {
    marginBottom: 16,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  retakeButton: {
    borderColor: '#ef4444',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#374151',
  },
  permissionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    color: '#6b7280',
    paddingHorizontal: 32,
  },
});



