import {Pipe, PipeTransform, SecurityContext} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";

@Pipe({name: "sanitizeImgHtml"})
export class SanitizeImgHtmlPipe implements PipeTransform {

    constructor(public sanitizer: DomSanitizer) { }

    public transform(value: string): string {
        // sanitizer removing \n from string because of that we are sanitizer row by row
        return value.split("\n")
            .map(row => this.sanitizer.sanitize(SecurityContext.HTML, this.escapeImgHtml(row))).join("\n")
    }

    private escapeImgHtml(unsafe: string) {
        return unsafe.replace(/<img/g, "img");
    }
}
