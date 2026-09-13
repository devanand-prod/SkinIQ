import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaceGuideOverlay } from '../components/FaceGuideOverlay';
import { colors, fonts, radii, spacing } from '../constants/theme';

const MAX_DIMENSION = 1024;

export default function CaptureScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isBusy, setIsBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function goToProcessing(uri: string) {
    setIsBusy(true);
    try {
      // Downsize before analysis so lib/analysis (once implemented) works
      // against a predictable, bounded image size.
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_DIMENSION } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      router.push({ pathname: '/processing', params: { photoUri: manipulated.uri } });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleShutterPress() {
    if (!cameraRef.current) return;
    setIsBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        await goToProcessing(photo.uri);
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUploadPress() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      await goToProcessing(result.assets[0].uri);
    }
  }

  // Permission not yet determined — avoid flashing the fallback UI.
  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  // Camera permission denied (or not yet granted) — graceful fallback to
  // the photo picker instead of a dead-end screen.
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 22,
              color: colors.ink,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            Camera access needed
          </Text>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 14,
              color: colors.inkSoft,
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}
          >
            SkinIQ needs your camera for a live scan, or you can upload an existing photo instead.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={{
              backgroundColor: colors.accent,
              borderRadius: radii.pill,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              marginBottom: spacing.sm,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.white, fontSize: 16 }}>
              Enable camera
            </Text>
          </Pressable>
          <Pressable
            onPress={handleUploadPress}
            style={{
              borderRadius: radii.pill,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              width: '100%',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.ink, fontSize: 16 }}>
              Upload photo instead
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
      <FaceGuideOverlay />

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <Text
          style={{
            fontFamily: fonts.ui,
            color: colors.white,
            fontSize: 14,
            textAlign: 'center',
            marginTop: spacing.md,
          }}
        >
          Center your face in the outline
        </Text>
      </SafeAreaView>

      <SafeAreaView
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingBottom: spacing.lg,
        }}
      >
        <Pressable
          onPress={handleShutterPress}
          disabled={isBusy}
          style={{
            width: 74,
            height: 74,
            borderRadius: 37,
            backgroundColor: colors.white,
            borderWidth: 4,
            borderColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          {isBusy && <ActivityIndicator color={colors.accent} />}
        </Pressable>
        <Pressable onPress={handleUploadPress} disabled={isBusy}>
          <Text style={{ fontFamily: fonts.uiMedium, color: colors.white, fontSize: 14 }}>
            Upload photo instead
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
