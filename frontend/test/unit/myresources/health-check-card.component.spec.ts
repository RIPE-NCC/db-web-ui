import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthCheckCardComponent } from 'src/app/myresources/health-check-card/health-check-card.component';
import { NodeHealthStatus } from 'src/app/myresources/health-check-card/node-health.model';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { TreeNode } from 'src/app/myresources/tree/tree.component';

describe('HealthCheckCardComponent', () => {
    let component: HealthCheckCardComponent;
    let fixture: ComponentFixture<HealthCheckCardComponent>;

    let nodeHealthService: {
        nodes: ReturnType<typeof signal>;
        refresh: jasmine.Spy;
    };

    const createNode = (healthStatus: NodeHealthStatus, overrides: Partial<TreeNode> = {}): TreeNode =>
        ({
            parentResource: undefined,
            resource: undefined,
            nodeName: '192.168.0.0/24',
            netname: 'TEST-NET',
            level: 0,
            expandable: false,
            children: [],
            allChildren: [],
            numberOfChildren: 0,
            showAllChildren: false,
            isShowMore: false,
            remaining: 0,
            showMoreParent: undefined,

            healthStatus: signal(healthStatus),
            isLoading: signal(false),

            ...overrides,
        } as TreeNode);

    beforeEach(async () => {
        nodeHealthService = {
            nodes: signal({}),
            refresh: jasmine.createSpy('refresh'),
        };

        await TestBed.configureTestingModule({
            imports: [HealthCheckCardComponent],
            providers: [
                {
                    provide: NodeHealthService,
                    useValue: nodeHealthService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HealthCheckCardComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('treeType', 'inetnum');

        fixture.detectChanges();
    });

    describe('currentNodes', () => {
        it('should return nodes for the selected tree type', () => {
            const nodes = [createNode(NodeHealthStatus.OK), createNode(NodeHealthStatus.ISSUES)];

            nodeHealthService.nodes.set({
                inetnum: nodes,
            });

            expect(component.currentNodes()).toEqual(nodes);
        });

        it('should return an empty array when tree type does not exist', () => {
            nodeHealthService.nodes.set({
                inetnum: [createNode(NodeHealthStatus.OK)],
            });

            fixture.componentRef.setInput('treeType', 'inet6num');
            fixture.detectChanges();

            expect(component.currentNodes()).toEqual([]);
        });
    });

    describe('status counts', () => {
        beforeEach(() => {
            nodeHealthService.nodes.set({
                inetnum: [
                    createNode(NodeHealthStatus.NOT_CHECKED),
                    createNode(NodeHealthStatus.NOT_CHECKED),
                    createNode(NodeHealthStatus.OK),
                    createNode(NodeHealthStatus.OK),
                    createNode(NodeHealthStatus.OK),
                    createNode(NodeHealthStatus.ISSUES),
                    createNode(NodeHealthStatus.FAILED),
                ],
            });
        });

        it('should count nodes that are not checked', () => {
            expect(component.checkingCount()).toBe(2);
        });

        it('should count healthy nodes', () => {
            expect(component.okCount()).toBe(3);
        });

        it('should count nodes with issues', () => {
            expect(component.issuesCount()).toBe(1);
        });

        it('should count failed nodes', () => {
            expect(component.failedCount()).toBe(1);
        });
    });

    describe('cardStatus', () => {
        it('should return checking when there are nodes not checked', () => {
            nodeHealthService.nodes.set({
                inetnum: [
                    createNode(NodeHealthStatus.NOT_CHECKED),
                    createNode(NodeHealthStatus.OK),
                    createNode(NodeHealthStatus.FAILED),
                    createNode(NodeHealthStatus.ISSUES),
                ],
            });

            expect(component.cardStatus()).toBe('checking');
        });

        it('should return failed when there are failed nodes', () => {
            nodeHealthService.nodes.set({
                inetnum: [createNode(NodeHealthStatus.OK), createNode(NodeHealthStatus.ISSUES), createNode(NodeHealthStatus.FAILED)],
            });

            expect(component.cardStatus()).toBe('failed');
        });

        it('should return issues when there are issues but no failed nodes', () => {
            nodeHealthService.nodes.set({
                inetnum: [createNode(NodeHealthStatus.OK), createNode(NodeHealthStatus.ISSUES)],
            });

            expect(component.cardStatus()).toBe('issues');
        });

        it('should return healthy when all nodes are healthy', () => {
            nodeHealthService.nodes.set({
                inetnum: [createNode(NodeHealthStatus.OK), createNode(NodeHealthStatus.OK)],
            });

            expect(component.cardStatus()).toBe('healthy');
        });

        it('should return empty string when there are no nodes', () => {
            nodeHealthService.nodes.set({
                inetnum: [],
            });

            expect(component.cardStatus()).toBe('');
        });
    });

    describe('refresh', () => {
        it('should refresh nodes for the current tree type', () => {
            component.refresh();

            expect(nodeHealthService.refresh).toHaveBeenCalledWith('inetnum');
        });
    });
});
