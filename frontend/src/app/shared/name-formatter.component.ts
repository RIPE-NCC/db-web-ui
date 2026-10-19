import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { IpAddressService } from '../myresources/ip-address.service';

@Component({
    selector: 'name-formatter',
    template: `{{ formatted }}`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
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
        this.formatted = IpAddressService.rangeToSlashByType(this.type, this.name);
    }
}
