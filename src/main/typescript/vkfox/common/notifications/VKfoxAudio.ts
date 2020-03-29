import Settings from "./VKfoxSignal"
import {SoundSetting} from "./types";
import Request from "../request/Request"
import {Sex} from "../users/types";
import {SPEECH_KEY, SPEECH_ID_POLLY, SPEECH_KEY_POLLY} from "../config/config";
import * as Polly from 'aws-sdk/clients/polly';

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
        this.readTextInVoicePolly(text, sex)
    }

    private static async readTextInVoicePolly(text: string, sex: Sex) {
        try {
            const credentials = {
                accessKeyId: SPEECH_ID_POLLY,
                secretAccessKey: SPEECH_KEY_POLLY
            };
            const options: Polly.Types.ClientConfiguration = {
                region: "eu-west-3",
                credentials
            };
            const polly = new Polly(options);

            const speaker = sex === Sex.Female
                ? "Tatyana"
                : "Maxim";

            const params: Polly.Types.SynthesizeSpeechInput = {
                Text: text,
                OutputFormat: "ogg_vorbis",
                VoiceId: speaker
            };
            const result = await polly.synthesizeSpeech(params).promise();

            const array = result.AudioStream as Uint8Array;

            const aContext = new AudioContext();
            const source = aContext.createBufferSource();
            source.buffer = await aContext.decodeAudioData(array.buffer);
            source.connect(aContext.destination);
            source.start();
        }
        catch (e) {
            console.error("VKfoxAudio, Polly:", e)
        }
    }

    private static async textInVoiceYandex(text: string, sex: Sex) {
        const speaker = sex === Sex.Female
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