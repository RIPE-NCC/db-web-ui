import {Component, HostListener, Inject} from "@angular/core";
import {PropertiesService} from "./properties.service";
import {WINDOW} from "./core/window.service";
import {Router} from "@angular/router";

@Component({
  selector: "app-db-web-ui",
  templateUrl: "app.component.html",
})
export class AppComponent {

  public isIE: boolean;
  public isIEOrEdge: boolean;
  public isOpenMenu: boolean;
  private innerWidth: number;

  constructor(public properties: PropertiesService,
              private router: Router,
              @Inject(WINDOW) private window: any) {
    this.skipHash();
  }

  public ngOnInit() {
    this.isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
    // TODO isIEOrEdge REMOVE AFTER 1st March 2021
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    this.openOrCloseMenu();
  }

  private skipHash() {
    const hash = this.window.location.hash;
    if (hash) {
      this.router.navigateByUrl(hash.substring(1));
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.openOrCloseMenu();
  }

  open = (event: any) => {
    this.isOpenMenu = event.detail.open;
  }

  public openOrCloseMenu() {
    this.innerWidth = window.innerWidth;
    this.isOpenMenu = this.innerWidth >= 768;
  }
}
