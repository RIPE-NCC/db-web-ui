import {Component, Input} from "@angular/core";

export interface IFlag {
    colour?: string;
    text: string;
    tooltip: string;
}

@Component({
    selector: "flag",
    templateUrl: "./flag.component.html",
})
export class FlagComponent {

    @Input()
    public text: string;
    @Input()
    public tooltip?: string;
    @Input()
    public uppercase?: boolean;
    public isOpen = false;
    public timer: any;

    constructor() {
    }

    ngOnInit() {
        if (this.uppercase) {
            this.text = this.text.toUpperCase();
        }
    }

    public in() {
        this.isOpen = true;
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    public out() {
        if (this.isOpen) {
            this.timer = setTimeout(() => {
                this.isOpen = false;
                this.timer = null;
            }, 66);
        }
    }
}
