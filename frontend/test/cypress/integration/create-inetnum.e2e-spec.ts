import { WebupdatesPage } from '../pages/webupdates.page';

describe('The inetnum editor', () => {
    const webupdatesPage = new WebupdatesPage();

    beforeEach(() => {
        webupdatesPage.visit('select').selectObjectType('inetnum').clickOnCreateButton();
    });

    it('should ask for authentication of parent inetnum', () => {
        webupdatesPage
            .expectDisabledSubmitCreate(true)
            .typeOnField('inetnum', '213.159.160.0-213.159.190.255')
            .blurOnField('inetnum')
            .authenticateWithDisabledAssociate('TEST03-MNT')
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

    it('should ask for authentication of parent inetnum and handle a bad password properly', () => {
        webupdatesPage
            .expectDisabledSubmitCreate(true)
            .typeOnField('inetnum', '213.159.160.0-213.159.190.255')
            .blurOnField('inetnum')
            .authenticateWithDisabledAssociate('xxx', true)
            .getModalAuthentication()
            .expectBannerToContain('You have not supplied the correct password for mntner')
            .closeModal();

        webupdatesPage
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
            .expectDisabledSubmitCreate(true);
    });

    it('should not ask for authentication two times if first succeeded', () => {
        webupdatesPage
            .expectDisabledSubmitCreate(true)
            .typeOnField('inetnum', '5.254.68.40/29')
            .blurOnField('inetnum')
            .expectModalToExist(true)
            .authenticateWithDisabledAssociate('TEST02-MNT')
            .typeOnField('netname', 'SOMETHING')
            .selectFromNgSelect('country', 'Afghanistan [AF]')
            .typeOnField('admin-c', 'TSTADMINC-RIPE')
            .typeOnField('tech-c', 'TSTADMINC-RIPE')
            .expectOptionSizeFromNgSelect('status', 4)
            .selectFromNgSelect('status', 'ASSIGNED PA')
            .expectDisabledSubmitCreate(false);

        webupdatesPage.typeOnField('inetnum', '5.254.68.40/29').blurOnField('inetnum').expectModalToExist(false);
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
            .authenticateWithDisabledAssociate('TEST11-MNT')
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
            .authenticateWithDisabledAssociate('TEST02-MNT')
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
        webupdatesPage
            .typeOnField('inetnum', '5.254.68.40/29')
            .blurOnField('inetnum')
            .authenticateWithDisabledAssociate('TEST02-MNT')
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

    it('should show authenticate error when modal window is dismissed', () => {
        webupdatesPage.typeOnField('inetnum', '5.254.68.40/29').blurOnField('inetnum').getModalAuthentication().closeModal();
        webupdatesPage.expectErrorOnField('inetnum', 'Failed to authenticate parent resource').expectErrorMessage('Failed to authenticate parent resource');
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
            .authenticateWithDisabledAssociate('TEST03-MNT')
            .expectOptionSizeFromNgSelect('status', 1)
            .expectOptionFromNgSelect('status', 'ASSIGNED PA');
    });
});
