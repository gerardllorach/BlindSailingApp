
// https://blog.logrocket.com/react-native-track-player-complete-guide/
import { KeyboardAvoidingViewComponent } from 'react-native';
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    State,
    Capability,
    RepeatMode,
    Event
  } from 'react-native-track-player';
import { getActiveTrack } from 'react-native-track-player/lib/trackPlayer';


  let appMode = 1;
  export let appModeName = 'TILT';
  const durTilt = 2;
  const tracks = {
    'silence1s': {
      id: 'silence1s',
      url: require('./assets/silence1s.wav'),
      duration: durTilt,
    },
    '1click': {
      id: '1click',
      url: require('./assets/1click.wav'),
      duration: durTilt,
    },
    '2click': {
      id: '2click',
      url: require('./assets/2click.wav'),
      duration: durTilt,
    },
    '3click': {
      id: '3click',
      url: require('./assets/3click.wav'),
      duration: durTilt,
    },
    '4click': {
      id: '4click',
      url: require('./assets/4click.wav'),
      duration: durTilt,
    }
  }
  let trackIndices;
  
  export async function setupPlayer() {
    let isSetup = false;
    

    try {
      await TrackPlayer.getActiveTrackIndex();
      TrackPlayer.remove();
      isSetup = true;
      console.log("Active track!");
      
      
    }
    catch {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          //Capability.SkipToNext,
          //Capability.SkipToPrevious,
          //Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          //Capability.SkipToNext,
        ],
        progressUpdateEventInterval: 2,
      });
  
      isSetup = true;
    }
    finally {
      let queue = await TrackPlayer.getQueue();
      console.log('-------- START -----------')
      if (queue.length != 0){
        await TrackPlayer.reset();
        console.log("Reseting track player")
      }

      // Load all tracks
      console.log("Loading all tracks");
      Object.keys(tracks).forEach(id => {
        TrackPlayer.add(tracks[id]);
      });
      
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      TrackPlayer.play();

      let queuedTracks = await TrackPlayer.getQueue();
      console.log('*****');
      console.log(queuedTracks);

      // Set track indices
      trackIndices = {};
      for (let i = 0; i < queuedTracks.length; i++){
        trackIndices[queuedTracks[i].id] = i;
      }

      return isSetup;
    }
  }




  export async function playTrack(angle){
    

    let stateRes = await TrackPlayer.getPlaybackState();
    let actTrackIndex = await TrackPlayer.getActiveTrackIndex();

    // Skip if mode is 0
    if (appMode == 0){
      if (stateRes.state == "playing"){
        console.log("Stopping track player")
        await TrackPlayer.stop();
      }
      return;
    } 

    // Transform angle into index of tracks
    let angleIndex = Math.floor(angle/10);
    let trackIndex = 0;

    // Select trac
    if (angleIndex == 0){
      trackIndex = trackIndices['silence1s'];
    }else if (angleIndex <= 4)
      trackIndex = trackIndices[angleIndex + 'click'];
    else if (angleIndex > 4)
      trackIndex = trackIndices['4click'];

    
    if (stateRes.state != "playing"){
      TrackPlayer.skip(trackIndex); // https://rntp.dev/docs/api/functions/queue
      TrackPlayer.play(); // https://rntp.dev/docs/api/functions/player
    }
    if (trackIndex != actTrackIndex){
      TrackPlayer.skip(trackIndex);
    }

    return;

      
    

  }

// Change mode
  export function changeMode() {
    appMode++;
    appMode = appMode % 2; // Two modes
    if (appMode == 0)
      appModeName = 'OFF';
    else if (appMode == 1)
      appModeName = 'TILT';

    console.log("MODE: " + appMode);
  }
  
  
  // Used in index.js (runs in background)
  export async function playbackService() {

    // TODO: Attach remote event handlers
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
      console.log("PLAY BUTTON PRESS");
      changeMode();
      //TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
      console.log("PAUSE BUTTON PRESS");
      changeMode();
      //TrackPlayer.pause();
    });

    

  }

