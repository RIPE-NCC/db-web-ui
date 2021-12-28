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
    return this.properties.LIVE_CHAT_KEY === "";
  }
}
