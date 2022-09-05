import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { CertificateBannerComponent } from '../../../src/app/banner/certificate-banner.component';
import { CoreModule } from '../../../src/app/core/core.module';
import { PropertiesService } from '../../../src/app/properties.service';
import { LookupComponent } from '../../../src/app/query/lookup.component';
import { ObjectTypesEnum } from '../../../src/app/query/object-types.enum';
import { QueryParametersService } from '../../../src/app/query/query-parameters.service';
import { QueryComponent } from '../../../src/app/query/query.component';
import { QueryService } from '../../../src/app/query/query.service';
import { TemplateComponent } from '../../../src/app/query/templatecomponent/template.component';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { IWhoisResponseModel } from '../../../src/app/shared/whois-response-type.model';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';
import { WhoisObjectViewerComponent } from '../../../src/app/whois-object/whois-object-viewer.component';

const whoisObjectModelMock = {
    type: 'inetnum',
    link: {
        type: 'locator',
        href: 'http://rest-prepdev.db.ripe.net/ripe/inetnum/88.208.87.32 - 88.208.87.39',
    },
    source: {
        id: 'ripe',
    },
    'primary-key': {
        attribute: [
            {
                name: 'inetnum',
                value: '88.208.87.32 - 88.208.87.39',
            },
        ],
    },
    attributes: {
        attribute: [
            {
                name: 'inetnum',
                value: '88.208.87.32 - 88.208.87.39',
            },
            {
                name: 'netname',
                value: 'SEVEn',
            },
            {
                name: 'descr',
                value: 'SEVEn, Stredisko pro efektivni vyuzivani energie, o.p.s.',
            },
            {
                name: 'country',
                value: 'CZ',
            },
            {
                link: {
                    type: 'locator',
                    href: 'http://rest-prepdev.db.ripe.net/ripe/person/MK6313-RIPE',
                },
                name: 'admin-c',
                value: 'MK6313-RIPE',
                'referenced-type': 'person',
            },
            {
                link: {
                    type: 'locator',
                    href: 'http://rest-prepdev.db.ripe.net/ripe/role/DIAL666-RIPE',
                },
                name: 'tech-c',
                value: 'DIAL666-RIPE',
                'referenced-type': 'role',
            },
            {
                name: 'status',
                value: 'ASSIGNED PA',
            },
            {
                link: {
                    type: 'locator',
                    href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/DIALTELECOM-MNT',
                },
                name: 'mnt-by',
                value: 'DIALTELECOM-MNT',
                'referenced-type': 'mntner',
            },
            {
                name: 'created',
                value: '2008-08-21T16:06:04Z',
            },
            {
                name: 'last-modified',
                value: '2011-06-07T07:17:34Z',
            },
            {
                name: 'source',
                value: 'RIPE',
            },
        ],
    },
    tags: {
        tag: [
            {
                id: 'RIPE-USER-RESOURCE',
            },
        ],
    },
    'resource-holder': {
        key: 'ORG-IA8-RIPE',
        name: 'Dial Telecom, a.s.',
    },
    'abuse-contact': {
        key: 'AR14411-RIPE',
        email: 'abuse@dialtelecom.cz',
        suspect: false,
        'org-id': 'ORG-IA8-RIPE',
    },
    managed: false,
};

const mockTemplateAutnum =
    'aut-num:        [mandatory]  [single]     [primary/lookup key]\n' +
    'as-name:        [mandatory]  [single]     [ ]\n' +
    'descr:          [optional]   [multiple]   [ ]\n' +
    'member-of:      [optional]   [multiple]   [inverse key]\n' +
    'import-via:     [optional]   [multiple]   [ ]\n' +
    'import:         [optional]   [multiple]   [ ]\n' +
    'mp-import:      [optional]   [multiple]   [ ]\n' +
    'export-via:     [optional]   [multiple]   [ ]\n' +
    'export:         [optional]   [multiple]   [ ]\n' +
    'mp-export:      [optional]   [multiple]   [ ]\n' +
    'default:        [optional]   [multiple]   [ ]\n' +
    'mp-default:     [optional]   [multiple]   [ ]\n' +
    'remarks:        [optional]   [multiple]   [ ]\n' +
    'org:            [optional]   [single]     [inverse key]\n' +
    'sponsoring-org: [optional]   [single]     [ ]\n' +
    'admin-c:        [mandatory]  [multiple]   [inverse key]\n' +
    'tech-c:         [mandatory]  [multiple]   [inverse key]\n' +
    'abuse-c:        [optional]   [single]     [inverse key]\n' +
    'status:         [generated]  [single]     [ ]\n' +
    'notify:         [optional]   [multiple]   [inverse key]\n' +
    'mnt-lower:      [optional]   [multiple]   [inverse key]\n' +
    'mnt-routes:     [optional]   [multiple]   [inverse key]\n' +
    'mnt-by:         [mandatory]  [multiple]   [inverse key]\n' +
    'created:        [generated]  [single]     [ ]\n' +
    'last-modified:  [generated]  [single]     [ ]\n' +
    'source:         [mandatory]  [single]     [ ]\n';

