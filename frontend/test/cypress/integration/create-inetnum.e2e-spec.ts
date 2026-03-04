import createError from '../../e2e/mocks/e2eTest/1c9396eb287bd4fcdb8fd47ea0e3a453f2f3533d.json';
import { WebupdatesPage } from '../pages/webupdates.page';

describe('The inetnum editor', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select').selectObjectType('inetnum').clickOnCreateButton();
    });

    it('should ask for authentication of parent inetnum', () => {
        cy.intercept('GET', '**/db-web-ui/api/user/mntners', {
            statusCode: 200,
            body: [
                {
                    mine: true,
                    auth: ['SSO'],
                    type: 'mntner',
                    key: 'TEST03-MNT',
                },
            ],
        });
        webupdatesPage
            .expectDisabledSubmitCreate(true)
            .typeOnField('inetnum', '213.159.160.0-213.159.190.255')
            .blurOnField('inetnum')
            .typeOnField('netname', 'bogus-netname1')
            .selectFromNgSelect('country', 'Afghanistan [AF]')
            .typeOnField('admin-c', 'aa1-ripe')
            .typeOnField('tech-c', 'aa1-ripe')
            .expectOptionSizeFromNgSelect('status', 4)
            .expectOptionFromNgSelect('status', 'AGGREGATED-BY-LIR')
            .expectOptionFromNgSelect('status', 'ASSIGNED PA')
            .expectOptionFromNgSelect('status', 'LIR-PARTITIONED PA')
            .expectOptionFromNgSelect('status', 'SUB-ALLOCATED PA')
            .selectFromNgSelect('status', 'ASSIGNED PA')
            .expectDisabledSubmitCreate(false);
    });

    it('should show an editor for inet6num', () => {
        webupdatesPage
            .visit('select')
            .selectObjectType('inet6num')
            .clickOnCreateButton()
            .expectHeadingTitleToContain('Create "inet6num" object')
            .expectDisabledSubmitCreate(true)
            .typeOnField('inet6num', '2001:888:2000::/38')
            .blurOnField('inet6num')
            .expectOptionSizeFromNgSelect('status', 2)
            .expectOptionFromNgSelect('status', 'AGGREGATED-BY-LIR')
            .expectOptionFromNgSelect('status', 'ASSIGNED');
    });

    it('should sanitized img and script tag - XSS attack', () => {
        webupdatesPage
            .typeOnField(
                'inetnum',
                "<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>",
            )
            .blurOnField('inetnum')
            .typeOnField(
                'netname',
                "<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>",
            )
            .blurOnField('netname')
            .selectFromNgSelect('country', 'Afghanistan [AF]')
            .typeOnField(
                'admin-c',
                "<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>",
            )
            .typeOnField(
                'tech-c',
                "<img src='https://cdn.theatlantic.com/assets/media/img/photo/2019/03/national-puppy-day-photos/p15_1335849737/main_900.jpg?1553363469'/>",
            )
            .selectFromNgSelect('status', 'ASSIGNED PA')
            .submitForm()
            .expectErrorOnField('inetnum', 'Syntax error in img src=')
            .expectErrorOnField('netname', 'Syntax error in img src=')
            .expectErrorOnField('admin-c', 'Syntax error in img src=')
            .expectErrorOnField('tech-c', 'Syntax error in img src=');
    });

    it('should open description just under field on click on question mark', () => {
        webupdatesPage
            .expectHelpToExist('inetnum', false)
            .clickHelpOnField('inetnum')
            .expectHelpToExist('inetnum', true)
            .expectHelpToContain('inetnum', 'Specifies a range of IPv4 that the inetnum object presents.')
            .expectHelpToExist('netname', false)
            .clickHelpOnField('netname')
            .expectHelpToExist('inetnum', true)
            .expectHelpToExist('netname', true)
            .clickHelpOnField('inetnum')
            .expectHelpToExist('inetnum', false)
            .expectHelpToExist('netname', true);
    });

    it('should enable submit button', () => {
        webupdatesPage
            .typeOnField('inetnum', '5.254.68.40/29')
            .blurOnField('inetnum')
            .typeOnField('netname', 'SOMETHING')
            .selectFromNgSelect('country', 'Afghanistan [AF]')
            .typeOnField('admin-c', 'TSTADMINC-RIPE')
            .typeOnField('tech-c', 'TSTADMINC-RIPE')
            .expectDisabledSubmitCreate(true)
            .expectOptionSizeFromNgSelect('status', 4)
            .expectOptionFromNgSelect('status', 'AGGREGATED-BY-LIR')
            .expectOptionFromNgSelect('status', 'ASSIGNED PA')
            .expectOptionFromNgSelect('status', 'LIR-PARTITIONED PA')
            .expectOptionFromNgSelect('status', 'SUB-ALLOCATED PA')
            .selectFromNgSelect('status', 'ASSIGNED PA')
            .expectDisabledSubmitCreate(false);
    });

    it('should show field validation errors', () => {
        cy.intercept('POST', '/db-web-ui/api/whois/RIPE/inetnum', {
            statusCode: 400,
            body: createError,
        }).as('createItem');

        webupdatesPage
            .typeOnField('inetnum', '5.254.68.40/29')
            .blurOnField('inetnum')
            .typeOnField('netname', 'SOMETHING.')
            .selectFromNgSelect('country', 'Afghanistan [AF]')
            .typeOnField('admin-c', 'TSTADMINC-RIPE')
            .typeOnField('tech-c', 'TSTADMINC-RIPE')
            .expectDisabledSubmitCreate(true)
            .expectOptionSizeFromNgSelect('status', 4)
            .expectOptionFromNgSelect('status', 'AGGREGATED-BY-LIR')
            .expectOptionFromNgSelect('status', 'ASSIGNED PA')
            .expectOptionFromNgSelect('status', 'LIR-PARTITIONED PA')
            .expectOptionFromNgSelect('status', 'SUB-ALLOCATED PA')
            .selectFromNgSelect('status', 'ASSIGNED PA')
            .submitForm()
            .expectErrorOnField('inetnum', 'Value 5.254.68.40/29 converted to 5.254.68.40 - 5.254.68.47')
            .expectErrorOnField('netname', 'Syntax error in SOMETHING.');
    });

    it('should show error message above field and in banner for existing resource', () => {
        webupdatesPage
            .typeOnField('inetnum', '5.154.68.40/29')
            .blurOnField('inetnum')
            .expectErrorOnField('inetnum', 'inetnum 5.154.68.40 - 5.154.68.47 already exists')
            .expectErrorMessage('inetnum 5.154.68.40/29 already exists');
    });

    it('should prefill default maintainer when changing organization', () => {
        webupdatesPage.selectOrganization('WTest').expectMaintainerToContain('etchells-mnt');
    });

    it('should offer correct statuses when parent inetnum is AGGREGATED-BY-LIR', () => {
        webupdatesPage
            .expectDisabledSubmitCreate(true)
            // should offer all default statuses
            .expectOptionSizeFromNgSelect('status', 6)
            .expectOptionFromNgSelect('status', 'ASSIGNED PA')
            .expectOptionFromNgSelect('status', 'ASSIGNED PA')
            .expectOptionFromNgSelect('status', 'ASSIGNED PI')
            .expectOptionFromNgSelect('status', 'LEGACY')
            .expectOptionFromNgSelect('status', 'LIR-PARTITIONED PA')
            .expectOptionFromNgSelect('status', 'SUB-ALLOCATED PA')
            // after specifying inetnum statuses depend on parent status
            .typeOnField('inetnum', '5.104.73.0 - 5.104.73.255')
            .blurOnField('inetnum')
            .expectOptionSizeFromNgSelect('status', 1)
            .expectOptionFromNgSelect('status', 'ASSIGNED PA');
    });
});
