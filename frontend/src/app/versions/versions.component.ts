import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WhoisVersionComponent } from '../application-version/whois-version.component';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { IAttributeModel, IObjectVersionPreviewModel, IVersion, IWhoisObjectModel } from '../shared/whois-response-type.model';
import { WhoisObjectVisualiser } from '../whois-object/whois-object-visualiser';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { VersionsLookupService } from './versions-lookup.service';

@Component({
    selector: 'versions-component',
    templateUrl: './versions.component.html',
    styleUrl: './versions.component.scss',
    standalone: true,
    imports: [MatSelect, MatOption, FormsModule, NgClass, MatButton, WhoisVersionComponent, DatePipe, MatTooltip, BreadcrumbsComponent],
})
export class VersionsComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private versionsLookupService = inject(VersionsLookupService);
    private router = inject(Router);
    properties = inject(PropertiesService);
    activatedRoute = inject(ActivatedRoute);
    alertsService = inject(AlertsService);
    versionsUtilsService = inject(WhoisObjectVisualiser);

    private versionSelect$ = new Subject<number>();
    private versionCache = new Map<number, IWhoisObjectModel[]>();

    source: string;
    objectType: string;
    objectName: string;
    whoisVersion: IVersion;
    versions: IObjectVersionPreviewModel[];
    error: any;
    from: string | null;
    searchText: string | null;
    selectedVersionId: number;
    selectedVersion: IAttributeModel[];
    showRipeManagedAttrs = true;
    isLatest = false;

    ngOnInit() {
        this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            this.objectName = params.key;
            this.objectType = params.type;
            this.from = params.from;
            this.source = params.source;
            this.searchText = params.searchtext;
            this.init();
        });
    }

    loadVersions() {
        this.versionsLookupService
            .getVersions(this.source, this.objectType, this.objectName)
            .pipe(
                tap((response) => {
                    this.versions = response.versions.version;

                    if (this.versions.length === 0) {
                        return;
                    }

                    const latest = this.versions.reduce((max, v) => (v.revision > max.revision ? v : max));
                    this.selectedVersionId = latest.revision;
                    this.isLatestVersion(this.selectedVersionId);
                }),
                switchMap(() => {
                    return this.versionsLookupService.getVersion(this.source, this.objectType, this.objectName, this.selectedVersionId);
                }),
            )
            .subscribe({
                next: (firstVersion) => {
                    this.selectedVersion = firstVersion.objects.object[0].attributes.attribute;
                },
                error: (err) => {
                    this.error = err;
                },
            });
    }

    loadVersion() {
        this.versionSelect$
            .pipe(
                switchMap((id) => this.fetchVersion(id)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (response) => {
                    this.selectedVersion = response[0].attributes.attribute;
                    this.objectName = response[0]['primary-key'].attribute.map((attr) => attr.value).join('');
                    this.objectType = response[0].type;

                    this.isLatestVersion(response[0].version);
                },
                error: (err) => {
                    this.error = err;
                },
            });
    }

    onVersionSelect(id: number) {
        this.versionSelect$.next(id);
    }

    navigateToVersionDiff() {
        const queryParams: any = {
            source: this.source,
            type: this.objectType,
            key: this.objectName,
            version: this.selectedVersionId,
        };

        if (this.from) {
            queryParams.from = this.from;

            if (this.from === 'query') {
                queryParams.searchtext = this.searchText;
            }
        }

        void this.router.navigate(['version-diff'], { queryParams });
    }

    private isLatestVersion(currentVersion: IVersion | number) {
        let finalCurrentVersion: number;
        if (typeof currentVersion === 'number') {
            finalCurrentVersion = currentVersion;
        } else {
            finalCurrentVersion = Number(currentVersion.version);
        }

        if (finalCurrentVersion > 0) {
            const maxRevision = Math.max(...this.versions.map((v) => v.revision));
            this.isLatest = finalCurrentVersion === maxRevision;
        }
    }

    private init() {
        this.versionsLookupService
            .versionsLookup(this.source, this.objectType, this.objectName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.whoisVersion = response.version;
                },
                error: () => {
                    this.alertsService.addGlobalError(`An error occurred looking for ${this.objectType} ${this.objectName}`);
                },
            });
        this.loadVersions();
        this.loadVersion();
    }

    private fetchVersion(id: number): Observable<IWhoisObjectModel[]> {
        if (this.versionCache.has(id)) {
            return of(this.versionCache.get(id));
        }
        return this.versionsLookupService.getVersion(this.source, this.objectType, this.objectName, id).pipe(
            map((response) => response.objects.object),
            tap((attrs) => this.versionCache.set(id, attrs)),
        );
    }
}
