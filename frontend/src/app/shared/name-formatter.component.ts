import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {IpAddressService} from "../myresources/ip-address.service";

@Component({
    selector: "name-formatter",
    template: `{{ formatted }}`
})
export class NameFormatterComponent implements OnInit, OnChanges {

    @Input()
    public name: string;
    @Input()
    public type: string;
    public formatted: string;

    constructor(private ipAddressService: IpAddressService) {
    }

    public ngOnInit() {
        this.applyFormat();
    }

    public ngOnChanges() {
        this.applyFormat();
    }

    private applyFormat() {
        this.formatted =
            typeof this.type === "string" && this.type.toUpperCase() === "INETNUM"
                ? this.ipAddressService.formatAsPrefix(this.name)
                : this.name || "";
    }
}
