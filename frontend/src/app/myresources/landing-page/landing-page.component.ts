import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { SessionInfoService } from '../../sessioninfo/session-info.service';
import { UserInfoService } from '../../userinfo/user-info.service';
import { ResourcesComponent } from '../resources.component';

@Component({
    selector: 'landing-page',
    templateUrl: './landing-page.component.html',
    styleUrl: 'landing-page.component.scss',
    standalone: true,
    imports: [ResourcesComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingPageComponent implements OnInit {
    private userInfoService = inject(UserInfoService);
    private sessionInfoService = inject(SessionInfoService);

    description: string =
        'View and manage your IPv4, IPv6 and AS Numbers in one place. RIPE NCC members can view and manage their resources. Holders of Provider Independent (PI) assignments can also view their resources. \n\nTo access the Resources page, you need to have a RIPE NCC Access account. Each user needs their own personal account.';
    loggedIn: boolean;

    ngOnInit() {
        this.loggedIn = this.userInfoService.isLoggedIn();
        this.sessionInfoService.expiredSession$.subscribe((isSessionExpired: boolean) => {
            this.loggedIn = !isSessionExpired;
        });
    }
}
