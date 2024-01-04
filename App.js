import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native';

// Audio
import TrackPlayer,  {State} from 'react-native-track-player';
import { setupPlayer, playTrack } from './trackPlayerServices';

// Sensors
import {
    orientation,
    accelerometer,
    //gyroscope,
    magnetometer,
    setUpdateIntervalForType,
    SensorTypes,
  } from 'react-native-sensors';
  import { map, filter } from 'rxjs/operators';
import { reset } from 'react-native-track-player/lib/trackPlayer';


setUpdateIntervalForType(SensorTypes.orientation, 100);
setUpdateIntervalForType(SensorTypes.accelerometer, 100);
setUpdateIntervalForType(SensorTypes.magnetometer, 100);


function App() {
  // Sensors
  const [orientationData, setOrientationData] = useState({pitch: 0, roll: 0, yaw: 0});
  const [accelerationData, setAccelerationData] = useState({ x: 0, y: 0, z: 0 });
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [hasOrientation, setHasOrientation] = useState(false);
  const [hasAcceleration, setHasAcceleration] = useState(false);
  const [hasMagnetometer, setHasMagnetometer] = useState(false);

  // Sensor function
  useEffect(() => {
    // Orientation
    const orientationSubscription = orientation
    //.pipe(map(({ x, y, z }) => x + y + z), filter(speed => speed > 20))
    .subscribe({
      next: ({ qx, qy, qz, qw, pitch, roll, yaw, timestamp }) => {
        setOrientationData({ pitch, roll, yaw });
        setHasOrientation(true);
        // To degress and absolute
        let pitchDeg = (Math.abs(pitch) * 180 / Math.PI);
        let rollDeg = (Math.abs(roll) * 180 / Math.PI);
        // Only 90º are relevant (180 means the phone is turned upside down)
        pitchDeg = pitchDeg > 90 ? 180 - pitchDeg : pitchDeg;
        rollDeg = rollDeg > 90 ? 180 - rollDeg: rollDeg;
        // Maximum of the two
        let maxAngle = Math.max(pitchDeg, rollDeg);
        playTrack(maxAngle.toFixed());

      },
      error: error => {
        console.error(error);
        setHasOrientation(false);
      },
      complete: () => console.info('complete'),
    });

    // Acceleration
    const accelerometerSubscription = accelerometer.subscribe({
      next: ({ x, y, z, timestamp }) => {
        setAccelerationData({ x, y, z });
        setHasAcceleration(true);
      },
      error: error => {
        console.error(error);
        setHasAcceleration(false);
      },
      complete: () => console.info('complete'),
    });


    // Magnetometer
    const magnetometerSubscription = magnetometer.subscribe({
      next: ({ x, y, z, timestamp }) => {
        setMagnetometerData({ x, y, z });
        setHasMagnetometer(true);
      },
      error: error => {
        console.error(error);
        setHasMagnetometer(false);
      },
      complete: () => console.info('complete'),
    });
    // Component unmount
    return () => {
      orientationSubscription.unsubscribe();
      accelerometerSubscription.unsubscribe();
      magnetometerSubscription.unsubscribe();
    };
  }, []);




  // Player
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      let isSetup = await setupPlayer();

      // const queue = await TrackPlayer.getQueue();
      // if(isSetup && queue.length <= 0) {
      //   await addTracks();
      // }

      setIsPlayerReady(isSetup);
    }

    setup();
  }, []);

  if(!isPlayerReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#bbb"/>
      </SafeAreaView>
    );
  }

  return (







    <SafeAreaView style={styles.container}>

      <View style={hasOrientation ? styles.visible : styles.hidden}>
        <Text>Pitch: {orientationData.pitch}</Text>
        <Text>Roll: {orientationData.roll}</Text>
        <Text>Yaw: {orientationData.yaw}</Text>
      </View>

      <View>
        <Text></Text>
      </View>




      <Button title="Play" color="#777" onPress={() => {
        playTrack(11);
        }}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10,
  },

  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;