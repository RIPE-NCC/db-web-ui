import { EventEmitter, Injectable } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { PropertiesService } from '../properties.service';
import { UserInfoService } from '../userinfo/user-info.service';

@Injectable()
export class SessionInfoService {
    public cancelInterval$ = new Subject<void>();
    public sessionExpire$ = new EventEmitter<boolean>();
    public checkingSession: boolean;

    constructor(private properties: PropertiesService, private userInfoService: UserInfoService) {}

    public refreshSession() {
        this.checkingSession = true;
        this.cancelInterval$.next();
        this.checkingUserSessionExpired();
    }

    public authenticationFailure() {
        this.userInfoService.removeUserInfo();
        if (this.checkingSession) {
            this.raiseAlert();
        }
    }

    private checkingUserSessionExpired() {
        const result = this.waitTtlTime(this.properties.SESSION_TTL);
        result.subscribe(() => {
            this.userInfoService.pingUserInfo().subscribe();
        });
    }

    private waitTtlTime(ttl: number) {
        const source = interval(ttl);
        return source.pipe(takeUntil(this.cancelInterval$));
    }

    private raiseAlert() {
        console.warn('TTL expired');
        this.checkingSession = false;
        this.sessionExpire$.emit(true);
        this.cancelInterval$.next();
    }
}
