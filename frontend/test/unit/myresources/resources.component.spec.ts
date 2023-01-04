import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from '../../../src/app/core/core.module';
import { ResourcesDataService } from '../../../src/app/myresources/resources-data.service';
import { ResourcesComponent } from '../../../src/app/myresources/resources.component';
import { PropertiesService } from '../../../src/app/properties.service';
import { ObjectTypesEnum } from '../../../src/app/query/object-types.enum';
import { AlertsService } from '../../../src/app/shared/alert/alerts.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';

describe('ResourcesComponent', () => {
    let component: ResourcesComponent;
    let fixture: ComponentFixture<ResourcesComponent>;
    let userInfoService: any;

    beforeEach(() => {
        userInfoService = jasmine.createSpyObj('UserInfoService', ['getUserOrgsAndRoles', 'getSelectedOrganisation']);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule, RouterTestingModule],
            declarations: [ResourcesComponent],
            providers: [ResourcesDataService, { provide: UserInfoService, useValue: userInfoService }, AlertsService, WhoisResourcesService, PropertiesService],
        });
    });

    it('should create', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            type: 'inetnum',
            sponsored: 'false',
            ipanalyserRedirect: false,
        };
        fixture = TestBed.createComponent(ResourcesComponent);
        component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should set lastTab - selected tab to INETNUM by default', () => {
        TestBed.inject(ActivatedRoute);
        fixture = TestBed.createComponent(ResourcesComponent);
        component = fixture.componentInstance;
        expect(component.lastTab).toEqual(ObjectTypesEnum.INETNUM);
    });

    it('should set lastTab - selected tab to AUTNUM reading from url', () => {
        TestBed.inject(ActivatedRoute).snapshot.queryParams = {
            type: 'aut-num',
            sponsored: 'false',
            ipanalyserRedirect: false,
        };
        fixture = TestBed.createComponent(ResourcesComponent);
        component = fixture.componentInstance;
        expect(component.lastTab).toEqual(ObjectTypesEnum.AUT_NUM);
    });
});
