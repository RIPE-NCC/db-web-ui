import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PropertiesService } from '../properties.service';

@Component({
    selector: 'require-login',
    templateUrl: './require-login.component.html',
    standalone: true,
})
export class RequireLoginComponent implements OnInit {
    private properties = inject(PropertiesService);
    private activatedRoute = inject(ActivatedRoute);

    public loginUrl: string;

    public ngOnInit() {
        this.loginUrl = this.getLoginUrl();
    }

    private getLoginUrl(): string {
        return (
            this.properties.LOGIN_URL +
            '?originalUrl=' +
            encodeURIComponent(location.origin + '/db-web-ui/fmp/' + this.getReturnUrlForForgotMaintainerPassword())
        );
    }

    private getReturnUrlForForgotMaintainerPassword() {
        if (this.activatedRoute.snapshot.queryParamMap.has('mntnerKey')) {
            return (
                'change-auth?mntnerKey=' +
                this.activatedRoute.snapshot.queryParamMap.get('mntnerKey') +
                '&voluntary=' +
                Boolean(this.activatedRoute.snapshot.queryParamMap.get('voluntary'))
            );
        } else {
            return '';
        }
    }
}
