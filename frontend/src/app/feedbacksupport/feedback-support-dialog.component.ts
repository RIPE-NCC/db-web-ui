import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatLine } from '@angular/material/core';
import { MatDialogActions, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatActionList, MatListItem } from '@angular/material/list';
import { PropertiesService } from '../properties.service';

@Component({
    selector: 'feedback-support-dialog',
    templateUrl: './feedback-support-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogActions, MatActionList, MatListItem, MatLine, NgIf],
})
export class FeedbackSupportDialogComponent implements OnInit {
    private properties = inject(PropertiesService);
    private dialogRef = inject<MatDialogRef<FeedbackSupportDialogComponent>>(MatDialogRef);

    public showChatMenuItem: boolean;

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
