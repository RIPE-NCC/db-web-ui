import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WhoisVersionComponent } from '../../application-version/whois-version.component';
import { PropertiesService } from '../../properties.service';
import { AlertsService } from '../../shared/alert/alerts.service';
import { WhoisLineDiffDirective } from '../../shared/whois-line-diff.directive';
import { WhoisResourcesService } from '../../shared/whois-resources.service';
import { IAttributeModel, IObjectVersionPreviewModel, IVersion, IWhoisResponseModel } from '../../shared/whois-response-type.model';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { VersionsLookupService } from '../versions-lookup.service';

@Component({
    selector: 'versions-diff',
    templateUrl: './diff.component.html',
    standalone: true,
    styleUrl: 'diff.component.scss',
    imports: [MatSelect, MatOption, FormsModule, DatePipe, WhoisLineDiffDirective, WhoisVersionComponent, BreadcrumbsComponent, MatButton],
})
export class DiffComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private activatedRoute = inject(ActivatedRoute);
    private alertsService = inject(AlertsService);
    private versionsLookupService = inject(VersionsLookupService);
    private router = inject(Router);
    properties = inject(PropertiesService);
    whoisResourcesService = inject(WhoisResourcesService);

    objectType: string;
    objectName: string;
    source: string;
    versions: IObjectVersionPreviewModel[];
    leftVersionId: number;
    diffVersionId: number | null = null;
    leftDiff: string;
    rightDiff: string;
    error: any;
    from: string | null;
    searchText: string | null;
    whoisVersion: IVersion;
    isLeftLatest = false;
    isRightLatest = false;

    private leftSelect$ = new Subject<number>();
    private rightSelect$ = new Subject<number>();
    private versionCache = new Map<number, IAttributeModel[]>();

    ngOnInit() {
        const params = this.activatedRoute.snapshot.queryParams;
        this.objectType = params.type;
        this.objectName = params.key;
        this.source = params.source;
        this.leftVersionId = +params.version;
        this.from = params.from;
        this.searchText = params.searchtext;
        if (params.diff != null) this.diffVersionId = +params.diff;
        this.init();

        this.leftSelect$
            .pipe(
                switchMap((id) => {
                    const $left = this.fetchVersion(id);
                    const $right = of(this.isLatest(id));

                    return forkJoin({ left: $left, right: $right });
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (attrs) => {
                    this.leftDiff = this.whoisResourcesService.toPlaintext(attrs.left);
                    this.isLeftLatest = attrs.right;
                },
                error: (err) => {
                    this.error = err;
                },
            });

        this.rightSelect$
            .pipe(
                switchMap((id) => {
                    const $left = this.fetchVersion(id);
                    const $right = of(this.isLatest(id));

                    return forkJoin({ left: $left, right: $right });
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (attrs) => {
                    this.rightDiff = this.whoisResourcesService.toPlaintext(attrs.left);
                    this.isRightLatest = attrs.right;
                },
                error: (err) => {
                    this.error = err;
                },
            });
    }

    navigateBack() {
        const queryParams: any = {
            source: this.source,
            type: this.objectType,
            key: this.objectName,
        };

        if (this.from) {
            queryParams.from = this.from;

            if (this.from === 'query') {
                queryParams.searchtext = this.searchText;
            }
        }

        void this.router.navigate(['versions'], { queryParams });
    }

    isLatest(id: number) {
        if (id > 0) {
            return id === Math.max(...this.versions.map((v) => v.revision));
        }
    }

    onLeftVersionSelect(id: number) {
        this.leftSelect$.next(id);

        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { version: id },
            queryParamsHandling: 'merge',
        });
    }

    onRightVersionSelect(id: number | null) {
        if (!id) return;
        this.rightSelect$.next(id);

        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { diff: id },
            queryParamsHandling: 'merge',
        });
    }

    private init() {
        this.lookupWhoisObject();

        this.versionsLookupService
            .getVersions(this.source, this.objectType, this.objectName)
            .pipe(
                tap((response) => (this.versions = response.versions.version)),
                switchMap(() => {
                    const left$ = this.fetchVersion(this.leftVersionId);
                    const leftLatest$ = of(this.isLatest(this.leftVersionId));
                    let right$: Observable<IAttributeModel[]>;
                    let rightLatest$: Observable<boolean>;

                    if (this.diffVersionId != null) {
                        right$ = this.fetchVersion(this.diffVersionId);
                        rightLatest$ = of(this.isLatest(this.diffVersionId));
                    } else {
                        right$ = of(null);
                        rightLatest$ = of(false);
                    }

                    return forkJoin({ left: left$, right: right$, leftLatest: leftLatest$, rightLatest: rightLatest$ });
                }),
            )
            .subscribe({
                next: ({ left, right, leftLatest, rightLatest }) => {
                    this.leftDiff = this.whoisResourcesService.toPlaintext(left);
                    this.isLeftLatest = leftLatest;
                    this.isRightLatest = rightLatest;
                    if (right) {
                        this.rightDiff = this.whoisResourcesService.toPlaintext(right);
                    }
                },
                error: (err) => {
                    this.error = err;
                },
            });
    }

    // TODO: add support to the versions api to fetch app version alongside the versions, in order to eliminate unnecessary second request [DB-7341]
    private lookupWhoisObject() {
        this.versionsLookupService
            .versionsLookup(this.source, this.objectType, this.objectName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: IWhoisResponseModel) => {
                    this.whoisVersion = response.version;
                },
                error: () => {
                    this.alertsService.addGlobalError(`An error occurred looking for ${this.objectType} ${this.objectName}`);
                },
            });
    }

    private fetchVersion(id: number): Observable<IAttributeModel[]> {
        if (this.versionCache.has(id)) {
            return of(this.versionCache.get(id)!);
        }
        return this.versionsLookupService.getVersion(this.source, this.objectType, this.objectName, id).pipe(
            map((response) => response.objects.object[0].attributes.attribute),
            tap((attrs) => this.versionCache.set(id, attrs)),
        );
    }
}
