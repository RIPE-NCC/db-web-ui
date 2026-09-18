import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LandingPageComponent } from 'src/app/myresources/landing-page/landing-page.component';
import { ResourcesComponent } from 'src/app/myresources/resources.component';
import { UserInfoService } from 'src/app/userinfo/user-info.service';
import { mockUserInfo } from '../userinfo/user-info.service.spec';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;
    let fixture: ComponentFixture<LandingPageComponent>;

    let mockUserInfoService: jasmine.SpyObj<UserInfoService>;

    beforeEach(async () => {
        mockUserInfoService = jasmine.createSpyObj('UserInfoService', ['getUserOrgsAndRoles']);

        mockUserInfoService.getUserOrgsAndRoles.and.returnValue(of(mockUserInfo));

        await TestBed.configureTestingModule({
            imports: [LandingPageComponent],
            providers: [{ provide: UserInfoService, useValue: mockUserInfoService }],
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

    it('should render resource-component when loggedIn is true', () => {
        mockUserInfoService.getUserOrgsAndRoles.and.returnValue(of(mockUserInfo));
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('resource-component')).toBeTruthy();
    });

    it('should render ripe-unified-landing-page when loggedIn is false', () => {
        mockUserInfoService.getUserOrgsAndRoles.and.returnValue(throwError(() => 403));
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('ripe-unified-landing-page')).toBeTruthy();
    });
});
