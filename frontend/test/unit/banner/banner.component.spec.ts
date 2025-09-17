import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent, BannerTypes } from 'src/app/banner/banner.component';

describe('BannerComponent', () => {
    let component: BannerComponent;
    let fixture: ComponentFixture<BannerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BannerComponent], // standalone component
        }).compileComponents();

        fixture = TestBed.createComponent(BannerComponent);
        component = fixture.componentInstance;

        // set required inputs
        component.id = 'banner-1';
        component.type = BannerTypes.promo;
        component.textContent = 'Test banner message';
    });

    afterEach(() => {
        localStorage.clear();
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
});
