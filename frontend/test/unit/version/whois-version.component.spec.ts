import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WhoisVersionComponent } from '../../../src/app/version/whois-version.component';

describe('WhoisVersionComponent', () => {
    let component: WhoisVersionComponent;
    let fixture: ComponentFixture<WhoisVersionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WhoisVersionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WhoisVersionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
