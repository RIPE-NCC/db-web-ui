import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IpAddressService } from '../myresources/ip-address.service';
import { ObjectTypesEnum } from '../query/object-types.enum';

@Component({
    selector: 'name-formatter',
    template: `{{ formatted }}`,
})
export class NameFormatterComponent implements OnInit, OnChanges {
    @Input()
    public name: string;
    @Input()
    public type: string;
    public formatted: string;

    public ngOnInit() {
        this.applyFormat();
    }

    public ngOnChanges() {
        this.applyFormat();
    }

    private applyFormat() {
        this.formatted =
            typeof this.type === 'string' && this.type.toUpperCase() === ObjectTypesEnum.INETNUM.toUpperCase()
                ? IpAddressService.rangeToSlash(this.name)
                : this.name || '';
    }
}
