import {Component, Inject} from "@angular/core";
import {PropertiesService} from "./properties.service";
import {WINDOW} from "./core/window.service";
import {Router} from "@angular/router";

declare var init_mega_menu: any;
declare var init_popover: any;
declare var whois_search: any;

@Component({
  selector: "app-db-web-ui",
  templateUrl: "app.component.html",
})
export class AppComponent {

  constructor(public properties: PropertiesService,
              private router: Router,
              @Inject(WINDOW) private window: any) {
    this.skipHash();
  }

  public ngOnInit() {
    init_mega_menu();
    init_popover();
    whois_search();
  }

  private skipHash() {
    const hash = this.window.location.hash;
    if (hash) {
      this.router.navigateByUrl(hash.substring(1));
    }
  }
}
