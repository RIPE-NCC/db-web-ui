import { EventEmitter, Injectable } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { PropertiesService } from '../properties.service';
import { UserInfoService } from '../userinfo/user-info.service';

const localStorageSessionCheckStarted = 'sessionCheck';
const localStorageSessionExpiredKey = 'sessionExpired';
const hasCookie = 'hasCookie';

@Injectable()
export class SessionInfoService {
    public cancelInterval$ = new Subject<void>();
    public expiredSession$ = new EventEmitter<boolean>();
    public checkingSession: boolean;
    private readonly onSessionManager;

    constructor(private properties: PropertiesService, private userInfoService: UserInfoService) {
        SessionInfoService.propagateCurrentCookieStatus();
        this.onSessionManager = (e) => {
            if (e.key === localStorageSessionExpiredKey && e.newValue) {
                //if we logged out from the current window, in other window we will rise
                // the banner. However, we don't want to rise the banner in the current one
                if (this.checkingSession) {
                    this.authenticationFailure();
                }
                localStorage.removeItem(localStorageSessionExpiredKey);
            } else if (e.key === localStorageSessionCheckStarted && e.newValue) {
                this.cancelAndRestartCounter();
            }
        };
        window.addEventListener('storage', this.onSessionManager);
    }

    private static propagateCurrentCookieStatus() {
        const userWasLoggedIn = localStorage.getItem(hasCookie) !== null;
        const ssoRipeHintCookieExist = document.cookie.includes('crowd.ripe.hint');
        // user was logged and the crowd.ripe.hint cookie doesn't exist, so user is logged out
        if (userWasLoggedIn && !ssoRipeHintCookieExist) {
            localStorage.removeItem(hasCookie);
            localStorage.setItem(localStorageSessionExpiredKey, 'TTL expired');
        }
    }

    public startCheckingSession() {
        if (!this.checkingSession) {
            // we set the item to let the other browsers/tabs that we have a new session
            localStorage.setItem(hasCookie, 'true');
            localStorage.setItem(localStorageSessionCheckStarted, 'session check started');
            this.cancelAndRestartCounter();
        }
    }

    private cancelAndRestartCounter() {
        localStorage.removeItem(localStorageSessionCheckStarted);
        this.cancelInterval$.next();
        this.expiredSession$.emit(false);
        this.checkingSession = true;
        this.checkingUserSessionExpired();
    }

    public authenticationFailure() {
        this.userInfoService.removeUserInfo();
        if (this.checkingSession) {
            this.raiseAlert();
            // we set the item to let the other browsers/tabs that session has expired
            // this will not trigger the listener within the same tab
            localStorage.removeItem(hasCookie);
            localStorage.setItem(localStorageSessionExpiredKey, 'TTL expired');
        }
        this.checkingSession = false;
    }

    private checkingUserSessionExpired() {
        const result = this.waitTtlTime(this.properties.SESSION_TTL);
        result.subscribe(() => {
            this.userInfoService.pingUserInfo().subscribe();
            this.cancelAndRestartCounter();
        });
    }

    private waitTtlTime(ttl: number) {
        const source = interval(ttl);
        return source.pipe(takeUntil(this.cancelInterval$));
    }

    private raiseAlert() {
        console.warn('TTL expired');
        this.expiredSession$.emit(true);
        this.cancelInterval$.next();
        this.userInfoService.removeUserInfo();
    }
}
