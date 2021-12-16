import {Component} from "@angular/core";
import {PropertiesService} from "../properties.service";
import {CookieService} from "ngx-cookie-service";

declare var loadZendeskChat: (zendeskChatKey: string) => any;

@Component({
  selector: "live-chat",
  templateUrl: "./live-chat.component.html",
})
export class LiveChatComponent {

  constructor(private properties: PropertiesService,
              private cookies: CookieService) {
  }

  public ngOnInit() {
    if (this.cookies.get("open-live-chat") === "true") {
      this.loadLiveChat();
    }
  }

  public loadLiveChat() {
    loadZendeskChat(this.properties.LIVE_CHAT_KEY);
  }

  public isHideLiveChat() {
    if (this.properties.LIVE_CHAT_KEY === "") {
      return true;
    }

    const date = new Date();
    const currentDay = date.toLocaleDateString("en-GB", {timeZone: "Europe/Amsterdam", weekday: "long"})
    // don't show for weekends
    const isWeekend = currentDay === "Saturday" || currentDay === "Sunday"

    const hoursMinutesSeconds = date.toLocaleTimeString("en-GB", {timeZone: "Europe/Amsterdam"}).split(":").map(x => parseInt(x))
    // don't show before 9h and after 18h
    const isWorkingHours = hoursMinutesSeconds[0] >= 9 && hoursMinutesSeconds[0] < 18;
    return isWeekend || !isWorkingHours;
  }
}
