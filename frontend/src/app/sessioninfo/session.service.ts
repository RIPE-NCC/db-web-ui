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
    private reconnectAttempts = 0;
    private reconnectTimer?: ReturnType<typeof setTimeout>;

    initialize() {
        this.connect();
    }

    private connect(): void {
        console.debug('initialise session banner');
        this.eventSource = new EventSource('/db-web-ui/api/session/events', { withCredentials: true });

        this.eventSource.addEventListener('session-expired', () => {
            console.debug('session-events session has expired - show banner');
            this.showSessionExpired();
        });

        this.eventSource.onopen = () => {
            console.debug('session-events stream (re)connected');
            this.reconnectAttempts = 0; // reset backoff once a connection actually succeeds
        };

        this.eventSource.onerror = () => {
            console.debug('session-events stream closed');
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                // Browser gave up permanently — reconnect ourselves with backoff.
                this.scheduleReconnect();
            }
        };
    }

    private scheduleReconnect(): void {
        if (this.expired) {
            return; // session's actually dead, no point reconnecting
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 60_000); // exponential backoff, capped at 60s

        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
            console.debug(`reconnecting session-events stream, attempt ${this.reconnectAttempts}`);
            this.eventSource?.close();
            this.connect();
        }, delay);
    }

    showSessionExpired() {
        if (this.expired) {
            return;
        }

        this.expired = true;
        this.expiredSessionSubject.next();
    }
}
