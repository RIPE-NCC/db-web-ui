import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TypeformDialogComponent } from '../../query/typeform-dialog/typeform-dialog.component';
import { UserInfoService } from '../../userinfo/user-info.service';

@Component({
    selector: 'typeform-banner',
    templateUrl: './typeform-banner.component.html',
    styleUrl: './typeform-banner.component.scss',
    standalone: true,
    imports: [MatButton],
})
export class TypeformBannerComponent implements OnInit {
    dialog = inject(MatDialog);
    private userInfoService = inject(UserInfoService);

    public closed: boolean;
    public loggedInUser: boolean;

    constructor() {
        this.userInfoService.userLoggedIn$.subscribe(() => {
            this.loggedInUser = true;
        });
    }

    public ngOnInit() {
        this.closed = localStorage.getItem('typeform-banner') === 'closed';
        this.loggedInUser = this.userInfoService.isLogedIn();
    }

    openConfirmDialog() {
        (window as any)._paq = (window as any)._paq || [];
        (window as any)._paq.push(['trackEvent', 'NPS Click', 'Click', 'nps']);
        this.dialog.open(TypeformDialogComponent, {
            disableClose: true,
            width: '95vw',
            height: '95vh',
            panelClass: 'typeform-dialog-container',
        });
    }

    closeTypeformBanner() {
        const element = document.getElementsByName('typeform')[0];
        element.parentNode.removeChild(element);
        localStorage.setItem('typeform-banner', 'closed');
    }
}
