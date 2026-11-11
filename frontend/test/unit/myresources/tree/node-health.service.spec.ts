import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { MockedObject } from 'vitest';

import { NodeHealthStatus } from 'src/app/myresources/health-check-card/node-health.model';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { TreeNode } from 'src/app/myresources/tree/tree.component';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';

describe('NodeHealthService', () => {
    let service: NodeHealthService;
    let mockResourcesDataService: MockedObject<ResourcesDataService>;

    const createNode = (type = ObjectTypesEnum.INETNUM, nodeName = '192.168.0.0/24', level = 0): TreeNode =>
        ({
            type,
            nodeName,
            level,
            resource: {
                type: type === ObjectTypesEnum.INETNUM ? 'inetnum' : type === ObjectTypesEnum.INET6NUM ? 'inet6num' : 'aut-num',
                resource: nodeName,
            },
            healthStatus: signal(NodeHealthStatus.NOT_CHECKED),
            issuesCount: signal(0),
            issuesCountOfChildren: signal(0),
            resourceCheckStatus: signal([]),
            announcementStatus: signal(undefined),
        } as unknown as TreeNode);

    beforeEach(() => {
        mockResourcesDataService = {
            resourceCheck: vi.fn().mockName('ResourcesDataService.resourceCheck'),
            checkAnnouncements: vi.fn().mockName('ResourcesDataService.checkAnnouncements'),
            clearResourceCheckCache: vi.fn().mockName('ResourcesDataService.clearResourceCheckCache'),
            clearAnnouncementsCache: vi.fn().mockName('ResourcesDataService.clearAnnouncementsCache'),
        } as any;

        mockResourcesDataService.resourceCheck.mockReturnValue(of([]));
        mockResourcesDataService.checkAnnouncements.mockReturnValue(of([]));

        TestBed.configureTestingModule({
            providers: [NodeHealthService, { provide: ResourcesDataService, useValue: mockResourcesDataService }],
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
            const node = createNode();

            service.registerNodes(ObjectTypesEnum.INETNUM, [node]);
            service.registerNodes(ObjectTypesEnum.INETNUM, [node]);

            expect(service.nodes()[ObjectTypesEnum.INETNUM]).toEqual([node]);
        });

        it('should replace an existing node with the same key', () => {
            const oldNode = createNode();
            const newNode = createNode();

            service.registerNodes(ObjectTypesEnum.INETNUM, [oldNode]);
            service.registerNodes(ObjectTypesEnum.INETNUM, [newNode]);

            expect(service.nodes()[ObjectTypesEnum.INETNUM]).toEqual([newNode]);
        });
    });

    describe('checkAnnouncementStatus', () => {
        it('should return Unannounced when there are no announcements', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([]));

            service.checkAnnouncementStatus(createNode()).subscribe((status) => {
                expect(status).toBe('Unannounced');
            });
        });

        it('should return Announced when an IPv4 announcement covers the resource', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/23', origin: '12345', peers: 1 }]));

            service.checkAnnouncementStatus(createNode()).subscribe((status) => {
                expect(status).toBe('Announced');
            });
        });

        it('should return Partially announced when no announcement covers the full IPv4 resource', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/25', origin: '12345', peers: 1 }]));

            service.checkAnnouncementStatus(createNode()).subscribe((status) => {
                expect(status).toBe('Partially announced');
            });
        });

        it('should return Announced for an ASN when announcements exist', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/24', origin: '12345', peers: 1 }]));

            service.checkAnnouncementStatus(createNode(ObjectTypesEnum.AUT_NUM, 'AS12345')).subscribe((status) => {
                expect(status).toBe('Announced');
            });
        });

        it('should return check failed when the announcement request fails', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(throwError(() => new Error('Request failed')));

            service.checkAnnouncementStatus(createNode()).subscribe((status) => {
                expect(status).toBe('check failed');
            });
        });
    });

    describe('checkRouteAnnouncementStatus', () => {
        it('should return Unannounced when no announcements are returned', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([]));

            service.checkRouteAnnouncementStatus(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 'AS12345').subscribe((status) => {
                expect(status).toBe('Unannounced');
                expect(mockResourcesDataService.checkAnnouncements).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');
            });
        });

        it('should return Announced for an exact prefix and origin match', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/24', origin: '12345', peers: 1 }]));

            service.checkRouteAnnouncementStatus(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 'AS12345').subscribe((status) => {
                expect(status).toBe('Announced');
            });
        });

        it('should return Mismatch when the exact prefix has a different origin', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/24', origin: '23456', peers: 1 }]));

            service.checkRouteAnnouncementStatus(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 'AS12345').subscribe((status) => {
                expect(status).toBe('Mismatch');
            });
        });

        it('should return Not exact match when the prefix differs', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/25', origin: '12345', peers: 1 }]));

            service.checkRouteAnnouncementStatus(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 'AS12345').subscribe((status) => {
                expect(status).toBe('Not exact match');
            });
        });

        it('should check the ASN resource for an aut-num route', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/24', origin: '12345', peers: 1 }]));

            service.checkRouteAnnouncementStatus(ObjectTypesEnum.AUT_NUM, '192.168.0.0/24', 'AS12345').subscribe(() => {
                expect(mockResourcesDataService.checkAnnouncements).toHaveBeenCalledWith(ObjectTypesEnum.AUT_NUM, 'AS12345');
            });
        });

        it('should return check failed when the announcement request fails', async () => {
            mockResourcesDataService.checkAnnouncements.mockReturnValue(throwError(() => new Error('Request failed')));

            service.checkRouteAnnouncementStatus(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 'AS12345').subscribe((status) => {
                expect(status).toBe('check failed');
            });
        });
    });

    describe('healthCheck', () => {
        it('should check the health of all nodes', () => {
            const nodes = [
                createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24'),
                createNode(ObjectTypesEnum.INETNUM, '192.168.1.0/24'),
                createNode(ObjectTypesEnum.INETNUM, '192.168.2.0/24'),
            ];

            mockResourcesDataService.resourceCheck.mockReturnValue(of([]));
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([]));

            service.healthCheck(nodes);

            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledTimes(3);
            expect(mockResourcesDataService.checkAnnouncements).toHaveBeenCalledTimes(3);
            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');
            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.1.0/24');
            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.2.0/24');
        });

        it('should handle an empty node list', () => {
            service.healthCheck([]);

            expect(mockResourcesDataService.resourceCheck).not.toHaveBeenCalled();
            expect(mockResourcesDataService.checkAnnouncements).not.toHaveBeenCalled();
        });
    });

    describe('checkNodeHealth', () => {
        it('should set node status to OK when no issues are returned', () => {
            const node = createNode();
            mockResourcesDataService.resourceCheck.mockReturnValue(of([]));
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([]));

            service.checkNodeHealth(node).subscribe();

            expect(node.healthStatus()).toBe(NodeHealthStatus.OK);
            expect(node.issuesCount()).toBe(0);
            expect(node.announcementStatus()).toBe('Unannounced');
            expect(mockResourcesDataService.resourceCheck).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM, '192.168.0.0/24');
        });

        it('should set node status to ISSUES when issues are returned', () => {
            const node = createNode();
            const response = [{ type: 'Not announced' }, { type: 'Wrong origin' }] as ResourceCheck[];

            mockResourcesDataService.resourceCheck.mockReturnValue(of(response));
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([]));

            service.checkNodeHealth(node).subscribe();

            expect(node.healthStatus()).toBe(NodeHealthStatus.ISSUES);
            expect(node.issuesCount()).toBe(2);
            expect(node.resourceCheckStatus()).toEqual(response);
        });

        it('should set child node announcement status without running resourceCheck', () => {
            const node = createNode(ObjectTypesEnum.INETNUM, '192.168.0.0/24', 1);
            mockResourcesDataService.checkAnnouncements.mockReturnValue(of([{ prefix: '192.168.0.0/23', origin: '12345', peers: 1 }]));

            service.checkNodeHealth(node).subscribe();

            expect(node.announcementStatus()).toBe('Announced');
            expect(node.healthStatus()).toBe(NodeHealthStatus.OK);
            expect(mockResourcesDataService.resourceCheck).not.toHaveBeenCalled();
        });

        it('should set node status to FAILED when the health check fails', () => {
            const node = createNode();
            mockResourcesDataService.resourceCheck.mockReturnValue(throwError(() => new Error('Request failed')));

            service.checkNodeHealth(node).subscribe();

            expect(node.healthStatus()).toBe(NodeHealthStatus.FAILED);
            expect(node.issuesCount()).toBe(0);
        });
    });

    describe('reset', () => {
        it('should clear all registered nodes', () => {
            service.registerNodes(ObjectTypesEnum.INETNUM, [createNode()]);
            expect(service.nodes()).not.toEqual({});

            service.reset();

            expect(service.nodes()).toEqual({});
        });
    });

    describe('refresh', () => {
        it('should reset node health state and refresh health checks', () => {
            const nodes = [
                {
                    ...createNode(),
                    healthStatus: signal(NodeHealthStatus.ISSUES),
                    issuesCount: signal(3),
                },
                {
                    ...createNode(ObjectTypesEnum.INETNUM, '192.168.1.0/24'),
                    healthStatus: signal(NodeHealthStatus.FAILED),
                    issuesCount: signal(2),
                },
            ] as TreeNode[];

            service.nodes.set({ [ObjectTypesEnum.INETNUM]: nodes });
            vi.spyOn(service, 'healthCheck').mockReturnValue(undefined);

            service.refresh(ObjectTypesEnum.INETNUM);

            expect(nodes[0].healthStatus()).toBe(NodeHealthStatus.NOT_CHECKED);
            expect(nodes[0].issuesCount()).toBe(0);
            expect(nodes[1].healthStatus()).toBe(NodeHealthStatus.NOT_CHECKED);
            expect(nodes[1].issuesCount()).toBe(0);
            expect(service.healthCheck).toHaveBeenCalledWith(nodes);
        });

        it('should do nothing but call healthCheck with an empty list when no nodes are registered', () => {
            vi.spyOn(service, 'healthCheck').mockReturnValue(undefined);

            service.refresh(ObjectTypesEnum.INETNUM);

            expect(service.healthCheck).toHaveBeenCalledWith([]);
        });
    });

    describe('refreshAll', () => {
        it('should clear caches and refresh all supported tree types', () => {
            vi.spyOn(service, 'refresh').mockReturnValue(undefined);

            service.refreshAll();

            expect(mockResourcesDataService.clearResourceCheckCache).toHaveBeenCalled();
            expect(mockResourcesDataService.clearAnnouncementsCache).toHaveBeenCalled();
            expect(service.refresh).toHaveBeenCalledWith(ObjectTypesEnum.INETNUM);
            expect(service.refresh).toHaveBeenCalledWith(ObjectTypesEnum.INET6NUM);
            expect(service.refresh).toHaveBeenCalledWith(ObjectTypesEnum.AUT_NUM);
        });
    });
});
