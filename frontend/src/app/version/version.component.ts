import { Component, OnInit } from "@angular/core";
import {PropertiesService} from "../properties.service";

@Component({
  selector: "version",
  template: `<div class="db-version-footer text-muted">
              RIPE Database Software Version {{ properties.WHOIS_VERSION_DISPLAY_TEXT }} {{properties.DB_WEB_UI_BUILD_TIME}}
            </div>`
})
export class VersionComponent implements OnInit {

  constructor(public properties: PropertiesService) { }

  ngOnInit() {
  }

}
