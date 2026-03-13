import { MenuService } from '../../../src/app/menu/menu.service';

describe('MenuService', () => {
    let service: MenuService;

    beforeEach(() => {
        service = new MenuService();
    });

    it('should return false when activeMenu is null', () => {
        expect(service.isActiveDBMenu()).toBeFalse();
    });

    it('should return true when activeMenu is db menu (query)', () => {
        service.setActiveMenu();
        expect(service.isActiveDBMenu()).toBeTrue();
        expect(service.isActiveResourcesMenu()).toBeFalse();
    });
});
