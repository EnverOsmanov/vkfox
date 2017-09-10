import Settings from "./settings"
import {SoundSetting} from "./Notification";

let audioInProgress = false;

class VKfoxAudio {
    static play(sound: SoundSetting): void {

        if (!audioInProgress) {
            audioInProgress = true;

            const source = Settings[sound.signal];

            const audio = new Audio(source);
            audio.volume = sound.volume;
            audio.play();
            audio.addEventListener("ended", () => { audioInProgress = false });
        }
    }
}

export default VKfoxAudio