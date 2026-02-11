import { useEffect, useState } from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export function useCamera() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    if (device && hasPermission) {
      setIsReady(true);
    }
  }, [device, hasPermission]);

  return {
    device,
    hasPermission,
    requestPermission,
    isReady,
  };
}
