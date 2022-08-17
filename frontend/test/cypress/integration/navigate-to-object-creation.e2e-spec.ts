import { WebupdatesPage } from '../pages/webupdates.page';

describe('webupdates homepage', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select');
    });

    const selectAndExpect = (objectType: string, title: string) => {
        webupdatesPage.selectObjectType(objectType).clickOnCreateButton().expectFormExist(true).expectHeadingTitleToContain(title);
    };

    [
        'as-set',
        'filter-set',
        'inet-rtr',
        'irt',
        'key-cert',
        'mntner',
        'organisation',
        'peering-set',
        'person',
        'role',
        'route',
        'route6',
        'route-set',
        'rtr-set',
    ].forEach((objectType) => {
        it(`should show an editor for ${objectType}`, () => {
            selectAndExpect(objectType, `Create "${objectType}" object`);
        });
    });

    it('should navigate to create role maintainer pair screen when selected', () => {
        selectAndExpect('role and maintainer pair', 'Create role and maintainer pair');
    });
});
