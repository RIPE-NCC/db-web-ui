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
    private eventSource?: EventSource;

    constructor() {}

    initialize() {
        this.eventSource = new EventSource('/api/session/events', { withCredentials: true });

        this.eventSource.addEventListener('session-expired', () => {
            console.log('session-events session has expired - show banner');
            this.showSessionExpired();
        });

        this.eventSource.onerror = () => {
            console.log('session-events stream closed');
            // Connection dropped (network blip, server restart, etc.).
            // Browsers auto-retry EventSource by default; nothing to do here
            // unless you want custom backoff/logging.
        };
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
