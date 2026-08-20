import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private http = inject(HttpClient);

    private readonly expiredSessionSubject = new Subject<void>();

    private expired = false;

    readonly expiredSession$ = this.expiredSessionSubject.asObservable();

    constructor() {}

    initialize() {
        this.startTimer(new Date(Date.now() + 8 * 60 * 60 * 1000)); //TODO: Use HZ
    }

    private startTimer(expiresAt: Date): void {
        const timeout = expiresAt.getTime() - Date.now();

        if (timeout <= 0) {
            this.showSessionExpired();
            return;
        }

        console.log('expiresAt:', expiresAt);
        console.log('expiresAt.getTime():', expiresAt.getTime());
        console.log('Date.now():', Date.now());
        console.log('timeout:', timeout);
        window.setTimeout(() => {
            this.showSessionExpired();
        }, timeout);
    }

    showSessionExpired() {
        if (this.expired) {
            return;
        }

        this.expired = true;
        this.expiredSessionSubject.next();
    }
}
