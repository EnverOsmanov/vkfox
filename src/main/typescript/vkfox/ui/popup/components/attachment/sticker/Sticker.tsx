import * as React from "react"
import {AnimationSticker} from "../../../../../../vk/types/attachment";

import {AnimationItem} from "lottie-web/index"
import * as lottie from "lottie-web/build/player/lottie_light"

type LettiePlayer = typeof lottie.default
const lottiePlayer = lottie as any as LettiePlayer

interface StickerProps {
    sticker: AnimationSticker
}

interface StickerState {
    refToElement: HTMLDivElement
    animObj: AnimationItem
}

export default class Sticker extends React.Component<StickerProps, StickerState> {
    animBox: HTMLDivElement = null

    componentDidMount() {
        //call the loadAnimation to start the animation
        const {sticker} = this.props
        const animObj = lottiePlayer.loadAnimation({
            container: this.animBox, // the dom element that will contain the animation
            renderer : "svg",
            autoplay : false,
            loop     : false,
            path     : sticker.animation_url // the path to the animation json
        });

        this.setState(oldState => ({...oldState, animObj}))
    }

    render(): React.ReactNode {
        return (
            <div
                onMouseEnter={_ => this.state.animObj.goToAndPlay(0)}
                className="item__sticker"
                ref={ref => this.animBox = ref}
            />
        )
    }
}