import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LandingPageComponent } from 'src/app/myresources/landing-page/landing-page.component';
import { SessionService } from 'src/app/sessioninfo/session.service';
import { UserInfoService } from 'src/app/userinfo/user-info.service';
import { ResourcesComponent } from '../../../src/app/myresources/resources.component';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;
    let fixture: ComponentFixture<LandingPageComponent>;

    let mockUserInfoService: jasmine.SpyObj<UserInfoService>;
    let mockSessionService: {
        expiredSession$: Subject<boolean>;
    };

    beforeEach(async () => {
        mockUserInfoService = jasmine.createSpyObj('UserInfoService', ['isLoggedIn']);
        mockSessionService = {
            expiredSession$: new Subject<boolean>(),
        };

        await TestBed.configureTestingModule({
            imports: [LandingPageComponent],
            providers: [
                { provide: UserInfoService, useValue: mockUserInfoService },
                { provide: SessionService, useValue: mockSessionService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .overrideComponent(LandingPageComponent, {
                remove: { imports: [ResourcesComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(LandingPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set loggedIn = false when session is expired', () => {
        component.ngOnInit();
        mockSessionService.expiredSession$.next(true);

        expect(component.loggedIn).toBeFalse();
    });

    it('should render resource-component when loggedIn is true', () => {
        mockUserInfoService.isLoggedIn.and.returnValue(true);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('resource-component')).toBeTruthy();
    });

    it('should render ripe-unified-landing-page when loggedIn is false', () => {
        mockUserInfoService.isLoggedIn.and.returnValue(false);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('ripe-unified-landing-page')).toBeTruthy();
    });
});
