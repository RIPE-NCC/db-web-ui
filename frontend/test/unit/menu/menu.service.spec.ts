import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MenuService } from 'src/app/menu/menu.service';

describe('MenuService', () => {
    let service: MenuService;
    let routerEvents$: Subject<any>;
    let currentUrl = '';

    beforeEach(() => {
        routerEvents$ = new Subject();

        TestBed.configureTestingModule({
            providers: [
                MenuService,
                {
                    provide: Router,
                    useValue: {
                        get url() {
                            return currentUrl;
                        },
                        events: routerEvents$.asObservable(),
                    },
                },
            ],
        });

        service = TestBed.inject(MenuService);
    });

    it('should return false when activeMenu is null', () => {
        expect(service.isActiveDBMenu()).toBe(false);
        expect(service.isActiveResourcesMenu()).toBe(false);
    });

    it('should set DB menu when url does not match resources', () => {
        currentUrl = '/query';

        service.setActiveMenu();

        expect(service.isActiveDBMenu()).toBe(true);
        expect(service.isActiveResourcesMenu()).toBe(false);
    });

    it('should set RESOURCES menu when url contains myresources', () => {
        currentUrl = '/myresources/overview';

        service.setActiveMenu();

        expect(service.isActiveDBMenu()).toBe(false);
        expect(service.isActiveResourcesMenu()).toBe(true);
    });

    it('should react to NavigationEnd events', () => {
        currentUrl = '/ip-analyser';

        routerEvents$.next(new NavigationEnd(1, '/ip-analyser', '/ip-analyser'));

        expect(service.isActiveResourcesMenu()).toBe(true);
    });
});
