import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { BannerComponent, BannerTypes } from '../banner/banner.component';
import { PropertiesService } from '../properties.service';

export interface IModalAuthentication {
    method: any;
    objectType: string;
    objectName: string;
    mntners: any;
    allowForcedDelete: any;
    isLirObject: any;
    source: string;
}

@Component({
    selector: 'modal-authentication',
    templateUrl: './modal-sso-required-authentication.component.html',
    standalone: true,
    imports: [FormsModule, BannerComponent, RouterLink, MatButton],
})
export class ModalSsoRequiredAuthenticationComponent implements OnInit {
    private activeModal = inject(NgbActiveModal);
    properties = inject(PropertiesService);

    @Input()
    public resolve: IModalAuthentication;

    public PORTAL_URL: string;
    public allowedObjectTypes: string[] = ['inetnum', 'inet6num', 'route', 'route6', 'domain'];
    errorMsg: string;

    constructor() {
        const properties = this.properties;
        this.PORTAL_URL = properties.PORTAL_URL;
    }

    public ngOnInit() {
        this.allowForceDelete();
        this.errorMsg = `The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer <a href="${this.PORTAL_URL}#/account-details">here</a>.`;
    }

    public allowForceDelete() {
        if (this.resolve.method === 'ForceDelete') {
            return false;
        }
        return this.resolve.allowForcedDelete && _.includes(this.allowedObjectTypes, this.resolve.objectType);
    }

    public cancel(reason?: string) {
        this.activeModal.dismiss(reason);
    }

    protected readonly BannerTypes = BannerTypes;
}
