import {Component} from "@angular/core";
import {PropertiesService} from "../properties.service";
import {MatDialogRef} from "@angular/material/dialog";

declare let useUsersnap: () => any;
declare var loadZendeskChat: (zendeskChatKey: string) => any;

@Component({
  selector: "feedback-support-dialog",
  templateUrl: "./feedback-support-dialog.component.html",
})
export class FeedbackSupportDialogComponent {

  public showChatMenuItem: boolean;

  constructor(private properties: PropertiesService,
              private dialogRef: MatDialogRef<FeedbackSupportDialogComponent>) {
  }

  public ngOnInit() {
    this.showChatMenuItem = this.properties.LIVE_CHAT_KEY !== "";
  }

  sendEmail() {
    window.open(
        "https://www.ripe.net/support/contact", "_blank");
    this.dialogRef.close();
  }

  openUsersnap() {
    useUsersnap();
    this.dialogRef.close();
  }

  openLiveChat() {
    loadZendeskChat(this.properties.LIVE_CHAT_KEY);
    this.dialogRef.close();
  }
}
