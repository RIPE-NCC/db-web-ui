import {Component} from "@angular/core";

@Component({
    selector: "ie-banner",
    template: `<p id="envbanner" class="envbanner alert alert-info" style="text-align: center">
        The Internet Explorer (IE11) browser is not supported by this application. Some features may not display or function properly. Please upgrade to a <a href="https://www.ripe.net/about-us/legal/supported-browsers" target='_blank'>supported browser</a>.
                </p>`,
})
export class IeBannerComponent {

    constructor() {}

    public ngOnInit() {}
}
