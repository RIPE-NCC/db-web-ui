import { Component, inject, input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { NameFormatterComponent } from 'src/app/shared/name-formatter.component';
import { TreeNode } from './tree.component';

@Component({
    selector: 'node-preview',
    templateUrl: 'node-preview.component.html',
    styleUrl: 'node-preview.component.scss',
    imports: [NameFormatterComponent, MatButton],
})
export class NodePreviewComponent implements OnInit {
    router = inject(Router);

    readonly node = input<TreeNode>();

    ngOnInit(): void {}

    navigateToDetailPage() {
        void this.router.navigateByUrl(`/myresources/detail/${this.node().type}/${this.node().resource}/false`);
    }
}
