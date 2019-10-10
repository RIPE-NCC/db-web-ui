import {Component} from "@angular/core";
import {PropertiesService} from "./properties.service";

@Component({
  selector: "app-db-web-ui",
  templateUrl: "app.template.html",
})
export class AppComponent {

  constructor(public properties: PropertiesService) {
  }
}
