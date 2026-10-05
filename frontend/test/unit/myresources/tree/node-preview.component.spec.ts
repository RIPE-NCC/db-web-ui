import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { signal } from '@angular/core';
import {
    AssociatedObjectsService,
    AssociatedObjectType,
    IAssociatedDomainObject,
    IAssociatedObjectApiResult,
    IAssociatedRouteObject,
} from 'src/app/myresources/associatedobjects/associated-objects.service';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { NodePreviewComponent } from 'src/app/myresources/tree/node-preview.component';
import { TreeNode } from 'src/app/myresources/tree/tree.component';
import { PropertiesService } from 'src/app/properties.service';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';

describe('NodePreviewComponent', () => {
    let component: NodePreviewComponent;
    let fixture: ComponentFixture<NodePreviewComponent>;

    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: ActivatedRoute;
    let mockPropertiesService: jasmine.SpyObj<PropertiesService>;
    let mockResourcesDataService: jasmine.SpyObj<ResourcesDataService>;
    let mockAssociatedObjectService: jasmine.SpyObj<AssociatedObjectsService>;

    const createNode = (overrides: Partial<TreeNode> = {}): TreeNode =>
        ({
            parentResource: undefined,
            resource: {
                type: 'inetnum',
                status: 'ALLOCATED',
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

            ...overrides,
        } as TreeNode);

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

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
        mockActivatedRoute = {
            snapshot: {} as ActivatedRoute['snapshot'],
        } as ActivatedRoute;

        mockPropertiesService = jasmine.createSpyObj('mockPropertiesService', [], { SOURCE: 'RIPE' });

        mockResourcesDataService = jasmine.createSpyObj('ResourcesDataService', ['resourceCheck']);
        mockResourcesDataService.resourceCheck.and.returnValue(of([]));

        mockAssociatedObjectService = jasmine.createSpyObj('AssociatedObjectsService', ['getAssociatedObjects']);
        mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of());

        await TestBed.configureTestingModule({
            imports: [NodePreviewComponent],
            providers: [
                {
                    provide: Router,
                    useValue: mockRouter,
                },
                {
                    provide: ActivatedRoute,
                    useValue: mockActivatedRoute,
                },
                {
                    provide: PropertiesService,
                    useValue: mockPropertiesService,
                },
                {
                    provide: ResourcesDataService,
                    useValue: mockResourcesDataService,
                },
                {
                    provide: AssociatedObjectsService,
                    useValue: mockAssociatedObjectService,
                },
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
            const node = createNode({
                resource: createResource(25, 100),
            });

            fixture.componentRef.setInput('node', node);

            expect(component.usedPercentage()).toBe(25);
        });

        it('should round the percentage', () => {
            const node = createNode({
                resource: createResource(1, 3),
            });

            fixture.componentRef.setInput('node', node);

            expect(component.usedPercentage()).toBe(33);
        });

        it('should return 0 when there is no usage', () => {
            const node = createNode({
                resource: {
                    type: 'inetnum',
                    status: 'ALLOCATED',
                } as TreeNode['resource'],
            });

            fixture.componentRef.setInput('node', node);

            expect(component.usedPercentage()).toBe(0);
        });

        it('should return 0 when total usage is zero', () => {
            const node = createNode({
                resource: createResource(0, 0),
            });

            fixture.componentRef.setInput('node', node);

            expect(component.usedPercentage()).toBe(0);
        });
    });

    describe('checkIfAnnounced', () => {
        it('should set checking state while checking', () => {
            const response$ = new Subject<ResourceCheck[]>();

            mockResourcesDataService.resourceCheck.and.returnValue(response$);

            component.checkIfAnnounced(createNode());

            expect(component.checkingRoutingInformation()).toBeTrue();

            response$.next([]);
            response$.complete();

            expect(component.checkingRoutingInformation()).toBeFalse();
        });

        it('should set announcement status to Announced when response is empty', () => {
            mockResourcesDataService.resourceCheck.and.returnValue(of([]));

            component.checkIfAnnounced(createNode());

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');

            expect(component.announcementStatus()).toBe('Announced');
            expect(component.checkingRoutingInformation()).toBeFalse();
        });

        it('should set announcement status to response type when response contains a result', () => {
            const response = [
                {
                    type: 'Not announced',
                },
            ] as ResourceCheck[];

            mockResourcesDataService.resourceCheck.and.returnValue(of(response));

            component.checkIfAnnounced(createNode());

            expect(component.announcementStatus()).toBe('Not announced');
            expect(component.checkingRoutingInformation()).toBeFalse();
        });

        it('should set announcement status to check failed when request fails', () => {
            mockResourcesDataService.resourceCheck.and.returnValue(throwError(() => new Error('Request failed')));

            component.checkIfAnnounced(createNode());

            expect(component.announcementStatus()).toBe('check failed');
            expect(component.checkingRoutingInformation()).toBeFalse();
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

            response$.next(mockRouteObject);
            response$.complete();

            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set route status to Present when response is not empty', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(mockRouteObject));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(mockAssociatedObjectService.getAssociatedObjects).toHaveBeenCalledWith(
                AssociatedObjectType.ASSOCIATED_ROUTE,
                '192.168.0.0/24',
                'inetnum',
                0,
                '',
            );

            expect(component.associatedRouteObjects()).toBe('Present');
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set route status to response type when response is empty', () => {
            const response = {
                associatedObjects: [],
                totalNumberOfResources: 0,
                filteredSize: 0,
            };

            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(response));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(component.associatedRouteObjects()).toBe('-');
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set route status to check failed when request fails', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(throwError(() => new Error('Request failed')));

            component.checkIfAssociatedRouteObjects(createNode());

            expect(component.associatedRouteObjects()).toBe('check failed');
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });
    });

    describe('checkIfAssociatedDomainObjects', () => {
        const mockRouteObject: IAssociatedObjectApiResult = {
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

            response$.next(mockRouteObject);
            response$.complete();

            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set domain status to Present when response is not empty', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(mockRouteObject));

            component.checkIfAssociatedDomainObjects(createNode());

            expect(mockAssociatedObjectService.getAssociatedObjects).toHaveBeenCalledWith(
                AssociatedObjectType.ASSOCIATED_DOMAIN,
                '192.168.0.0/24',
                'inetnum',
                0,
                '',
            );

            expect(component.associatedDomainObjects()).toBe('Present');
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set domain status to response type when response is empty', () => {
            const response = {
                associatedObjects: [],
                totalNumberOfResources: 0,
                filteredSize: 0,
            };

            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(of(response));

            component.checkIfAssociatedDomainObjects(createNode());

            expect(component.associatedDomainObjects()).toBe('-');
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });

        it('should set domain status to check failed when request fails', () => {
            mockAssociatedObjectService.getAssociatedObjects.and.returnValue(throwError(() => new Error('Request failed')));

            component.checkIfAssociatedDomainObjects(createNode());

            expect(component.associatedDomainObjects()).toBe('check failed');
            expect(component.checkingDatabaseObjects()).toBeFalse();
        });
    });

    describe('effect', () => {
        it('should check announcement when node type matches tab type', () => {
            mockResourcesDataService.resourceCheck.calls.reset();

            fixture.componentRef.setInput(
                'node',
                createNode({
                    type: ObjectTypesEnum.INETNUM,
                }),
            );

            fixture.componentRef.setInput('tabType', ObjectTypesEnum.INETNUM);

            fixture.detectChanges();

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');
        });

        it('should not check announcement when node type does not match tab type', () => {
            mockResourcesDataService.resourceCheck.calls.reset();

            fixture.componentRef.setInput(
                'node',
                createNode({
                    type: ObjectTypesEnum.INETNUM,
                }),
            );

            fixture.componentRef.setInput('tabType', ObjectTypesEnum.INET6NUM);

            fixture.detectChanges();

            expect(mockResourcesDataService.resourceCheck).not.toHaveBeenCalled();
        });
    });

    describe('navigateToDetailPage', () => {
        it('should navigate to resource details', () => {
            component.navigateToDetailPage();

            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/myresources/detail/inetnum/192.168.0.0/24/false');
        });
    });

    describe('navigateToDetailPage', () => {
        it('should navigate to create Assignments', () => {
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

            expect(compiled.textContent).toContain('Parent: -');
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
