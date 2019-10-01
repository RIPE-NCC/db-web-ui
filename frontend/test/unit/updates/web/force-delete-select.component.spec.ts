import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {ForceDeleteSelectComponent} from "../../../../app/ng/updates/web/forcedeleteselect/force-delete-select.component";
import {PropertiesService} from "../../../../app/ng/properties.service";
import {AlertsService} from "../../../../app/ng/shared/alert/alerts.service";
import {AlertsComponent} from "../../../../app/ng/shared/alert/alerts.component";

describe('ForceDeleteSelectComponent', function () {

    let httpMock: HttpTestingController;
    let fixture: ComponentFixture<ForceDeleteSelectComponent>;
    let component: ForceDeleteSelectComponent;
    let routerMock: any;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [ForceDeleteSelectComponent, AlertsComponent],
            providers: [
                PropertiesService,
                AlertsService,
                {provide: Router, useValue: routerMock},
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(ForceDeleteSelectComponent);
        component = fixture.componentInstance;
    });

    afterEach(function() {
        httpMock.verify();
    });

    it('should navigate to force delete screen', function () {
        fixture.detectChanges();
        component.selected = {
            source: 'RIPE',
            objectType: 'inetnum',
            name: '127.0.0.1 - 127.0.0.10'
        };

        component.navigateToForceDelete();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith("forceDelete/RIPE/inetnum/127.0.0.1%20-%20127.0.0.10");
    });

});

