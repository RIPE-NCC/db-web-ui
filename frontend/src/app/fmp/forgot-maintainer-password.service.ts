import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';

export interface IForgotMaintainerPassword {
    mntnerKey: string;
    reason: string;
    email: string;
    voluntary: boolean;
}

@Injectable({ providedIn: 'root' })
export class ForgotMaintainerPasswordService {
    private http = inject(HttpClient);

    private readonly API_BASE_URL: string = 'api/whois-internal/api/fmp-pub/forgotmntnerpassword';

    public generatePdfAndEmail(forgotPasswordMaintainerModel: IForgotMaintainerPassword) {
        console.info('Posting data to url {} with object {}.', this.API_BASE_URL, forgotPasswordMaintainerModel);
        return this.http
            .post(this.API_BASE_URL, forgotPasswordMaintainerModel, {})
            .pipe(map(() => this.API_BASE_URL + '/' + btoa(JSON.stringify(forgotPasswordMaintainerModel))));
    }
}
