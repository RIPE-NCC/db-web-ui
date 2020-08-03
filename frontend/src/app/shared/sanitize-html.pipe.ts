import {Pipe, PipeTransform, SecurityContext} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";

@Pipe({name: "sanitizeHtml"})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(public sanitizer: DomSanitizer) { }

  public transform(value: string): string {
    // sanitizer removing \n from string because of that we are sanitizer row by row
    return value.split("\n")
      .map(row => this.sanitizer.sanitize(SecurityContext.HTML, this.escapeHtml(row))).join("\n")
  }

  private escapeHtml(unsafe: string) {
    if (unsafe) {
      return unsafe.
      replace(/&/g, '&amp;').
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;').
      replace(/'/g, '&#39;').
      replace(/"/g, '&quot;');
    }
    return '';
  }
}
