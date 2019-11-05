import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: "mail-sent",
    templateUrl: "./mail-sent.component.html",
})
export class MailSentComponent {

    public email: string;

    constructor(public activatedRoute: ActivatedRoute) {}

    public ngOnInit() {
        this.email = this.activatedRoute.snapshot.paramMap.get("email");
    }
}
