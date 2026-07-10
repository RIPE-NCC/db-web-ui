import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SessionInfo } from './types';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private readonly expiredSessionSubject = new Subject<void>();

    private expired = false;

    readonly expiredSession$ = this.expiredSessionSubject.asObservable();

    constructor(private http: HttpClient) {}

    initialize() {
        this.http.get<SessionInfo>('api/session').subscribe((info) => {
            if (info.authenticated) {
                this.startTimer(new Date(info.expiresAt));
            }
        });
    }

    private startTimer(expiresAt: Date) {
        const timeout = expiresAt.getTime() - Date.now();

        if (timeout <= 0) {
            this.showSessionExpired();
            return;
        }
    }

    showSessionExpired() {
        if (this.expired) {
            return;
        }

        this.expired = true;
        this.expiredSessionSubject.next();
    }
}
