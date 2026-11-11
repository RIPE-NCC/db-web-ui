import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from 'src/app/myresources/landing-page/landing-page.component';
import { ResourcesComponent } from 'src/app/myresources/resources.component';
import { UserInfoService } from 'src/app/userinfo/user-info.service';
import type { MockedObject } from 'vitest';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;
    let fixture: ComponentFixture<LandingPageComponent>;

    let mockUserInfoService: MockedObject<UserInfoService>;

    beforeEach(async () => {
        mockUserInfoService = {
            isLoggedIn: vi.fn().mockName('UserInfoService.isLoggedIn'),
        } as any;

        // mockUserInfoService.getUserOrgsAndRoles.and.returnValue(of(mockUserInfo));

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
        mockUserInfoService.isLoggedIn.mockReturnValue(true);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('resource-component')).toBeTruthy();
    });

    it('should render ripe-unified-landing-page when loggedIn is false', () => {
        mockUserInfoService.isLoggedIn.mockReturnValue(false);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('ripe-unified-landing-page')).toBeTruthy();
    });
});
