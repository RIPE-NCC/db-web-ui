import {Component, Input} from "@angular/core";
import {WhoisMetaService} from "../shared/whois-meta.service";

@Component({
    selector: "attr-info",
    template: `<div [innerHTML]="text"></div>`,
})
export class AttributeInfoComponent {

    @Input()
    public description: string;
    @Input("object-type")
    public objectType: string;
    @Input()
    public syntax: string;

    public text = "";

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
