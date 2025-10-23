import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PropertiesService } from '../../../src/app/properties.service';
import { WebAppVersionComponent } from '../../../src/app/version/web-app-version.component';

describe('WebAppVersionComponent', () => {
    let component: WebAppVersionComponent;
    let fixture: ComponentFixture<WebAppVersionComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [WebAppVersionComponent],
            providers: [{ provide: PropertiesService, useValue: { DB_WEB_UI_BUILD_TIME: '2020-01-22T18:22:13Z', isTrainingEnv: () => {} } }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WebAppVersionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
