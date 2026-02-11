import { useEffect, useState } from 'react';
import { Camera, useCameraDevice, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';

export function useCamera() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const devices = useCameraDevices();
  const device = useCameraDevice('back');
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  console.log('[useCamera] hasPermission:', hasPermission, 'device:', device?.id || 'null', 'isReady:', isReady);
  console.log('[useCamera] Available devices:', devices ? (Array.isArray(devices) ? devices.length : 'not array') : 'null', devices?.map?.(d => ({ id: d.id, position: d.position })));

  useEffect(() => {
    console.log('[useCamera] Permission effect - hasPermission:', hasPermission);
    if (!hasPermission) {
      console.log('[useCamera] Requesting camera permission...');
      requestPermission().then((granted) => {
        console.log('[useCamera] Permission request result:', granted);
      });
    }
  }, [hasPermission]);

  useEffect(() => {
    console.log('[useCamera] Ready effect - device:', device?.id, 'hasPermission:', hasPermission, 'devices:', devices, 'retry:', retryCount);

    // Check if we have permission first
    if (!hasPermission) {
      setIsReady(false);
      return;
    }

    // Try to get a valid device
    let backDevice = device;

    // Fallback: try to get back camera from devices array
    if (!backDevice && devices && Array.isArray(devices) && devices.length > 0) {
      console.log('[useCamera] Trying fallback device selection from', devices.length, 'devices');
      backDevice = devices.find(d => d.position === 'back') || devices[0];
      console.log('[useCamera] Fallback device:', backDevice?.id);
    }

    if (backDevice) {
      console.log('[useCamera] Camera ready with device:', backDevice.id);
      setIsReady(true);
    } else {
      console.log('[useCamera] Camera not ready - no device available');
      setIsReady(false);

      // Retry a few times if no device is found (camera system might be initializing)
      if (retryCount < 5) {
        console.log('[useCamera] Retrying device detection in 500ms...');
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [device, devices, hasPermission, retryCount]);

  return {
    device: device || (devices && devices.find(d => d.position === 'back')) || (devices && devices[0]),
    hasPermission,
    requestPermission,
    isReady,
  };
}
