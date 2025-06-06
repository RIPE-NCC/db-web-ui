import { Component, Input, OnInit } from '@angular/core';

export interface IFlag {
    colour?: string;
    text: string;
    tooltip: string;
}

@Component({
    selector: 'flag',
    templateUrl: './flag.component.html',
    standalone: false,
})
export class FlagComponent implements OnInit {
    @Input()
    public text: string;
    @Input()
    public tooltip?: string;
    @Input()
    public uppercase?: boolean;

    ngOnInit() {
        if (this.uppercase) {
            this.text = this.text.toUpperCase();
        }
    }
}
