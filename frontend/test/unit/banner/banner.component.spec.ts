import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BannerComponent, BannerTypes } from 'src/app/banner/banner.component';
import { PropertiesService } from '../../../src/app/properties.service';

describe('BannerComponent', () => {
    let component: BannerComponent;
    let fixture: ComponentFixture<BannerComponent>;
    let router: Router;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [BannerComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                {
                    provide: PropertiesService,
                    useValue: { LOGIN_URL: 'https://access.prepdev.ripe.net/' },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BannerComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);

        component.id = 'banner-1';
        component.type = BannerTypes.promo;
        component.textContent = 'Test banner message';
    });

    afterEach(() => {
        localStorage.clear();
        jasmine.clock().uninstall?.();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should mark banner as closed if persistDismiss is true and localStorage has "closed"', () => {
            localStorage.setItem('banner-1', 'closed');
            component.persistDismiss = true;

            component.ngOnInit();

            expect(component.closed).toBeTrue();
        });

        it('should not mark banner as closed if persistDismiss is true but no flag in localStorage', () => {
            component.persistDismiss = true;

            component.ngOnInit();

            expect(component.closed).toBeFalse();
        });

        it('should leave closed undefined if persistDismiss is false', () => {
            component.persistDismiss = false;

            component.ngOnInit();

            expect(component.closed).toBeUndefined();
        });
    });

    describe('closeBanner', () => {
        it('should set closed to true', () => {
            component.closed = false;

            component.closeBanner();

            expect(component.closed).toBeTrue();
        });

        it('should persist dismiss in localStorage if persistDismiss is true', () => {
            component.persistDismiss = true;

            component.closeBanner();

            expect(localStorage.getItem('banner-1')).toBe('closed');
        });

        it('should not touch localStorage if persistDismiss is false', () => {
            component.persistDismiss = false;

            component.closeBanner();

            expect(localStorage.getItem('banner-1')).toBeNull();
        });
    });

    describe('navigateToButtonUrl', () => {
        beforeEach(() => {
            spyOn(window, 'open');
        });

        it('should do nothing if buttonUrl is not set', () => {
            component.buttonUrl = undefined;

            component.navigateToButtonUrl();

            expect(window.open).not.toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should open external URLs in new tab', () => {
            component.buttonUrl = 'https://example.com';

            component.navigateToButtonUrl();

            expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should navigate internal URLs using router', () => {
            component.buttonUrl = '/internal-route';

            component.navigateToButtonUrl();

            expect(router.navigate).toHaveBeenCalledWith(['/internal-route']);
            expect(window.open).not.toHaveBeenCalled();
        });
    });
});
