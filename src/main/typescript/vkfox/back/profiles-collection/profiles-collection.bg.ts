import {UserProfile} from "../../common/users/types";
import Mediator from "../../mediator/mediator.bg";
import {Msg} from "../../mediator/messages";

export class GProfileCollCmpn {

    /**
     * @see http://vk.com/developers.php?oid=-17680044&p=Connecting_to_the_LongPoll_Server

     */
    private static _onUserUpdates<P extends UserProfile>(self: Map<number, P>, updates: number[][]): void {

        updates.forEach( update => {
            const type = update[0],
                userId = Math.abs(update[1]);

            // 8,-$user_id,0 -- друг $user_id стал онлайн
            // 9,-$user_id,$flags -- друг $user_id стал оффлайн
            // ($flags равен 0, если пользователь покинул сайт (например, нажал выход) и 1,
            // если оффлайн по таймауту (например, статус away))
            if (type === 9 || type === 8) {
                const model = self.get(Number(userId));

                if (model) model.online = (type === 8) ? 1 : 0;
            }
        });
    }

    static subscribeForLpUpdates<P extends UserProfile>(users: Map<number, P>): void {
        Mediator.sub(
            Msg.LongpollUpdates,
            (updates: number[][]) => GProfileCollCmpn._onUserUpdates(users, updates)
        );
    }
}