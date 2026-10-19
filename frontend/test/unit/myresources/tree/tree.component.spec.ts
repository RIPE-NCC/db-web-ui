import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NodeHealthStatus } from 'src/app/myresources/health-check-card/node-health.model';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { IMoreSpecificResource, IMoreSpecificsApiResult, MoreSpecificsService } from 'src/app/myresources/morespecifics/more-specifics.service';
import { IResourceScreenItem } from 'src/app/myresources/resource-type.model';
import { Tree, TreeNode } from 'src/app/myresources/tree/tree.component';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';

describe('Tree', () => {
    let component: Tree;
    let fixture: ComponentFixture<Tree>;

    let mockMoreSpecificsService: jasmine.SpyObj<MoreSpecificsService>;
    let mockNodeHealthService: jasmine.SpyObj<NodeHealthService>;

    const createResource = (overrides: Partial<IResourceScreenItem> = {}): IResourceScreenItem =>
        ({
            resource: '192.168.0.0/24',
            type: ObjectTypesEnum.INETNUM,
            netname: 'TEST-NET',
            status: 'ALLOCATED PA PA',
            usage: {
                used: 50,
                total: 100,
                blockSize: 1,
            },
            ...overrides,
        } as IResourceScreenItem);

    const createMoreSpecificResource = (index: number, overrides: Partial<IMoreSpecificResource> = {}): IMoreSpecificResource =>
        ({
            resource: `192.168.${index}.0/24`,
            type: ObjectTypesEnum.INETNUM,
            netname: `TEST-${index}`,
            status: 'ALLOCATED PA PA',
            usage: {
                used: 50,
                total: 100,
                blockSize: 1,
            },
            ...overrides,
        } as IMoreSpecificResource);

    beforeEach(async () => {
        mockMoreSpecificsService = jasmine.createSpyObj('MoreSpecificsService', ['getSpecifics']);

        mockNodeHealthService = jasmine.createSpyObj('NodeHealthService', ['registerNodes', 'healthCheck']);

        await TestBed.configureTestingModule({
            imports: [Tree],
            providers: [
                {
                    provide: MoreSpecificsService,
                    useValue: mockMoreSpecificsService,
                },
                {
                    provide: NodeHealthService,
                    useValue: mockNodeHealthService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Tree);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('rootLevelNodes', [createResource()]);
        fixture.componentRef.setInput('treeType', ObjectTypesEnum.INETNUM);
    });

    describe('isExpandable', () => {
        it('should return true when resource is allocated and has used resources', () => {
            const usage = {
                used: 10,
                total: 100,
                blockSize: 1,
            };

            expect(component.isExpandable('ALLOCATED PA', usage)).toBeTrue();
        });

        it('should return false when resource is not allocated', () => {
            const usage = {
                used: 10,
                total: 100,
                blockSize: 1,
            };

            expect(component.isExpandable('ASSIGNED PA', usage)).toBeFalse();
        });

        it('should return false when no resources are used', () => {
            const usage = {
                used: 0,
                total: 100,
                blockSize: 1,
            };

            expect(component.isExpandable('ALLOCATED PA', usage)).toBeFalse();
        });
    });

    describe('createNode', () => {
        it('should create a tree node from a resource', () => {
            const resource = createResource({
                resource: '10.0.0.0/8',
                netname: 'EXAMPLE',
            });

            const node = component.createNode(resource, 2, true);

            expect(node.resource).toBe(resource);
            expect(node.nodeName).toBe('10.0.0.0/8');
            expect(node.type).toBe(ObjectTypesEnum.INETNUM);
            expect(node.netname).toBe('EXAMPLE');
            expect(node.level).toBe(2);
            expect(node.expandable).toBeTrue();
            expect(node.parentResource).toBeUndefined();
            expect(node.children).toBeUndefined();
            expect(node.healthStatus()).toBe(NodeHealthStatus.NOT_CHECKED);
            expect(node.issuesCount()).toBe(0);
            expect(node.resourceCheckStatus()).toBeUndefined();
            expect(node.announcementStatus()).toBeUndefined();
        });

        it('should set parent resource', () => {
            const parent = component.createNode(createResource(), 0, true);

            const child = component.createNode(
                createResource({
                    resource: '10.0.0.0/16',
                }),
                1,
                false,
                parent,
            );

            expect(child.parentResource).toBe(parent);
        });

        it('should use AS name as netname for ASN resources', () => {
            const resource = {
                resource: 'AS123',
                type: ObjectTypesEnum.AUT_NUM,
                status: 'ALLOCATED',
                asname: 'EXAMPLE-AS',
                netname: undefined,
                usage: {
                    used: 1,
                    total: 1,
                    blockSize: 1,
                },
            } as IMoreSpecificResource;

            const node = component.createNode(resource, 0, false);

            expect(node.netname).toBe('EXAMPLE-AS');
        });
    });

    describe('effect', () => {
        it('should create a node for every root resource', () => {
            fixture.componentRef.setInput('rootLevelNodes', [
                createResource({
                    resource: '10.0.0.0/8',
                }),
                createResource({
                    resource: '192.168.0.0/16',
                }),
            ]);
            fixture.componentRef.setInput('treeType', ObjectTypesEnum.INETNUM);

            fixture.detectChanges();

            const nodes = component.dataSource();

            expect(nodes.length).toBe(2);
            expect(nodes[0].nodeName).toBe('10.0.0.0/8');
            expect(nodes[1].nodeName).toBe('192.168.0.0/16');
        });

        it('should create expandable node for allocated resource with usage', () => {
            fixture.componentRef.setInput('rootLevelNodes', [
                createResource({
                    status: 'ALLOCATED PA',
                    usage: {
                        used: 10,
                        total: 100,
                        blockSize: 1,
                    },
                }),
            ]);
            fixture.componentRef.setInput('treeType', ObjectTypesEnum.INETNUM);

            fixture.detectChanges();

            const nodes = component.dataSource();

            expect(nodes[0].expandable).toBeTrue();
        });

        it('should create non-expandable node when resource has no used addresses', () => {
            fixture.componentRef.setInput('rootLevelNodes', [
                createResource({
                    status: 'ALLOCATED PA',
                    usage: {
                        used: 0,
                        total: 100,
                        blockSize: 1,
                    },
                }),
            ]);
            fixture.componentRef.setInput('treeType', ObjectTypesEnum.INETNUM);

            fixture.detectChanges();

            const nodes = component.dataSource();

            expect(nodes[0].expandable).toBeFalse();
        });

        it('should initialize data source and start health checks', () => {
            const nodes = [
                createResource({
                    resource: '10.0.0.0/8',
                }),
                createResource({
                    resource: '192.168.0.0/16',
                }),
            ];

            fixture.componentRef.setInput('rootLevelNodes', nodes);
            fixture.componentRef.setInput('treeType', ObjectTypesEnum.INETNUM);

            fixture.detectChanges();

            expect(component.dataSource().length).toBe(2);

            expect(mockNodeHealthService.registerNodes).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, component.dataSource());

            expect(mockNodeHealthService.healthCheck).toHaveBeenCalledWith(component.dataSource());
        });
    });

    describe('onNodeExpanded', () => {
        it('should reset show more state when node is collapsed', () => {
            const node = component.createNode(createResource(), 0, true);

            node.showAllChildren = true;
            node.allChildren = [component.createNode(createResource({ resource: '10.0.0.0/16' }), 1, false, node)];

            node.children = node.allChildren;

            component.onNodeExpanded(node, false);

            expect(node.showAllChildren).toBeFalse();
            expect(node.children).toEqual(node.allChildren);
        });

        it('should load children when node is expanded', () => {
            const node = component.createNode(createResource(), 0, true);

            const response: IMoreSpecificsApiResult = {
                resources: [createMoreSpecificResource(1), createMoreSpecificResource(2)],
                totalNumberOfResources: 3,
                filteredSize: 3,
            };

            mockMoreSpecificsService.getSpecifics.and.returnValue(of(response));

            component.onNodeExpanded(node, true);

            expect(mockMoreSpecificsService.getSpecifics).toHaveBeenCalledWith(node.nodeName, node.type);

            expect(node.numberOfChildren).toBe(3);
            expect(node.allChildren?.length).toBe(2);
            expect(node.children?.length).toBe(2);
        });

        it('should register and health-check loaded children', () => {
            const node = component.createNode(createResource(), 0, true);

            const children = [createMoreSpecificResource(1), createMoreSpecificResource(2)];

            mockMoreSpecificsService.getSpecifics.and.returnValue(of({ resources: children, totalNumberOfResources: 3, filteredSize: 3 }));

            component.onNodeExpanded(node, true);

            expect(mockNodeHealthService.registerNodes).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, node.allChildren);

            expect(mockNodeHealthService.healthCheck).toHaveBeenCalledWith(node.allChildren);
        });

        it('should not reload children when they are already loaded', () => {
            const node = component.createNode(createResource(), 0, true);

            node.children = [];

            component.onNodeExpanded(node, true);

            expect(mockMoreSpecificsService.getSpecifics).not.toHaveBeenCalled();
        });

        it('should not initialize children when the response has no resources', () => {
            const node = component.createNode(createResource(), 0, true);

            mockMoreSpecificsService.getSpecifics.and.returnValue(
                of({
                    resources: undefined,
                    totalNumberOfResources: 0,
                    filteredSize: 0,
                } as IMoreSpecificsApiResult),
            );

            component.onNodeExpanded(node, true);

            expect(node.allChildren).toBeUndefined();
            expect(node.children).toBeUndefined();
            expect(mockNodeHealthService.registerNodes).not.toHaveBeenCalled();
            expect(mockNodeHealthService.healthCheck).not.toHaveBeenCalled();
        });
    });

    describe('show more', () => {
        it('should show all children when there are 10 or fewer', () => {
            const parent = component.createNode(createResource(), 0, true);

            parent.allChildren = Array.from({ length: 10 }, (_, i) => component.createNode(createMoreSpecificResource(i), 1, false, parent));

            parent.children = component['getVisibleChildren'](parent);

            expect(parent.children.length).toBe(10);
            expect(parent.children.some((child) => child.isShowMore)).toBeFalse();

            expect(component.showScalabilityBanner).toBeFalse();
        });

        it('should show first 10 children and show more node when there are more than 10', () => {
            const parent = component.createNode(createResource(), 0, true);

            parent.allChildren = Array.from({ length: 12 }, (_, i) => component.createNode(createMoreSpecificResource(i), 1, false, parent));

            parent.children = component['getVisibleChildren'](parent);

            expect(parent.children.length).toBe(11);
            expect(parent.children.filter((child) => !child.isShowMore).length).toBe(10);

            const showMoreNode = parent.children[10];

            expect(showMoreNode.isShowMore).toBeTrue();
            expect(showMoreNode.remaining).toBe(2);
            expect(showMoreNode.showMoreParent).toBe(parent);

            expect(component.showScalabilityBanner).toBeTrue();
        });

        it('should show all children when show more node is clicked', () => {
            const parent = component.createNode(createResource(), 0, true);

            parent.allChildren = Array.from({ length: 12 }, (_, i) => component.createNode(createMoreSpecificResource(i), 1, false, parent));

            parent.children = parent.allChildren.slice(0, 10);

            // The parent needs to be in the data source
            component.dataSource.set([parent]);

            const showMoreNode = {
                isShowMore: true,
                remaining: 2,
                showMoreParent: parent,
            } as TreeNode;

            component.showMore(showMoreNode);

            expect(parent.showAllChildren).toBeTrue();
            expect(parent.children).toEqual(parent.allChildren);
            expect(component.dataSource()).toContain(parent);
        });

        it('should do nothing when node has no show more parent', () => {
            const node = {
                isShowMore: true,
            } as TreeNode;

            const originalDataSource = component.dataSource();

            component.showMore(node);

            expect(component.dataSource()).toBe(originalDataSource);
        });
    });

    describe('selectNode', () => {
        it('should select node and emit it', () => {
            const node = component.createNode(createResource(), 0, false);

            spyOn(component.nodeSelected, 'emit');

            component.selectNode(node);

            expect(component.selectedNode).toBe(node);
            expect(component.nodeSelected.emit).toHaveBeenCalledWith(node);
        });
    });

    describe('tree helpers', () => {
        it('should return children from childrenAccessor', () => {
            const children = [component.createNode(createResource(), 1, false)];

            const node = component.createNode(createResource(), 0, true);

            node.children = children;

            expect(component.childrenAccessor(node)).toBe(children);
        });

        it('should return empty array from childrenAccessor when children are undefined', () => {
            const node = component.createNode(createResource(), 0, true);

            expect(component.childrenAccessor(node)).toEqual([]);
        });

        it('should return true from hasChild for expandable regular node', () => {
            const node = component.createNode(createResource(), 0, true);

            expect(component.hasChild(0, node)).toBeTrue();
        });

        it('should return false from hasChild for show more node', () => {
            const node = {
                isShowMore: true,
                expandable: true,
            } as TreeNode;

            expect(component.hasChild(0, node)).toBeFalse();
        });

        it('should identify show more node', () => {
            const node = {
                isShowMore: true,
            } as TreeNode;

            expect(component.isShowMore(0, node)).toBeTrue();
        });
    });
});
