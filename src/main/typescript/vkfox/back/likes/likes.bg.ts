"use strict";
import Mediator from '../../mediator/mediator.bg'
import * as _ from "underscore"
import Request from '../../request/request.bg'
import Msg from "../../mediator/messages";
import {LikesChanged} from "../../newsfeed/types";
import {LikesGenereicResponse} from "../../../vk/types";



function likesChange(params: LikesChanged) {
    const action = params.action;

    delete params.action;

    Request
        .api<LikesGenereicResponse>({code: 'return API.likes.' + action + '(' + JSON.stringify(params) + ');'})
        .then( (response) => {

            Mediator.pub(Msg.LikesChanged, _.extend(params, {
                likes: {
                    count     : response.likes,
                    user_likes: action === 'delete' ? 0:1,
                    can_like  : action === 'delete' ? 1:0
                }
            }));
    });

}

export default function init() {
    Mediator.sub(Msg.LikesChange, likesChange);
}