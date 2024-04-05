import { Button, View } from "tamagui";
import useRecorder from "../utilities/sound";

const Recorder = () => {
  const { startRecording, stopRecording } = useRecorder();
  return (
    <View>
      <Button onPress={startRecording}>Start Recording</Button>
      <Button onPress={stopRecording}>Stop Recording</Button>
    </View>
  );
};

export default Recorder;