describe('QueryComponent', () => {
    let component: QueryComponent;
    let fixture: ComponentFixture<QueryComponent>;
    let queryServiceSpy: jasmine.SpyObj<QueryService>;
    let userInfoService: any;
    let whoisMetaService: WhoisMetaService;
    let queryParametersService: QueryParametersService;

    beforeEach(() => {
        queryServiceSpy = jasmine.createSpyObj('QueryService', [
            'searchWhoisObjects',
            'searchTemplate',
            'buildQueryStringForLink',
            'buildPermalink',
            'getTypesAppropriateToQuery',
            'getTypeOfSearchedTerm',
        ]);
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule, HttpClientTestingModule, RouterTestingModule.withRoutes([]), MatMenuModule],
            declarations: [QueryComponent, CertificateBannerComponent, LookupComponent, TemplateComponent, WhoisObjectViewerComponent],
            providers: [
                { provide: QueryService, useValue: queryServiceSpy },
                WhoisMetaService,
                QueryParametersService,
                PropertiesService,
                CookieService,
                {
                    provide: UserInfoService,
                    useValue: {
                        getUserOrgsAndRoles: () => of(),
                        isLogedIn: () => true,
                        getSelectedOrganisation: () => of(),
                        userLoggedIn$: of(),
                    },
                },
            ],
        });
        whoisMetaService = TestBed.inject(WhoisMetaService);
        queryParametersService = TestBed.inject(QueryParametersService);
        userInfoService = TestBed.inject(UserInfoService);

        expect(whoisMetaService).toBeDefined();
        expect(queryParametersService).toBeDefined();
        expect(userInfoService).toBeDefined();

        fixture = TestBed.createComponent(QueryComponent);
        component = fixture.componentInstance;
        spyOn(component.router, 'navigate');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should count types selected in dropdown', () => {
        component.init();
        fixture.detectChanges();
        expect(component.numberSelectedTypes).toEqual(0);
        component.qp.types = { DOMAIN: true, INETNUM: true, MNTNER: true };
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedTypes).toEqual(3);
        component.qp.types = { DOMAIN: true, INETNUM: false, MNTNER: true };
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedTypes).toEqual(2);
    });

    it('should count hierarchy flags selected in dropdown', () => {
        component.init();
        fixture.detectChanges();
        expect(component.numberSelectedHierarchyItems).toEqual(0);
        component.qp.hierarchy = 'l';
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedHierarchyItems).toEqual(1);
        component.qp.hierarchy = 'm';
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedHierarchyItems).toEqual(1);
        component.qp.hierarchy = 'x';
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedHierarchyItems).toEqual(1);
        component.qp.reverseDomain = true;
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedHierarchyItems).toEqual(2);
    });

    it('should disable hierarchy flags dropdown when search term is some ObjectTypesEnum which is not inetnum, inet6num, route, route6, domain, route, route6', () => {
        component.init();
        component.availableTypes = [ObjectTypesEnum.INETNUM];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeFalsy();
        component.availableTypes = [ObjectTypesEnum.INET6NUM];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeFalsy();
        component.availableTypes = [ObjectTypesEnum.ROUTE];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeFalsy();
        component.availableTypes = [ObjectTypesEnum.ROUTE6];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeFalsy();
        component.availableTypes = [ObjectTypesEnum.DOMAIN];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeFalsy();
        component.availableTypes = [ObjectTypesEnum.AS_BLOCK];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.AS_SET];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.AUT_NUM];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.FILTER_SET];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.INET_RTR];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.IRT];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.KEY_CERT];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.MNTNER];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.ORGANISATION];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.PEERING_SET];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.PEERING_SET];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.PERSON];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.POEM];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.POETIC_FORM];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.ROLE];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.ROUTE_SET];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
        component.availableTypes = [ObjectTypesEnum.RTR_SET];
        fixture.detectChanges();
        expect(component.isDisabledHierarchyDropdown()).toBeTruthy();
    });

    it('should enable all types, set all types from ObjectTypesEnum', () => {
        queryServiceSpy.getTypesAppropriateToQuery.and.returnValue(Object.values(ObjectTypesEnum));
        component.init();
        component.qp.queryText = '1.1.1.1';
        component.availableTypes = [ObjectTypesEnum.INETNUM];
        fixture.detectChanges();
        component.filterCheckboxes();
        expect(component.availableTypes.length).toEqual(21);
    });

    it('should count inverse selected in dropdown', () => {
        component.init();
        fixture.detectChanges();
        expect(component.numberSelectedInverseLookups).toEqual(0);
        component.qp.inverse = { ADMIN_C: true, AUTHOR: true, MNT_BY: true, ORG: true, TECH_C: true, ZONE_C: true };
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedInverseLookups).toEqual(6);
        component.qp.inverse = { ADMIN_C: false, AUTHOR: false, MNT_BY: false, ORG: true, TECH_C: false, ZONE_C: true };
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedInverseLookups).toEqual(2);
        component.qp.inverse = { ADMIN_C: false, AUTHOR: false, MNT_BY: false, ORG: false, TECH_C: false, ZONE_C: false };
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedInverseLookups).toEqual(0);
    });

    it('should count advanced filters in dropdown which are not selected by default', () => {
        component.init();
        fixture.detectChanges();
        expect(component.numberSelectedAdvanceFilterItems).toEqual(0);
        component.qp.showFullObjectDetails = true;
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedAdvanceFilterItems).toEqual(1);
        component.qp.doNotRetrieveRelatedObjects = false; //by default is true
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedAdvanceFilterItems).toEqual(2);
        component.qp.source = 'GRS';
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedAdvanceFilterItems).toEqual(3);
        component.qp.doNotRetrieveRelatedObjects = true; //by default is true
        fixture.detectChanges();
        component.isFilteringResults();
        expect(component.numberSelectedAdvanceFilterItems).toEqual(2);
    });

    it('should change count of selected item just after isFilteringResults() was called', () => {
        component.init();
        fixture.detectChanges();
        expect(component.numberSelectedTypes).toEqual(0);
        expect(component.numberSelectedHierarchyItems).toEqual(0);
        expect(component.numberSelectedInverseLookups).toEqual(0);
        expect(component.numberSelectedAdvanceFilterItems).toEqual(0);
        component.qp.types = { DOMAIN: true, INETNUM: true, MNTNER: true };
        component.qp.hierarchy = 'l';
        component.qp.inverse = { ADMIN_C: true, AUTHOR: true, MNT_BY: true, ORG: true, TECH_C: true, ZONE_C: true };
        component.qp.doNotRetrieveRelatedObjects = false; //by default is true
        expect(component.numberSelectedTypes).toEqual(0);
        expect(component.numberSelectedHierarchyItems).toEqual(0);
        expect(component.numberSelectedInverseLookups).toEqual(0);
        expect(component.numberSelectedAdvanceFilterItems).toEqual(0);
        component.isFilteringResults();
        expect(component.numberSelectedTypes).toEqual(3);
        expect(component.numberSelectedHierarchyItems).toEqual(1);
        expect(component.numberSelectedInverseLookups).toEqual(6);
        expect(component.numberSelectedAdvanceFilterItems).toEqual(1);
    });

    it('should return number as a string in brackets or empty string', () => {
        component.init();
        fixture.detectChanges();
        expect(component.printNumberSelected(0)).toEqual('');
        expect(component.printNumberSelected(1)).toEqual('(1)');
        expect(component.printNumberSelected(55)).toEqual('(55)');
    });

    it('should reset all checkboxes in filters - dropdowns, setting qp on default', () => {
        component.init();
        fixture.detectChanges();
        component.qp.types = { DOMAIN: true, INETNUM: true, MNTNER: true };
        component.qp.hierarchy = 'l';
        component.qp.inverse = { ADMIN_C: true, AUTHOR: true, MNT_BY: true, ORG: true, TECH_C: true, ZONE_C: true };
        component.qp.doNotRetrieveRelatedObjects = false; //by default is true
        component.uncheckAllCheckboxes();
        expect(component.qp.types).toEqual({});
        expect(component.qp.hierarchy).toBeUndefined();
        expect(component.qp.reverseDomain).toBeFalsy();
        expect(component.qp.inverse).toEqual({});
        expect(component.qp.showFullObjectDetails).toBeFalsy();
        expect(component.qp.doNotRetrieveRelatedObjects).toBeTruthy();
        expect(component.qp.source).toEqual('RIPE');
    });

    it('should toggle PermaLinks panel', () => {
        component.init();
        fixture.detectChanges();
        expect(component.showPermaLinks).toBeFalsy();
        component.togglePermaLinks();
        expect(component.showPermaLinks).toBeTruthy();
        component.togglePermaLinks();
        expect(component.showPermaLinks).toBeFalsy();
    });

    describe('with no query string', () => {
        it('should set up default options for querying', () => {
            component.init();
            fixture.detectChanges();
            expect(component.results.length).toEqual(0);
            expect(component.offset).toEqual(0);
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.source).toEqual('RIPE');
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
        });

        it('should show DocsLinks Panel and not to show Filters-dropdowns and Share button', () => {
            component.init();
            fixture.detectChanges();
            expect(component.results.length).toEqual(0);
            expect(component.showFilters).toBeFalsy();
            expect(component.showPermaLinks).toBeFalsy();
            expect(component.showNoResultsMsg).toBeFalsy();
            expect(component.showsDocsLink).toBeTruthy();
        });
    });

    describe('with a single search term', () => {
        const successResponse: IWhoisResponseModel = {
            objects: {
                //@ts-ignore
                object: [{}, {}, {}, {}],
            },
        };

        beforeEach(() => {
            queryServiceSpy.searchWhoisObjects.and.returnValue(of(successResponse));
        });

        it('should parse the options into the form', () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 ',
                    types: 'inetnum;inet6num',
                    inverse: '',
                    hierarchyFlag: 'exact',
                    rflag: 'false',
                    dflag: 'true',
                    bflag: '',
                    source: 'TEST',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };

            component.init();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual('193.0.0.0');
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(true);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({ INETNUM: true, INET6NUM: true });
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual('TEST');
            expect(component.results.length).toEqual(4);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });

        it('should handle an empty search string', () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: '',
                    types: 'inetnum;inet6num',
                    inverse: '',
                    hierarchyFlag: 'exact',
                    rflag: 'false',
                    dflag: '',
                    bflag: '',
                    source: 'TEST',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual('');
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({ INETNUM: true, INET6NUM: true });
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual('TEST');

            component.doSearch();
            expect(component.results.length).toEqual(0);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(0);
        });

        it('should handle empty params', () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 ',
                    types: '',
                    inverse: undefined,
                    hierarchyFlag: undefined,
                    bflag: 'true',
                    rflag: 'true',
                    dflag: 'false',
                    source: 'GRS',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual('193.0.0.0');
            expect(component.qp.showFullObjectDetails).toEqual(true);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual('GRS');
            expect(component.results.length).toEqual(4);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });

        it('should handle empty query parameters', () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 ',
                    types: '',
                    inverse: undefined,
                    hierarchyFlag: undefined,
                    bflag: '',
                    rflag: '',
                    dflag: '',
                    source: 'GRS',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual('193.0.0.0');
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            expect(component.qp.source).toEqual('GRS');
            expect(component.results.length).toEqual(4);
            component.lastResultOnScreen();
            expect(component.offset).toEqual(0);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });

        it('should display filters after search', () => {
            component.init();
            fixture.detectChanges();
            expect(component.isFiltersDisplayed()).toEqual(false);
            component.qp.queryText = '193.0.0.0';
            component.doSearch();
            expect(component.isFiltersDisplayed()).toEqual(true);
        });

        it("should show Filters-dropdowns and Share button, DocsLinks panel shouldn't be visible", () => {
            component.init();
            fixture.detectChanges();
            component.qp.queryText = '193.0.0.0';
            component.doSearch();
            expect(component.results.length).toEqual(4);
            expect(component.showFilters).toBeTruthy();
            expect(component.showPermaLinks).toBeFalsy();
            component.togglePermaLinks();
            expect(component.showPermaLinks).toBeTruthy();
            expect(component.showNoResultsMsg).toBeFalsy();
            expect(component.showsDocsLink).toBeFalsy();
        });
    });

    describe('during scrolling', () => {
        const successResponse = {
            objects: {
                object: [whoisObjectModelMock],
            },
        };

        beforeEach(() => {
            queryServiceSpy.searchWhoisObjects.and.returnValue(of(successResponse));
            queryServiceSpy.PAGE_SIZE = 20 as any;
        });

        it('should react to scroll events (async)', async () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 ',
                    types: 'inetnum;inet6num',
                    inverse: undefined,
                    hierarchyFlag: undefined,
                    bflag: '',
                    rflag: 'false',
                    dflag: 'true',
                    source: 'TEST',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            await fixture.whenStable();
            component.offset = 0;
            expect(component.results.length).toEqual(1);
            component.showScroller = true;
            component.lastResultOnScreen();
            expect(component.offset).toEqual(20);
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(2);
        });
    });

    describe('with a failed query', () => {
        const errorResponse = {
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: '%s,\nand thanks for all the %s',
                        args: [{ value: 'Goodbye' }, { value: 'fish' }],
                    },
                    {
                        severity: 'Error',
                        text: 'So %s, %s Road',
                        args: [{ value: 'Goodbye' }, { value: 'Yellow Brick' }],
                    },
                    {
                        severity: 'Error',
                        text: '%s%s',
                        args: [{ value: 'Goodbye' }, { value: ', cruel world!' }],
                    },
                    {
                        severity: 'Error',
                        text: 'Broken message',
                        args: [{ value: 'Goodbye' }],
                    },
                    {
                        severity: 'Error',
                        text: 'ERROR:101: no entries found No entries found in source RIPE.',
                        args: [{ value: 'ERROR:101: no entries found No entries found in source RIPE.' }],
                    },
                ],
            },
        };

        beforeEach(() => {
            queryServiceSpy.searchWhoisObjects.and.returnValue(throwError(errorResponse));
        });

        it('should show error messages', () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 ',
                    types: 'inetnum;inet6num',
                    inverse: 'mntner',
                    hierarchyFlag: 'one-less',
                    rflag: 'false',
                    dflag: 'true',
                    bflag: '',
                    source: 'TEST',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.queryText).toEqual('193.0.0.0');
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(true);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(component.qp.types).toEqual({ INETNUM: true, INET6NUM: true });
            expect(component.qp.inverse).toEqual({ MNTNER: true });
            expect(component.qp.source).toEqual('TEST');
            expect(component.isFiltersDisplayed()).toEqual(false);

            expect(component.alertsService.alerts.errors.length).toEqual(4);
            expect(component.formatError(component.alertsService.alerts.errors[0])).toEqual('Goodbye,\nand thanks for all the fish');
            expect(component.formatError(component.alertsService.alerts.errors[1])).toEqual('So Goodbye, Yellow Brick Road');
            expect(component.formatError(component.alertsService.alerts.errors[2])).toEqual('Goodbye, cruel world!');
            expect(component.formatError(component.alertsService.alerts.errors[3])).toEqual('Broken message');
            expect(queryServiceSpy.searchWhoisObjects).toHaveBeenCalledTimes(1);
        });

        it("should show 'No results..' message and hide ERROR:101", () => {
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 ',
                    types: 'inetnum;inet6num',
                    inverse: 'mntner',
                    hierarchyFlag: 'one-less',
                    rflag: 'false',
                    dflag: 'true',
                    bflag: '',
                    source: 'TEST',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            fixture.detectChanges();
            expect(component.alertsService.alerts.errors.length).toEqual(4);
            expect(component.showNoResultsMsg).toBeTruthy();
        });
    });

    describe('with a --template query', () => {
        it('should not show error or warning messages', () => {
            queryServiceSpy.searchTemplate.and.returnValue(of(mockTemplateAutnum));
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: ' 193.0.0.0 -t aut-num',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            fixture.detectChanges();
            expect(component.offset).toEqual(0);
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            component.doSearch();
            expect(component.alertsService.alerts.errors.length).toEqual(0);
            expect(component.showNoResultsMsg).toBeFalsy();
        });

        it('should show error messages', () => {
            queryServiceSpy.searchTemplate.and.returnValue(of(mockTemplateAutnum));
            // @ts-ignore
            component.activatedRoute.snapshot = {
                queryParamMap: convertToParamMap({
                    searchtext: 'blah blah --template zzz inetnum',
                    get: (param: string) => component.activatedRoute.snapshot.queryParamMap[param],
                    has: (param: string) => !!component.activatedRoute.snapshot.queryParamMap[param],
                }),
            };
            component.init();
            expect(component.offset).toEqual(0);
            expect(component.qp.showFullObjectDetails).toEqual(false);
            expect(component.qp.reverseDomain).toEqual(false);
            expect(component.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(component.qp.source).toEqual('RIPE');
            expect(component.qp.types).toEqual({});
            expect(component.qp.inverse).toEqual({});
            component.doSearch();
            expect(component.alertsService.alerts.errors.length).toEqual(1);
            expect(component.formatError(component.alertsService.alerts.errors[0])).toEqual('Unknown object type "zzz".');
            expect(component.showNoResultsMsg).toBeTruthy();
        });
    });
});
