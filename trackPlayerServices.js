
// https://blog.logrocket.com/react-native-track-player-complete-guide/
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    State,
    Capability,
    RepeatMode,
    Event
  } from 'react-native-track-player';
  
  export async function setupPlayer() {
    let isSetup = false;
    try {
      await TrackPlayer.getCurrentTrack();
      isSetup = true;
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
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        progressUpdateEventInterval: 2,
      });
  
      isSetup = true;
    }
    finally {
      return isSetup;
    }
  }
  
  export async function addTracks() {
    await TrackPlayer.add([
      {
        id: String(Math.random()),
        //url: require('./assets/03KingKunta.wav'), // mp3 audios do not work?
        url: require('./assets/click.wav'),
        // title: 'King Kunta',
        // artist: 'Kendrik Lamar',
        // duration: 60,
      }
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
  }

  export async function playTrack(angle){
    let res = await TrackPlayer.getPlaybackState();
    console.log("Playing " +  res.state + ", angle: " + angle);

    TrackPlayer.reset();
    await addTracks();
    TrackPlayer.play();
  }
  
  export async function playbackService() {
    // TODO: Attach remote event handlers
  }