import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { IWhoisObjectModel } from '../shared/whois-response-type.model';
import { FmpErrorService } from './fmp-error.service';

export interface IFindMaintainer {
    maintainerKey: string;
    selectedMaintainer?: any;
    email?: string;
    mntnerFound?: boolean;
    expired?: boolean;
}

@Injectable()
export class FindMaintainerService {
    private readonly API_BASE_URL: string = 'api/whois-internal/api/fmp-pub/mntner/';

    constructor(private http: HttpClient, private fmpErrorService: FmpErrorService) {}

    public search(maintainerKey: string): Observable<IFindMaintainer> {
        return this.find(maintainerKey).pipe(
            flatMap((result: any) => {
                return this.validate(maintainerKey).pipe(
                    flatMap((validationResult: { expired: boolean }) => {
                        return of(this.getFoundMaintainer(result.objects.object[0], validationResult.expired));
                    }),
                    catchError((error: any) => throwError(() => 'switchToManualResetProcess')),
                );
            }),
            catchError((error: any, caught: Observable<any>) => {
                if (error.status === 404) {
                    return throwError(() => 'The maintainer could not be found.');
                } else if (error.status === 403) {
                    if (this.fmpErrorService.isYourAccountBlockedError(error)) {
                        this.fmpErrorService.setGlobalAccountBlockedError();
                        return;
                    }
                    return throwError(error.error); // XYZ-MNT is synchronized with organisation ABC in LIR Portal
                } else if (error === 'switchToManualResetProcess') {
                    return throwError(() => 'switchToManualResetProcess');
                } else {
                    return throwError(() => 'Error fetching maintainer.');
                }
            }),
        );
    }

    public sendMail(mntKey: string): Observable<any> {
        console.info('Posting data to url {} with object {}.', this.API_BASE_URL, mntKey);
        return this.http.post(this.API_BASE_URL + mntKey + '/emaillink.json', { maintainerKey: mntKey });
    }

    private getFoundMaintainer(selectedMaintainer: IWhoisObjectModel, expired: boolean): IFindMaintainer {
        const email = selectedMaintainer.attributes.attribute.filter((attr) => attr.name.toLocaleLowerCase() === 'upd-to')[0].value;
        // have to be mntner from result, is necessary for optional modify option which user can choose in next step
        const maintainerKey = selectedMaintainer.attributes.attribute.filter((attr) => attr.name.toLocaleLowerCase() === 'mntner')[0].value;
        return {
            maintainerKey,
            selectedMaintainer,
            email,
            mntnerFound: true,
            expired,
        };
    }

    private find(maintainerKey: string): Observable<IFindMaintainer> {
        console.info('Posting data to url {} with object {}.', this.API_BASE_URL, maintainerKey);
        return this.http.get<IFindMaintainer>(`${this.API_BASE_URL}${maintainerKey}`);
    }

    private validate(maintainerKey: string): Observable<{ expired: boolean }> {
        console.info('Posting data to url {} with object {}.', this.API_BASE_URL, maintainerKey);
        return this.http.get<{ expired: boolean }>(`${this.API_BASE_URL}${maintainerKey}/validate`);
    }
}
