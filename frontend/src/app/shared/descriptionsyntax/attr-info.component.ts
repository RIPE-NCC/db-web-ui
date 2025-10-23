import { Component, Input, OnInit } from '@angular/core';
import { WhoisMetaService } from '../whois-meta.service';

@Component({
    selector: 'attr-info',
    template: `<span [innerHTML]="text"></span>`,
})
export class AttributeInfoComponent implements OnInit {
    @Input()
    public description: string;
    @Input()
    public objectType: string;
    @Input()
    public syntax: string;

    public text = '';

    constructor(private whoisMetaService: WhoisMetaService) {}

    public ngOnInit() {
        if (!this.objectType) {
            return;
        }
        if (this.description) {
            this.text = this.whoisMetaService.getAttributeDescription(this.objectType, this.description);
        } else if (this.syntax) {
            this.text = this.whoisMetaService.getAttributeSyntax(this.objectType, this.syntax);
        }
    }
}
