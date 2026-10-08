import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { NodeHealthStatus } from 'src/app/myresources/health-check-card/node-health.model';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { TreeNode } from 'src/app/myresources/tree/tree.component';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';

describe('NodeHealthService', () => {
    let service: NodeHealthService;
    let mockResourcesDataService: jasmine.SpyObj<ResourcesDataService>;

    const createNode = (type = ObjectTypesEnum.INETNUM, nodeName = '192.168.0.0/24'): TreeNode =>
        ({
            type,
            nodeName,
            resource: {
                resource: nodeName,
            },
            healthStatus: signal(NodeHealthStatus.NOT_CHECKED),
            issuesCount: signal(0),
        } as TreeNode);

    beforeEach(() => {
        mockResourcesDataService = jasmine.createSpyObj('ResourcesDataService', ['resourceCheck']);

        TestBed.configureTestingModule({
            providers: [
                NodeHealthService,
                {
                    provide: ResourcesDataService,
                    useValue: mockResourcesDataService,
                },
            ],
        });

        service = TestBed.inject(NodeHealthService);
    });

    describe('registerNodes', () => {
        it('should register nodes for a tree type', () => {
            const nodes = [createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24'), createNode(ObjectTypesEnum.INETNUM, '192.168.1.0/24')];

            service.registerNodes(ObjectTypesEnum.INETNUM, nodes);

            expect(service.nodes()[ObjectTypesEnum.INETNUM]).toEqual(nodes);
        });

        it('should preserve nodes already registered for another tree type', () => {
            const inetnumNode = createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24');

            const inet6numNode = createNode(ObjectTypesEnum.INET6NUM, '2001:db8::/32');

            service.registerNodes(ObjectTypesEnum.INETNUM, [inetnumNode]);
            service.registerNodes(ObjectTypesEnum.INET6NUM, [inet6numNode]);

            expect(service.nodes()[ObjectTypesEnum.INETNUM]).toEqual([inetnumNode]);

            expect(service.nodes()[ObjectTypesEnum.INET6NUM]).toEqual([inet6numNode]);
        });

        it('should not register the same node twice', () => {
            const node = createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24');

            service.registerNodes(ObjectTypesEnum.INETNUM, [node]);
            service.registerNodes(ObjectTypesEnum.INETNUM, [node]);

            expect(service.nodes()[ObjectTypesEnum.INETNUM]).toEqual([node]);
        });

        it('should replace an existing node with the same key', () => {
            const oldNode = createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24');

            const newNode = createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24');

            service.registerNodes(ObjectTypesEnum.INETNUM, [oldNode]);
            service.registerNodes(ObjectTypesEnum.INETNUM, [newNode]);

            expect(service.nodes()[ObjectTypesEnum.INETNUM]).toEqual([newNode]);
        });
    });

    describe('healthCheck', () => {
        it('should check the health of all nodes', () => {
            const nodes = [
                createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24'),
                createNode(ObjectTypesEnum.INETNUM, '192.168.1.0/24'),
                createNode(ObjectTypesEnum.INETNUM, '192.168.2.0/24'),
            ];

            mockResourcesDataService.resourceCheck.and.returnValue(of([]));

            service.healthCheck(nodes);

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledTimes(3);

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.1.0/24');

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.2.0/24');
        });

        it('should handle an empty node list', () => {
            service.healthCheck([]);

            expect(mockResourcesDataService.resourceCheck).not.toHaveBeenCalled();
        });
    });

    describe('checkNodeHealth', () => {
        it('should set node status to OK when no issues are returned', () => {
            const node = createNode();

            mockResourcesDataService.resourceCheck.and.returnValue(of([]));

            service.checkNodeHealth(node).subscribe();

            expect(node.healthStatus()).toBe(NodeHealthStatus.OK);
            expect(node.issuesCount()).toBe(0);

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');
        });

        it('should set node status to ISSUES when issues are returned', () => {
            const node = createNode();

            const response = [{ type: 'Not announced' }, { type: 'Wrong origin' }] as ResourceCheck[];

            mockResourcesDataService.resourceCheck.and.returnValue(of(response));

            service.checkNodeHealth(node).subscribe();

            expect(node.healthStatus()).toBe(NodeHealthStatus.ISSUES);
            expect(node.issuesCount()).toBe(2);
        });

        it('should set node status to FAILED when the health check fails', () => {
            const node = createNode();

            mockResourcesDataService.resourceCheck.and.returnValue(throwError(() => new Error('Request failed')));

            service.checkNodeHealth(node).subscribe();

            expect(node.healthStatus()).toBe(NodeHealthStatus.FAILED);
            expect(node.issuesCount()).toBe(0);
        });
    });

    describe('reset', () => {
        it('should clear all registered nodes', () => {
            const nodes = [createNode()];

            service.registerNodes(ObjectTypesEnum.INETNUM, nodes);

            expect(service.nodes()).not.toEqual({});

            service.reset();

            expect(service.nodes()).toEqual({});
        });
    });

    describe('refresh', () => {
        it('should reset node health state and refresh health checks', () => {
            const nodes = [
                {
                    type: ObjectTypesEnum.INETNUM,
                    nodeName: '192.168.0.0/24',
                    healthStatus: signal(NodeHealthStatus.ISSUES),
                    issuesCount: signal(3),
                },
                {
                    type: ObjectTypesEnum.INETNUM,
                    nodeName: '192.168.1.0/24',
                    healthStatus: signal(NodeHealthStatus.FAILED),
                    issuesCount: signal(2),
                },
            ] as TreeNode[];

            service.nodes.set({
                [ObjectTypesEnum.INETNUM]: nodes,
            });

            spyOn(service, 'healthCheck');

            service.refresh(ObjectTypesEnum.INETNUM);

            expect(nodes[0].healthStatus()).toBe(NodeHealthStatus.NOT_CHECKED);
            expect(nodes[0].issuesCount()).toBe(0);

            expect(nodes[1].healthStatus()).toBe(NodeHealthStatus.NOT_CHECKED);
            expect(nodes[1].issuesCount()).toBe(0);

            expect(service.healthCheck).toHaveBeenCalledWith(nodes);
        });

        it('should do nothing when refreshing a tree with no registered nodes', () => {
            spyOn(service, 'healthCheck');

            service.refresh(ObjectTypesEnum.INETNUM);

            expect(service.healthCheck).toHaveBeenCalledWith([]);
        });
    });
});
