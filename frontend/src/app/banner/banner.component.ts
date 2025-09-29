import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PropertiesService } from '../properties.service';

/*  Usage
    promo:
        - Upcoming events (Ripe meeting / training)
        - New features
        - Product release
    informational:
        - Welcome Message
        - Policy Changes: Notify users about updates to terms of service, privacy policies, or other legal agreements that affect their use of the platform. (not warning / dangerous)
        - Helpful Tips: Offer users tips, tricks, or best practices for using the platform more effectively or efficiently.
    error:
        - Network or Server Errors: Inform users about issues related to network connectivity or server errors, such as timeouts, database connection failures, or server maintenance.
        - Expired sessions
        - Data Processing Errors
        - System-wide Errors: Banner errors can be used to communicate system-wide errors or disruptions, such as service outages, technical issues, or maintenance downtime, and inform users about the situation and expected resolution times
    warning:
        - Potential risks or errors
        - Service Updates: Inform users about scheduled maintenance, system upgrades that will might effect the normal workflow and they need to be aware of.
    success:
        - A success banner notification is used to provide positive feedback to users and reassure them that their actions or tasks have been completed successfully.
        - Form Submission: After successfully submitting a form, such as a registration form or a contact form, a success banner can confirm that the submission was successful
        - Account Creation: After successfully creating a new account on a website or application, a success banner can confirm the account creation and provide next steps for the user.
        - Task Completion: In task-oriented applications, such as project management tools or to-do lists, a success banner can notify users when a task has been completed successfully.
        - File Upload: After successfully uploading a file, such as a document or an image, a success banner can confirm the successful upload and provide options for further actions.
     */
export enum BannerTypes {
    promo = 'promo',
    informational = 'informational',
    error = 'error',
    warning = 'warning',
    success = 'success',
}

@Component({
    selector: 'banner',
    templateUrl: './banner.component.html',
    styleUrl: 'banner.component.scss',
    imports: [NgIf, MatButton, MatDialogClose],
    standalone: true,
})
export class BannerComponent implements OnInit {
    @Input()
    title?: string;
    @Input()
    textContent: string;
    @Input()
    type: BannerTypes;
    @Input() // used for closing specific banner
    id: string;
    @Input() // dismiss once and for all
    persistDismiss: boolean = false;
    @Input() // 2nd button url
    buttonUrl?: string;
    @Input() // 2nd button text
    buttonText?: string;

    closed: boolean;

    constructor(private router: Router, private properties: PropertiesService) {}

    ngOnInit() {
        if (this.persistDismiss) {
            this.closed = localStorage.getItem(this.id) === 'closed';
        }
    }

    closeBanner() {
        this.closed = true;
        if (this.persistDismiss) {
            localStorage.setItem(this.id, 'closed');
        }
    }

    navigateToButtonUrl() {
        if (!this.buttonUrl) return;
        const isExternal = /^(http|https):\/\//.test(this.buttonUrl);
        const isReload = this.router.url === this.buttonUrl;
        const isLogin = this.properties.LOGIN_URL === this.buttonUrl;
        if (isReload) {
            window.location.reload();
        } else if (isLogin) {
            window.open(this.buttonUrl, '_self');
        } else if (isExternal) {
            window.open(this.buttonUrl, '_blank');
        } else {
            void this.router.navigate([this.buttonUrl]);
        }
    }

    protected readonly BannerTypes = BannerTypes;
}
