import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import {
    AssociatedObjectsService,
    AssociatedObjectType,
    IAssociatedDomainObject,
    IAssociatedObjectApiResult,
    IAssociatedRouteObject,
} from 'src/app/myresources/associatedobjects/associated-objects.service';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { Announcement } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { NodePreviewComponent } from 'src/app/myresources/tree/node-preview.component';
import { TreeNode } from 'src/app/myresources/tree/tree.component';
import { PropertiesService } from 'src/app/properties.service';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { RpkiValidatorService } from 'src/app/updatesweb/rpki-validator.service';

describe('NodePreviewComponent', () => {
    let component: NodePreviewComponent;
    let fixture: ComponentFixture<NodePreviewComponent>;

    let mockActivatedRoute: ActivatedRoute;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockPropertiesService: jasmine.SpyObj<PropertiesService>;
    let mockResourcesDataService: jasmine.SpyObj<ResourcesDataService>;
    let mockAssociatedObjectService: jasmine.SpyObj<AssociatedObjectsService>;
    let mockNodeHealthService: jasmine.SpyObj<NodeHealthService>;
    let mockRpkiValidatorService: jasmine.SpyObj<RpkiValidatorService>;

    const createNode = (overrides: Partial<TreeNode> = {}): TreeNode =>
        ({
            parentResource: undefined,
            resource: {
                type: 'inetnum',
                status: 'ALLOCATED',
                resource: '192.168.0.0/24',
                usage: {
                    used: 50,
                    total: 100,
                    blockSize: 1,
                },
            },
            nodeName: '192.168.0.0/24',
            netname: 'TEST-NET',
            type: ObjectTypesEnum.INETNUM,
            level: 0,
            expandable: false,
            children: [],
            allChildren: [],
            numberOfChildren: 2,
            showAllChildren: false,
            isShowMore: false,
            remaining: 0,
            showMoreParent: undefined,
            isLoading: signal(false),
            resourceCheckStatus: signal([]),
            healthStatus: signal(undefined),
            announcementStatus: signal(undefined),
            issuesCount: signal(0),
            issuesCountOfChildren: signal(0),
            ...overrides,
        } as unknown as TreeNode);

    const createResource = (used = 50, total = 100) =>
        ({
            type: 'inetnum',
            status: 'ALLOCATED',
            usage: {
                used,
                total,
                blockSize: 1,
            },
        } as TreeNode['resource']);

    const emptyAssociatedObjects: IAssociatedObjectApiResult = {
        associatedObjects: [],
        totalNumberOfResources: 0,
        filteredSize: 0,
    };

    beforeEach(async () => {
        mockActivatedRoute = {
            snapshot: {} as ActivatedRoute['snapshot'],
        } as ActivatedRoute;

        mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
        mockPropertiesService = jasmine.createSpyObj('PropertiesService', [], { SOURCE: 'RIPE' });

        mockResourcesDataService = jasmine.createSpyObj('ResourcesDataService', ['checkAnnouncements']);
        mockResourcesDataService.checkAnnouncements.and.returnValue(of([]));

        mockAssociatedObjectService = jasmine.createSpyObj('AssociatedObjectsService', ['getAssociatedObjects']);
        mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(emptyAssociatedObjects));

        mockNodeHealthService = jasmine.createSpyObj('NodeHealthService', ['checkRouteAnnouncementStatus']);
        mockNodeHealthService.checkRouteAnnouncementStatus.and.returnValue(of('Announced'));

        mockRpkiValidatorService = jasmine.createSpyObj('RpkiValidatorService', ['getRoas']);
        mockRpkiValidatorService.getRoas.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [NodePreviewComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: mockActivatedRoute,
                },
                { provide: Router, useValue: mockRouter },
                { provide: PropertiesService, useValue: mockPropertiesService },
                { provide: ResourcesDataService, useValue: mockResourcesDataService },
                { provide: AssociatedObjectsService, useValue: mockAssociatedObjectService },
                { provide: NodeHealthService, useValue: mockNodeHealthService },
                { provide: RpkiValidatorService, useValue: mockRpkiValidatorService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NodePreviewComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('node', createNode());
        fixture.componentRef.setInput('tabType', ObjectTypesEnum.INETNUM);
        fixture.detectChanges();
    });

    describe('usedPercentage', () => {
        it('should return percentage of used resources', () => {
            fixture.componentRef.setInput('node', createNode({ resource: createResource(25, 100) }));
            expect(component.usedPercentage()).toBe(25);
        });

        it('should round the percentage', () => {
            fixture.componentRef.setInput('node', createNode({ resource: createResource(1, 3) }));
            expect(component.usedPercentage()).toBe(33);
        });

        it('should return 0 when there is no usage', () => {
            fixture.componentRef.setInput('node', createNode({ resource: { type: 'inetnum', status: 'ALLOCATED' } as TreeNode['resource'] }));
            expect(component.usedPercentage()).toBe(0);
        });

        it('should return 0 when total usage is zero', () => {
            fixture.componentRef.setInput('node', createNode({ resource: createResource(0, 0) }));
            expect(component.usedPercentage()).toBe(0);
        });
    });

    describe('checkIfAssociatedRouteObjects', () => {
        const mockRouteObject: IAssociatedObjectApiResult = {
            associatedObjects: [
                {
                    associatedObjectType: 'associated-route',
                    associatedResource: '192.168.0.0 - 192.168.0.255',
                    associatedResourceType: 'inetnum',
                    origin: 'AS12345',
                    prefix: '192.168.0.0/24',
                    type: 'route',
                } as IAssociatedRouteObject,
            ],
            totalNumberOfResources: 1,
            filteredSize: 1,
        };

        it('should set checking state while checking', () => {
            const response$ = new Subject<IAssociatedObjectApiResult>();
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(response$);

            component.checkIfAssociatedRouteObjects(createNode());

            expect(component.checkingDatabaseObjects()).toBeTrue();
            response$.next({ ...mockRouteObject, associatedObjects: [] });
            response$.complete();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set route objects with announcement status when response is not empty', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(mockRouteObject));
            mockNodeHealthService.checkRouteAnnouncementStatus.and.returnValue(of('Announced'));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(mockAssociatedObjectService.getAssociatedObjects).toHaveBeenCalledWith(
                AssociatedObjectType.ASSOCIATED_ROUTE,
                '192.168.0.0/24',
                'inetnum',
                0,
                '',
            );
            expect(mockNodeHealthService.checkRouteAnnouncementStatus).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 'AS12345');
            expect(component.associatedRouteObjects()).toEqual([
                {
                    ...(mockRouteObject.associatedObjects[0] as IAssociatedRouteObject),
                    announcementStatus: 'Announced',
                },
            ]);
            expect(component.associatedRouteObjectsCheckFailed()).toBeFalse();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set an empty array when there are no route objects', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(emptyAssociatedObjects));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(component.associatedRouteObjects()).toEqual([]);
            expect(component.associatedRouteObjectsCheckFailed()).toBeFalse();
            expect(mockNodeHealthService.checkRouteAnnouncementStatus).not.toHaveBeenCalled();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should mark an individual route as check failed when its announcement check fails', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(mockRouteObject));
            mockNodeHealthService.checkRouteAnnouncementStatus.and.returnValue(throwError(() => new Error('Request failed')));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(component.associatedRouteObjects()).toEqual([
                {
                    ...(mockRouteObject.associatedObjects[0] as IAssociatedRouteObject),
                    announcementStatus: 'check failed',
                },
            ]);
            expect(component.associatedRouteObjectsCheckFailed()).toBeFalse();
        });

        it('should set check failed when retrieving route objects fails', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(throwError(() => new Error('Request failed')));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(component.associatedRouteObjectsCheckFailed()).toBeTrue();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });
    });

    describe('checkIfAssociatedDomainObjects', () => {
        const mockDomainObjects: IAssociatedObjectApiResult = {
            associatedObjects: [
                {
                    associatedObjectType: 'associated-domain',
                    associatedResource: '192.168.0.0 - 192.168.0.255',
                    associatedResourceType: 'inetnum',
                    domain: '0.168.192.in-addr.arpa',
                    type: 'domain',
                } as IAssociatedDomainObject,
            ],
            totalNumberOfResources: 1,
            filteredSize: 1,
        };

        it('should set checking state while checking', () => {
            const response$ = new Subject<IAssociatedObjectApiResult>();
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(response$);

            component.checkIfAssociatedDomainObjects(createNode());

            expect(component.checkingDatabaseObjects()).toBeTrue();
            response$.next(mockDomainObjects);
            response$.complete();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set domain objects when response is not empty', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(mockDomainObjects));

            component.checkIfAssociatedDomainObjects(createNode());

            expect(mockAssociatedObjectService.getAssociatedObjects).toHaveBeenCalledWith(
                AssociatedObjectType.ASSOCIATED_DOMAIN,
                '192.168.0.0/24',
                'inetnum',
                0,
                '',
            );
            expect(component.associatedDomainObjects()).toBe(mockDomainObjects.associatedObjects as IAssociatedDomainObject[]);
            expect(component.associatedDomainObjectsCheckFailed()).toBeFalse();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set an empty array when there are no domain objects', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(emptyAssociatedObjects));

            component.checkIfAssociatedDomainObjects(createNode());

            expect(component.associatedDomainObjects()).toEqual([]);
            expect(component.associatedDomainObjectsCheckFailed()).toBeFalse();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set check failed when retrieving domain objects fails', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(throwError(() => new Error('Request failed')));

            component.checkIfAssociatedDomainObjects(createNode());

            expect(component.associatedDomainObjectsCheckFailed()).toBeTrue();
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });
    });

    describe('checkOriginAsns', () => {
        it('should set unique origin ASNs', () => {
            const announcements = [
                { prefix: '192.0.2.0/24', origin: '12345', peers: 11 },
                { prefix: '192.0.2.0/24', origin: '23456', peers: 11 },
                { prefix: '192.0.2.0/24', origin: '12345', peers: 11 },
            ] as Announcement[];
            mockResourcesDataService.checkAnnouncements.and.returnValue(of(announcements));

            component.checkOriginAsns(createNode());

            expect(component.originASNs()).toEqual(['AS12345', 'AS23456']);
        });
    });

    describe('checkIfHaveRoas', () => {
        it('should set Present when ROAs exist', () => {
            mockRpkiValidatorService.getRoas.and.returnValue(of(['192.168.0.0/24AS12345']));
            component.checkIfHaveRoas(createNode());
            expect(component.hasRoas()).toBe('Present');
        });

        it('should set a dash when no ROAs exist', () => {
            mockRpkiValidatorService.getRoas.and.returnValue(of([]));
            component.checkIfHaveRoas(createNode());
            expect(component.hasRoas()).toBe('—');
        });

        it('should set check failed when the ROA request fails', () => {
            mockRpkiValidatorService.getRoas.and.returnValue(throwError(() => new Error('Request failed')));
            component.checkIfHaveRoas(createNode());
            expect(component.hasRoas()).toBe('check failed');
        });
    });

    describe('effect', () => {
        it('should check services when node type matches tab type', () => {
            mockAssociatedObjectService.getAssociatedObjects.calls.reset();
            mockRpkiValidatorService.getRoas.calls.reset();
            mockResourcesDataService.checkAnnouncements.calls.reset();

            fixture.componentRef.setInput('node', createNode());
            fixture.componentRef.setInput('tabType', ObjectTypesEnum.INETNUM);
            fixture.detectChanges();

            expect(mockAssociatedObjectService.getAssociatedObjects).toHaveBeenCalledWith(
                AssociatedObjectType.ASSOCIATED_ROUTE,
                '192.168.0.0/24',
                'inetnum',
                0,
                '',
            );
            expect(mockAssociatedObjectService.getAssociatedObjects).toHaveBeenCalledWith(
                AssociatedObjectType.ASSOCIATED_DOMAIN,
                '192.168.0.0/24',
                'inetnum',
                0,
                '',
            );
            expect(mockRpkiValidatorService.getRoas).toHaveBeenCalledWith('inetnum', '192.168.0.0/24');
            expect(mockResourcesDataService.checkAnnouncements).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');
        });

        it('should not check services when node type does not match tab type', () => {
            mockAssociatedObjectService.getAssociatedObjects.calls.reset();
            mockRpkiValidatorService.getRoas.calls.reset();
            mockResourcesDataService.checkAnnouncements.calls.reset();

            fixture.componentRef.setInput('node', createNode());
            fixture.componentRef.setInput('tabType', ObjectTypesEnum.INET6NUM);
            fixture.detectChanges();

            expect(mockAssociatedObjectService.getAssociatedObjects).not.toHaveBeenCalled();
            expect(mockRpkiValidatorService.getRoas).not.toHaveBeenCalled();
            expect(mockResourcesDataService.checkAnnouncements).not.toHaveBeenCalled();
        });
    });

    describe('navigateToDetailPage', () => {
        it('should navigate to resource details', () => {
            component.navigateToDetailPage();
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/myresources/detail/inetnum/192.168.0.0/24/false');
        });
    });

    describe('navigateToCreateAssignments', () => {
        it('should navigate to create assignments', () => {
            component.navigateToCreateAssignments();
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/webupdates/create/RIPE/inetnum');
        });
    });

    describe('template', () => {
        it('should show no resources selected when node is undefined', () => {
            fixture.componentRef.setInput('node', undefined);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.no-resources-panel')).toBeTruthy();
            expect(compiled.textContent).toContain('No resources selected');
        });

        it('should show node details when node is selected', () => {
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.preview')).toBeTruthy();
            expect(compiled.textContent).toContain('TEST-NET');
            expect(compiled.textContent).toContain('Parent: —');
        });

        it('should display usage percentage', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.textContent).toContain('50%');
        });

        it('should display number of children', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.textContent).toContain('2');
        });
    });
});
