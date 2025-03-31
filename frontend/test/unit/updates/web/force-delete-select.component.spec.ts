import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertiesService } from '../../../../src/app/properties.service';
import { AlertsService } from '../../../../src/app/shared/alert/alerts.service';
import { WhoisMetaService } from '../../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../../src/app/shared/whois-resources.service';
import { ForceDeleteSelectComponent } from '../../../../src/app/updatesweb/forcedeleteselect/force-delete-select.component';

describe('ForceDeleteSelectComponent', () => {
    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<ForceDeleteSelectComponent>;
    let component: ForceDeleteSelectComponent;
    let routerMock: any;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        TestBed.configureTestingModule({
            declarations: [ForceDeleteSelectComponent],
            imports: [FormsModule],
            providers: [
                PropertiesService,
                AlertsService,
                WhoisMetaService,
                WhoisResourcesService,
                { provide: Router, useValue: routerMock },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(ForceDeleteSelectComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should navigate to force delete screen', () => {
        fixture.detectChanges();
        component.selected = {
            source: 'RIPE',
            objectType: 'inetnum',
            name: '127.0.0.1 - 127.0.0.10',
        };

        component.navigateToForceDelete();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith('forceDelete/RIPE/inetnum/127.0.0.1%20-%20127.0.0.10');
    });
});
