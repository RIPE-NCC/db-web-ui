import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PropertiesService } from '../properties.service';
import { UserInfoService } from '../userinfo/user-info.service';

@Component({
    selector: 'feedback-support-dialog',
    templateUrl: './feedback-support-dialog.component.html',
})
export class FeedbackSupportDialogComponent implements OnInit {
    public showChatMenuItem: boolean;

    constructor(
        private properties: PropertiesService,
        private dialogRef: MatDialogRef<FeedbackSupportDialogComponent>,
        private userInfoService: UserInfoService,
    ) {}

    public ngOnInit() {
        this.showChatMenuItem = this.properties.LIVE_CHAT_KEY !== '';
    }

    sendEmail() {
        window.open('https://www.ripe.net/support/contact', '_blank', 'noopener');
        this.dialogRef.close();
    }

    openLiveChat() {
        const livechat = document.querySelector('live-chat');
        livechat.dispatchEvent(new Event('live-chat-open'));
        this.dialogRef.close();
    }
}
