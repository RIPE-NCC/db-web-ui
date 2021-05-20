import {Component} from "@angular/core";
import {PropertiesService} from "../properties.service";

declare var loadUserlike: (userlikeKey: string) => any;

@Component({
    selector: "live-chat",
    templateUrl: "./live-chat.component.html",
})
export class LiveChatComponent {

    private loadedUserLikeScript: boolean = false;

    constructor(private properties: PropertiesService) {}

    public loadLiveChat() {
        loadUserlike(this.properties.LIVE_CHAT_KEY);
        this.loadedUserLikeScript = true;
    }

    public isHideLiveChat() {
        let hoursMinutesSeconds = new Date().toLocaleTimeString("en-GB", { timeZone: 'Europe/Amsterdam' }).split(':').map(x => parseInt(x))
        // don't show before 9h and after 18h
        let isWorkingHours = hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18;
        return this.loadedUserLikeScript || !isWorkingHours;
    }
}
