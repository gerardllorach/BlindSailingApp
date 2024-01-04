
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

  const durTilt = 2;
  const tracks = {
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
  let prevTrack;
  
  export async function setupPlayer() {
    let isSetup = false;
    TrackPlayer.remove();

    try {
      await TrackPlayer.getActiveTrackIndex();
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
      console.log(queue);

      // Load all tracks
      console.log("Loading all tracks");

      Object.keys(tracks).forEach((id, index) => {
        if (queue[index] != undefined){
          if (queue[index].id == id)
            console.log("Track " + id + " already loaded");
          else
            TrackPlayer.add(tracks[id]);
        } else {
          TrackPlayer.add(tracks[id]);
        } 
      });
      
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      TrackPlayer.play();

      let queuedTracks = await TrackPlayer.getQueue();
      console.log(queuedTracks);

      return isSetup;
    }
  }




  export async function playTrack(angle){
    let stateRes = await TrackPlayer.getPlaybackState();
    let actTrackIndex = await TrackPlayer.getActiveTrackIndex();

    //console.log("Angle: " + angle)
    // Flat phone
    if (angle < 10 || angle == undefined){
      if (stateRes.state == "playing"){
        console.log("Stopping track player")
        await TrackPlayer.stop();
      }
      return;
    } 
    
    for (let i = 0; i < 4; i++){
      if ((angle > (10*(i+1)) && angle < (10*(i+2)) ) || (i == 3 && angle > 40)){
        if (stateRes.state != "playing"){
          TrackPlayer.skip(i); // https://rntp.dev/docs/api/functions/queue
          TrackPlayer.play(); // https://rntp.dev/docs/api/functions/player
        }
        if (i != actTrackIndex){
          TrackPlayer.skip(i);
        }
      }
    }
    return;

      
    

  }
  
  // Used in index.js (runs in background)
  export async function playbackService() {
    // TODO: Attach remote event handlers
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  }

