import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private readonly expiredSessionSubject = new Subject<void>();

    private expired = false;

    readonly expiredSession$ = this.expiredSessionSubject.asObservable();
    readonly KEEP_ALIVE_TIMEOUT_MS = 90_000;
    private eventSource?: EventSource;
    private reconnectAttempts = 0;
    private reconnectTimer?: ReturnType<typeof setTimeout>;
    private watchdogTimer?: ReturnType<typeof setTimeout>;

    initialize() {
        this.connect();
    }

    private connect(): void {
        this.disconnect(); // Start from scratch. No open connections
        console.debug('initialise session banner');
        this.eventSource = new EventSource('/db-web-ui/api/session/events', { withCredentials: true });

        this.eventSource.addEventListener('keep-alive', () => this.resetWatchdog());

        this.eventSource.addEventListener('session-expired', () => {
            console.info('session-events session has expired - show banner');
            this.showSessionExpired();
            console.debug('show banner');
            this.disconnect();
        });

        this.eventSource.addEventListener('session-closed', () => {
            console.info('session-events stream closed by server, no banner');
            this.disconnect(); // close for good, so the browser doesn't reconnect
        });

        this.eventSource.onopen = () => {
            console.info('session-events stream (re)connected');
            this.reconnectAttempts = 0; // reset backoff once a connection actually succeeds
            this.resetWatchdog();
        };

        this.eventSource.onerror = () => {
            console.info('session-events stream closed');
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                // Browser gave up permanently — reconnect ourselves with backoff.
                this.scheduleReconnect();
            }
        };
    }

    private disconnect(): void {
        clearTimeout(this.watchdogTimer);
        clearTimeout(this.reconnectTimer);
        this.eventSource?.close();
        this.eventSource = undefined;
    }

    private resetWatchdog(): void {
        clearTimeout(this.watchdogTimer);
        this.watchdogTimer = setTimeout(() => {
            console.debug('no keep-alive received — stream looks dead, reconnecting');
            this.eventSource?.close();
            this.eventSource = undefined;
            this.scheduleReconnect();
        }, this.KEEP_ALIVE_TIMEOUT_MS);
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
