import {Component, HostListener, Inject} from "@angular/core";
import {PropertiesService} from "./properties.service";
import {WINDOW} from "./core/window.service";
import {Router} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: "app-db-web-ui",
  templateUrl: "app.component.html",
})
export class AppComponent {

  // for mobileView breaking point is 1025 properties.BREAKPOINTS_MOBILE_VIEW
  public isDesktopView: boolean;
  public isOpenMenu: boolean;
  private innerWidth: number;

  constructor(public properties: PropertiesService,
              private router: Router,
              private location: Location,
              @Inject(WINDOW) public window: any) {
    this.skipHash();
  }

  public ngOnInit() {
    this.mobileOrDesktopView();
    this.isOpenMenu = this.isDesktopView;
  }

  private skipHash() {
    const hash = this.window.location.hash;
    if (hash) {
      this.router.navigateByUrl(hash.substring(1));
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.mobileOrDesktopView();
  }

  open = (event: any) => {
    this.isOpenMenu = event.detail.open;
  }

  public mobileOrDesktopView() {
    this.innerWidth = this.window.innerWidth;
    this.isDesktopView =  this.innerWidth >= this.properties.BREAKPOINTS_MOBILE_VIEW;
    this.isOpenMenu = this.isDesktopView;
  }

  public isQueryPage(): boolean {
    return this.location.path().startsWith('/query');
  }
}
