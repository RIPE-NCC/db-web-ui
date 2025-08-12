import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PromoBannerComponent } from 'src/app/banner/promo-banner/promo-banner.component';

describe('PromoBannerComponent', () => {
    let component: PromoBannerComponent;
    let fixture: ComponentFixture<PromoBannerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PromoBannerComponent], // standalone component
        }).compileComponents();

        fixture = TestBed.createComponent(PromoBannerComponent);
        component = fixture.componentInstance;

        // Default test data
        component.id = 'test-banner';
        component.title = 'Test Title';
        component.textContent = 'Test content';
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set closed = true if localStorage has "closed"', () => {
        localStorage.setItem('test-banner', 'closed');
        component.ngOnInit();
        expect(component.closed).toBeTrue();
    });

    it('should set closed = false if localStorage does not have "closed"', () => {
        localStorage.removeItem('test-banner');
        component.ngOnInit();
        expect(component.closed).toBeFalse();
    });

    it('should render banner if closed = false', () => {
        component.closed = false;
        fixture.detectChanges();
        const bannerEl = fixture.debugElement.query(By.css('.promo-banner'));
        expect(bannerEl).toBeTruthy();
    });

    it('should not render banner if closed = true', () => {
        localStorage.setItem('test-banner', 'closed'); // so ngOnInit() sets closed = true
        fixture.detectChanges();
        const bannerEl = fixture.debugElement.query(By.css('.promo-banner'));
        expect(bannerEl).toBeFalsy();
    });

    it('should remove banner element and update localStorage on closeBanner()', () => {
        const element = document.createElement('div');
        element.className = 'promo-banner';
        document.body.appendChild(element);

        component.id = 'test-banner';

        component.closeBanner();

        expect(document.getElementsByClassName('promo-banner').length).toBe(0);
        expect(localStorage.getItem('test-banner')).toBe('closed');
    });

    it('should call closeBanner when Dismiss button clicked', () => {
        spyOn(component, 'closeBanner');
        component.closed = false;
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('button'));
        button.triggerEventHandler('click', null);

        expect(component.closeBanner).toHaveBeenCalled();
    });
});
