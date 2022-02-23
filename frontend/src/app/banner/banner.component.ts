import {Component, Input} from "@angular/core";

@Component({
    selector: "banner",
    template: `<p id="envbanner" class="envbanner alert orangebackground" style="text-align: center">
                    <span id="envBannerId" style="text-transform: uppercase">{{ title }}</span><br>
                    {{ textMessage }}
                </p>`,
})
export class BannerComponent {

    @Input()
    public title: string;
    @Input()
    public textMessage: string;

    constructor() {}

}
