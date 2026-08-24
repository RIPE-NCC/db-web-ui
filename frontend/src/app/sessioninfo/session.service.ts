import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private readonly expiredSessionSubject = new Subject<void>();

    private expired = false;

    readonly expiredSession$ = this.expiredSessionSubject.asObservable();
    private eventSource?: EventSource;

    constructor() {}

    initialize() {
        console.log('initialise session banner');
        this.eventSource = new EventSource('/db-web-ui/api/session/events', { withCredentials: true });

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

    showSessionExpired() {
        if (this.expired) {
            return;
        }

        this.expired = true;
        this.expiredSessionSubject.next();
    }
}
