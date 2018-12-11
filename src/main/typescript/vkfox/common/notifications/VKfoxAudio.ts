import Settings from "./VKfoxSignal"
import {SoundSetting} from "./types";
import Request from "../request/Request"
import {Sex} from "../../back/users/types";
import {SPEECH_KEY} from "../config/config";

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


    static async readTextInVoice(text: string, sex: Sex) {
        const speaker = sex === 1
            ? "oksana"
            : "zahar";

        const url = "https://tts.voicetech.yandex.net/generate?";
        const params: object = {
            text,
            speaker,
            format: "opus",
            key: SPEECH_KEY
        };

        const aContext = new AudioContext();

        const result = await Request.customGet(url, params);

        const aBuffer = await result.arrayBuffer();

        const source = aContext.createBufferSource();
        source.buffer = await aContext.decodeAudioData(aBuffer);
        source.connect((aContext.destination));
        source.start();
    }
}

export default VKfoxAudio