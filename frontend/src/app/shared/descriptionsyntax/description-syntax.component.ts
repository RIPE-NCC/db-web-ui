import { Component, Input } from '@angular/core';

@Component({
    selector: 'description-syntax',
    template: `<div class="text field-description" [ngbCollapse]="!showComponent">
        <strong>Description</strong><br />
        <attr-info [objectType]="objectType" [description]="attrName"></attr-info><br />
        <strong>Syntax</strong><br />
        <attr-info [objectType]="objectType" [syntax]="attrName"></attr-info>
    </div>`,
})
export class DescriptionSyntaxComponent {
    @Input()
    public objectType: string;
    @Input()
    public attrName: string;
    @Input()
    public showComponent: boolean;
}
