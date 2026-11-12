import { Geolocation } from '@capacitor/geolocation';

window.RoadRaterNative = {
  watchPosition(onPosition, onError, options) {
    let callbackId;
    let stopRequested = false;

    const pendingId = Geolocation.watchPosition(options, (position, error) => {
      if (error) {
        onError(error);
      } else if (position) {
        onPosition(position);
      }
    }).then((id) => {
      callbackId = id;
      if (stopRequested) return Geolocation.clearWatch({ id });
    }).catch((error) => onError(error));

    return {
      async stop() {
        stopRequested = true;
        await pendingId;
        if (callbackId) await Geolocation.clearWatch({ id: callbackId });
      },
    };
  },
};
