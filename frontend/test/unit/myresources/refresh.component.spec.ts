import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RefreshComponent } from '../../../src/app/myresources/refresh/refresh.component';

describe('RefreshComponent', () => {
    let component: RefreshComponent;
    let fixture: ComponentFixture<RefreshComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RefreshComponent],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RefreshComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
