import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

const useRecorder = () => {
  const [permissioned, setPermissioned] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Simply get recording permission upon first render
  useEffect(() => {
    async function getPermission() {
      if (permissioned) {
        return;
      }

      // check if permissions are granted
      Audio.getPermissionsAsync().then((permission) => {
        permission.granted ? setPermissioned(true) : setPermissioned(false);
      });

      if (!permissioned) {
        await Audio.requestPermissionsAsync()
          .then((permission) => {
            console.log("Permission Granted: " + permission.granted);
            setPermissioned(permission.granted);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    // Call function to get permission
    getPermission();
  }, [permissioned]);

  async function startRecording() {
    try {
      // needed for IoS

      if (!isRecording) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        console.log("Starting Recording");
        await recording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        await recording.startAsync();

        setRecording(recording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  async function stopRecording() {
    try {
      if (isRecording && recording) {
        console.log("Stopping Recording");
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI()!;

        // Create a file name for the recording
        const fileName = `tile-1.caf`;

        // Move the recording to the new directory with the new file name
        await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "recordings/",
          { intermediates: true }
        );
        await FileSystem.moveAsync({
          from: recordingUri,
          to: FileSystem.documentDirectory + "recordings/" + `${fileName}`,
        });

        // This is for simply playing the sound back
        const playbackObject = new Audio.Sound();
        await playbackObject.loadAsync({
          uri: FileSystem.documentDirectory + "recordings/" + `${fileName}`,
        });
        await playbackObject.playAsync();

        setRecording(null);
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }

  return { startRecording, stopRecording };
};

export default useRecorder;

export const useAudioFiles = () => {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);

  useEffect(() => {
    async function getAudioFiles() {
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "recordings/"
      );
      setAudioFiles(files.map((file) => FileSystem.documentDirectory + "recordings/" + file));
    }

    getAudioFiles();
  }, []);

  return { audioFiles };
};
