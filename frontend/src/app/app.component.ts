import {Component} from "@angular/core";
import {PropertiesService} from "./properties.service";

declare var init_mega_menu: any;
declare var init_popover: any;
declare var whois_search: any;

@Component({
  selector: "app-db-web-ui",
  templateUrl: "app.component.html",
})
export class AppComponent {

  constructor(public properties: PropertiesService) {
  }

  public ngOnInit() {
    init_mega_menu();
    init_popover();
    whois_search();
  }
}
