import { TestBed } from '@angular/core/testing';

import { IMenu, MenuService } from 'src/app/menu/menu.service';
import { PropertiesService } from 'src/app/properties.service';
import { menuObject } from '../../../src/app/menu/menu.json';

describe('MenuService', () => {
    let service: MenuService;
    let propertiesSpy: jasmine.SpyObj<PropertiesService>;
    beforeEach(() => {
        propertiesSpy = jasmine.createSpyObj('PropertiesService', ['isProdEnv'], {
            ENV: 'prod',
            SHOW_MENU_IDS: [],
        });

        TestBed.configureTestingModule({
            providers: [MenuService, { provide: PropertiesService, useValue: propertiesSpy }],
        });

        service = TestBed.inject(MenuService);
    });

    const spyOnProperty = (propertyName: string) => {
        // @ts-ignore
        return Object.getOwnPropertyDescriptor(propertiesSpy, propertyName).get.and;
    };

    it('should create menu filtered by user roles', () => {
        // mock environment
        propertiesSpy.isProdEnv.and.returnValue(true);
        propertiesSpy.ENV = 'prod';

        // run
        const result: IMenu = service.createMenu(['admin']);

        // assert
        expect(result.main.every((item) => item.roles.includes('admin'))).toBeTrue();
        expect(result.footer.length).toBe(menuObject.footer.length);
    });

    it('should replace title when not prod', () => {
        propertiesSpy.isProdEnv.and.returnValue(false);
        spyOnProperty('ENV').returnValue('rc');

        const result: IMenu = service.createMenu(['admin']);

        // if menu has "RIPE" in a title, it should be replaced
        const hasRcReplacement = result.main.some((item) => item.title.includes('RC'));

        expect(hasRcReplacement).toBeTrue();
    });

    it('should filter menu by SHOW_MENU_IDS if defined', () => {
        spyOnProperty('SHOW_MENU_IDS').returnValue(['resources', 'myresources', 'sponsored']);
        spyOnProperty('ENV').returnValue('prod');
        propertiesSpy.isProdEnv.and.returnValue(true);
        const result: IMenu = service.createMenu(['admin']);

        expect(result.main.length).toBe(2);
        expect(result.main[0].id).toBe('resources');
    });
});
