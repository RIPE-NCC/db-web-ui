import {Component, Input} from "@angular/core";

@Component({
    selector: "flag",
    templateUrl: "./flag.component.html",
})
export class FlagComponent {

    @Input()
    public text: string;
    @Input()
    public tooltip: string;
    public isOpen = false;
    public timer: any;

    constructor() {
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
