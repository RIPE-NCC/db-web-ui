import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'breadcrumbs',
    standalone: true,
    templateUrl: './breadcrumbs.component.html',
    styleUrl: './breadcrumbs.component.scss',
})
export class BreadcrumbsComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    source: string;
    objectType?: string;
    objectName?: string;
    from: string;
    searchText?: string;

    ngOnInit() {
        const params = this.route.snapshot.queryParams;
        this.source = params.source;
        this.objectType = params.type;
        this.objectName = params.key;
        this.from = params.from;
        this.searchText = params.searchtext;
    }

    private getRoute() {
        switch (this.from) {
            case 'lookup':
                return '/lookup';
            case 'query':
                return '/query';
            default:
                return '/query';
        }
    }

    navigateBack() {
        const queryParams: any = {
            source: this.source,
        };

        if (this.from === 'lookup') {
            queryParams.key = this.objectName;
            queryParams.type = this.objectType;
        }
        if (this.from === 'query' && this.searchText) {
            queryParams.searchtext = this.searchText;
        }

        void this.router.navigate([this.getRoute()], { queryParams });
    }

    navigate() {
        const queryParams: any = {
            source: this.source,
            type: this.objectType,
            key: this.objectName,
            from: this.from,
        };

        if (this.from === 'query' && this.searchText) {
            queryParams.searchtext = this.searchText;
        }

        void this.router.navigate(['/versions'], { queryParams });
    }
}
