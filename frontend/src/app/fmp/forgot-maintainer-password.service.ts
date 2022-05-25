import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

export interface IForgotMaintainerPassword {
    mntnerKey: string;
    reason: string;
    email: string;
    voluntary: boolean;
}

export interface IForgotMaintainerState {
    mntnerKey: string;
    voluntary: boolean;
}

@Injectable()
export class ForgotMaintainerPasswordService {
    private readonly API_BASE_URL: string = 'api/whois-internal/api/fmp-pub/forgotmntnerpassword';

    constructor(private http: HttpClient) {}

    public generatePdfAndEmail(forgotPasswordMaintainerModel: IForgotMaintainerPassword) {
        console.info('Posting data to url {} with object {}.', this.API_BASE_URL, forgotPasswordMaintainerModel);
        return this.http
            .post(this.API_BASE_URL, forgotPasswordMaintainerModel, {})
            .pipe(map(() => this.API_BASE_URL + '/' + btoa(JSON.stringify(forgotPasswordMaintainerModel))));
    }
}
