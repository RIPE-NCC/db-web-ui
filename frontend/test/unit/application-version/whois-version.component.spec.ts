import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhoisVersionComponent } from 'src/app/application-version/whois-version.component';

describe('WhoisVersionComponent', () => {
    let component: WhoisVersionComponent;
    let fixture: ComponentFixture<WhoisVersionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WhoisVersionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WhoisVersionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
