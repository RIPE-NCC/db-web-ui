import { ResourcesDetailPage, ResourcesPage } from '../pages/resources.page';

describe('Resources detail', () => {
    const resourcesPage = new ResourcesPage();
    let resourcesDetailPage: ResourcesDetailPage;

    describe('for an ASSIGNED PI inetnum', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('inetnum/192.87.0.0%20-%20192.87.255.255/');
        });

        it('should show whois object attributes', () => {
            resourcesDetailPage
                .getWhoisObjectViewer()
                .expectShowMoreButtonExist(false)
                .expectAttributesSize(14)
                .expectAttributeToContainKeyAndValue(0, 'inetnum', '192.87.0.0 - 192.87.255.255')
                .expectAttributeToContainKeyAndValue(1, 'netname', 'RU-1C-20160322')
                .expectAttributeToContainKeyAndValue(2, 'descr', 'first line of description # comment')
                .expectAttributeToContainKeyAndValue(3, 'country', 'FI')
                .expectAttributeToContainKeyAndValue(4, 'org', 'ORG-EIP1-RIPE')
                .expectAttributeToContainKeyAndValue(5, 'sponsoring-org', 'ORG-LA538-RIPE')
                .expectAttributeToContainKeyAndValue(6, 'admin-c', 'MV10039-RIPE')
                .expectAttributeToContainKeyAndValue(7, 'tech-c', 'inty1-ripe')
                .expectAttributeToContainKeyAndValue(8, 'status', 'ASSIGNED PI')
                .expectAttributeToContainKeyAndValue(9, 'mnt-by', 'TPOL888-MNT')
                .expectAttributeToContainKeyAndValue(10, 'remarks', '# should show remarks starting with hash')
                .expectAttributeToContainKeyAndValue(11, 'created', '2016-03-22T13:48:02Z')
                .expectAttributeToContainKeyAndValue(12, 'last-modified', '2016-04-26T14:28:28Z')
                .expectAttributeToContainKeyAndValue(13, 'source', 'RIPE')
                .expectRipeStatLinkHref('https://stat.ripe.net/192.87.0.0 - 192.87.255.255?sourceapp=ripedb');

            resourcesDetailPage
                .expectRowsOnTable('more-specifics', 2)
                // contain href in a tag what guarantees option "Open in new tab" in context menu
                .expectRowOnTableToContainHref('more-specifics', 0, 0, 'myresources/detail/inetnum/192.87.0.0%20-%20192.87.0.255/false')
                .expectRowOnTableToContainText('more-specifics', 0, 0, '192.87.0.0/24')
                .expectRowOnTableToContainText('more-specifics', 0, 1, 'LEGACY')
                .expectRowOnTableToContainText('more-specifics', 0, 2, 'SNET-HOMELAN')
                .expectRowOnTableToContainHref('more-specifics', 1, 0, 'myresources/detail/inetnum/192.87.1.0%20-%20192.87.1.255/false')
                .expectRowOnTableToContainText('more-specifics', 1, 0, '192.87.1.0/24')
                .expectRowOnTableToContainText('more-specifics', 1, 1, 'LEGACY')
                .expectRowOnTableToContainText('more-specifics', 1, 2, 'NFRA')
                .expectBackToMyResourcesButtonToExist(true)
                .expectSiteMapButtonToExist(true)
                .clickLinkOnTable('more-specifics', '192.87.0.0/24')
                .expectRowOnTableToContainText('more-specifics', 0, 0, '192.87.0.80/28')
                .expectBackToMyResourcesButtonToExist(true)
                .expectSiteMapButtonToExist(true);
        });

        it('should not display address usage', () => {
            resourcesDetailPage.expectRowsOnTable('more-specifics', 2);
            resourcesDetailPage.expectIpUsageToExist(false);
        });

        it('should show the remarks field starting with hash (#)', () => {
            resourcesDetailPage.getWhoisObjectViewer().expectAttributeToContainKeyAndValue(10, 'remarks', '# should show remarks starting with hash');
        });

        it('should show comment behind value starting with hash (#)', () => {
            resourcesDetailPage.getWhoisObjectViewer().expectAttributeToContainKeyAndValue(2, 'descr', 'first line of description # comment');
        });
    });

    describe('for inetnum with flags', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('inetnum/185.51.48.0%20-%20185.51.55.255/false');
        });

        it('should contain 8 flags, 2 tickets and 2 dates', () => {
            resourcesDetailPage
                .expectFlagsSize(8)
                .expectFlagToContainText(2, '2014-03-21')
                .expectFlagToContainText(3, 'NCC#2014033634')
                .expectFlagToContainText(4, '2014-03-21')
                .expectFlagToContainText(5, 'NCC#2014033636')
                .expectFlagToContainText(6, 'IRR')
                .expectFlagToContainText(7, 'rDNS');
        });

        it('should contain Associated Route Objects table', () => {
            resourcesDetailPage
                .expectRowsOnTable('associated-route-objects', 3)
                .expectRowOnTableToContainHref('associated-route-objects', 0, 0, 'query?source=GRS&searchtext=AS8100&bflag=false&dflag=false&rflag=true')
                .expectRowOnTableToContainText('associated-route-objects', 0, 0, 'AS8100')
                .expectRowOnTableToContainText('associated-route-objects', 0, 1, '185.51.49.0/24')
                .expectRowOnTableToContainHref('associated-route-objects', 1, 0, 'query?source=GRS&searchtext=AS41108&bflag=false&dflag=false&rflag=true')
                .expectRowOnTableToContainText('associated-route-objects', 1, 0, 'AS41108')
                .expectRowOnTableToContainText('associated-route-objects', 1, 1, '185.51.50.0/24')
                .expectRowOnTableToContainHref('associated-route-objects', 2, 0, 'query?source=GRS&searchtext=AS41108&bflag=false&dflag=false&rflag=true')
                .expectRowOnTableToContainText('associated-route-objects', 2, 0, 'AS41108')
                .expectRowOnTableToContainText('associated-route-objects', 2, 1, '185.51.51.0');
        });

        it('should contain Associated Domain Objects table', () => {
            resourcesDetailPage
                .expectRowsOnTable('associated-domain-objects', 3)
                .expectRowOnTableToContainHref('associated-domain-objects', 0, 0, 'lookup?source=RIPE&key=49.51.185.in-addr.arpa&type=domain')
                .expectRowOnTableToContainText('associated-domain-objects', 0, 0, '49.51.185.in-addr.arpa')
                .expectRowOnTableToContainText('associated-domain-objects', 0, 1, 'Manage')
                .expectRowOnTableToContainHref('associated-domain-objects', 0, 1, 'webupdates/modify/RIPE/domain/49.51.185.in-addr.arpa')
                .expectRowOnTableToContainHref('associated-domain-objects', 1, 0, 'lookup?source=RIPE&key=50.51.185.in-addr.arpa&type=domain')
                .expectRowOnTableToContainText('associated-domain-objects', 1, 0, '50.51.185.in-addr.arpa')
                .expectRowOnTableToContainHref('associated-domain-objects', 2, 0, 'lookup?source=RIPE&key=51.51.185.in-addr.arpa&type=domain')
                .expectRowOnTableToContainText('associated-domain-objects', 2, 0, '51.51.185.in-addr.arpa');
        });
    });

    describe('for inetnum with usage status', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('inetnum/194.171.0.0%20-%20194.171.255.255/');
        });

        it('should display address usage', () => {
            resourcesDetailPage
                .expectIpUsageToExist(true)
                .expectIpUsagePercentageSize(2)
                .expectIpUsagePercentageToContainText('Used', '80%')
                .expectIpUsagePercentageToContainText('Free', '20%');
        });

        it('should contain 2 flags, 0 tickets and 0 dates', () => {
            resourcesDetailPage.expectFlagsSize(2);
        });
    });

    describe('for inet6num', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('inet6num/2001:7f8::%2F29/');
        });

        it('should show whois object attributes', () => {
            resourcesDetailPage
                .getWhoisObjectViewer()
                .expectShowMoreButtonExist(false)
                .expectAttributesSize(15)
                .expectAttributeToContainKeyAndValue(0, 'inet6num', '2001:7f8::/29')
                .expectAttributeToContainKeyAndValue(1, 'netname', 'EU-ZZ-2001-07F8')
                .expectAttributeToContainKeyAndValue(2, 'org', 'ORG-NCC1-RIPE')
                .expectAttributeToContainKeyAndValue(3, 'descr', 'RIPE Network Coordination Centre')
                .expectAttributeToContainKeyAndValue(4, 'descr', 'block for RIR assignments')
                .expectAttributeToContainKeyAndValue(13, 'last-modified', '2011-12-30T07:49:39Z')
                .expectAttributeToContainKeyAndValue(14, 'source', 'RIPE');

            resourcesDetailPage
                .expectRowsOnTable('more-specifics', 2)
                .expectRowOnTableToContainText('more-specifics', 0, 0, '2001:7f8::/48')
                .expectRowOnTableToContainText('more-specifics', 0, 1, 'ASSIGNED PI')
                .expectRowOnTableToContainText('more-specifics', 0, 2, 'DE-CIX-IXP-20010913')
                .expectRowOnTableToContainText('more-specifics', 1, 0, '2001:7f8:1::/48')
                .expectRowOnTableToContainText('more-specifics', 1, 1, 'ASSIGNED PI')
                .expectRowOnTableToContainText('more-specifics', 1, 2, 'AMS-IX-20010913')
                .expectTablePaginationToContainText('more-specifics', 'Total more specifics')
                .filterTable('more-specifics', 'nooo')
                .expectTablePaginationToContainText('more-specifics', 'Showing 0 out of 2');
        });
    });

    describe('for aut-num with loads of attributes', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('aut-num/AS204056/');
        });

        it('should show a partial view that can be expanded', () => {
            resourcesDetailPage
                .getWhoisObjectViewer()
                .expectShowMoreButtonExist(true)
                .expectAttributesSize(25)
                .expectAttributeToContainKeyAndValue(0, 'aut-num', 'AS204056')
                .expectAttributeToContainKeyAndValue(1, 'as-name', 'asnametest')
                .expectAttributeToContainKeyAndValue(2, 'org', 'ORG-EIP1-RIPE')
                .expectAttributeToContainKeyAndValue(3, 'import', 'from AS3254 accept ANY')
                .expectAttributeToContainKeyAndValue(4, 'export', 'to AS3254 announce AS204056')
                .expectAttributeToContainKeyAndValue(5, 'import', 'from as3333 accept ANY')
                .expectAttributeToContainKeyAndValue(6, 'export', 'to as3333 announce AS204056')
                .expectAttributeToContainKeyAndValue(7, 'admin-c', 'MV10039-RIPE')
                .expectAttributeToContainKeyAndValue(8, 'tech-c', 'inty1-ripe')
                .expectAttributeToContainKeyAndValue(
                    9,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    10,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    11,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    12,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    13,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    14,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    15,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    16,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    17,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    18,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    19,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    20,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    21,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    22,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    23,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    24,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .clickOnShowMoreButton()
                .expectAttributesSize(62)
                .expectAttributeToContainKeyAndValue(0, 'aut-num', 'AS204056')
                .expectAttributeToContainKeyAndValue(1, 'as-name', 'asnametest')
                .expectAttributeToContainKeyAndValue(2, 'org', 'ORG-EIP1-RIPE')
                .expectAttributeToContainKeyAndValue(3, 'import', 'from AS3254 accept ANY')
                .expectAttributeToContainKeyAndValue(4, 'export', 'to AS3254 announce AS204056')
                .expectAttributeToContainKeyAndValue(5, 'import', 'from as3333 accept ANY')
                .expectAttributeToContainKeyAndValue(6, 'export', 'to as3333 announce AS204056')
                .expectAttributeToContainKeyAndValue(7, 'admin-c', 'MV10039-RIPE')
                .expectAttributeToContainKeyAndValue(8, 'tech-c', 'inty1-ripe')
                .expectAttributeToContainKeyAndValue(
                    9,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    10,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    11,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    53,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(
                    54,
                    'remarks',
                    'For information on "status:" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources',
                )
                .expectAttributeToContainKeyAndValue(55, 'status', 'ASSIGNED')
                .expectAttributeToContainKeyAndValue(56, 'mnt-by', 'RIPE-NCC-END-MNT')
                .expectAttributeToContainKeyAndValue(57, 'mnt-by', 'RU1C-MNT')
                .expectAttributeToContainKeyAndValue(58, 'mnt-routes', 'RU1C-MNT')
                .expectAttributeToContainKeyAndValue(59, 'created', '2016-03-22T13:43:48Z')
                .expectAttributeToContainKeyAndValue(60, 'last-modified', '2017-03-23T12:08:46Z')
                .expectAttributeToContainKeyAndValue(61, 'source', 'RIPE');

            resourcesDetailPage.expectTableExist('more-specifics', false);
        });

        it('should contain 4 flags, 1 ticket and 1 date, and IRR and rDNS should be on end', () => {
            resourcesDetailPage
                .expectFlagsSize(6)
                .expectFlagToContainText(2, '2017-06-19')
                .expectFlagToContainText(3, 'NCC#201001020355')
                .expectFlagToContainText(4, 'IRR')
                .expectFlagToContainText(5, 'rDNS');
        });

        it('should contain Associated Route Objects table', () => {
            resourcesDetailPage
                .expectTableExist('associated-route-objects', true)
                .expectRowsOnTable('associated-route-objects', 6)
                .expectRowOnTableToContainText('associated-route-objects', 0, 0, 'AS204056')
                .expectRowOnTableToContainHref('associated-route-objects', 0, 0, 'query?source=GRS&searchtext=AS204056&bflag=false&dflag=false&rflag=true')
                .expectRowOnTableToContainText('associated-route-objects', 0, 1, '131.115.0.0/16')
                .expectRowOnTableToContainHref('associated-route-objects', 0, 2, 'webupdates/modify/RIPE/associated-route/131.115.0.0%2F16AS204056')
                .expectRowOnTableToContainText('associated-route-objects', 2, 1, '192.43.165.0/24')
                .expectRowOnTableToContainHref('associated-route-objects', 5, 0, 'query?source=GRS&searchtext=AS204056&bflag=false&dflag=false&rflag=true')
                .expectRowOnTableToContainText('associated-route-objects', 5, 0, 'AS204056')
                .expectRowOnTableToContainText('associated-route-objects', 5, 1, '192.150.84.0/24');
        });
    });

    describe('for out of region aut-num', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = resourcesPage.visitDetails('aut-num/AS36867//');
        });

        it('should show out of region aut-num', () => {
            resourcesDetailPage
                .getWhoisObjectViewer()
                .expectAttributesSize(11)
                .expectAttributeToContainKeyAndValue(0, 'aut-num', 'AS36867')
                .expectAttributeToContainKeyAndValue(1, 'as-name', 'Kokonet-BGP')
                .expectAttributeToContainKeyAndValue(2, 'descr', 'Kokonet Ltd Seychelles ISP')
                .expectAttributeToContainKeyAndValue(3, 'org', 'ORG-Sb3-RIPE')
                .expectAttributeToContainKeyAndValue(4, 'admin-c', 'SNS1-RIPE')
                .expectAttributeToContainKeyAndValue(5, 'tech-c', 'JK9622-RIPE')
                .expectAttributeToContainKeyAndValue(6, 'status', 'OTHER')
                .expectAttributeToContainKeyAndValue(10, 'source', 'RIPE-NONAUTH')
                .expectAttributeToContainLink(0, '?source=ripe-nonauth&key=AS36867&type=aut-num')
                .expectAttributeToContainLink(3, '?source=ripe-nonauth&key=ORG-Sb3-RIPE&type=organisation')
                .expectAttributeToContainLink(4, '?source=ripe-nonauth&key=SNS1-RIPE&type=role')
                .expectAttributeToContainLink(5, '?source=ripe-nonauth&key=JK9622-RIPE&type=person')
                .expectAttributeToContainLink(7, '?source=ripe-nonauth&key=KOKONET-MNT&type=mntner');
        });

        it('should edit and update out of region aut-num', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('KOKONET-MNT').submitModal();
            const whoisObjectEditor = resourcesDetailPage.getWhoisObjectEditor();
            whoisObjectEditor
                .expectFieldExist('abuse-c', false)
                .typeOnField('descr', 'Updated test description')
                .clickAddAttributeOnField('descr')
                .submitModal();
            whoisObjectEditor
                .expectFieldExist('abuse-c', true)
                .clickDeleteAttributeOnField('abuse-c')
                .expectFieldExist('abuse-c', false)
                .expectDisabledField('source', true)
                .clickOnSubmit();
            resourcesDetailPage.expectSuccessMessage('Your object has been successfully updated.');
        });

        it('should contain 2 flags', () => {
            resourcesDetailPage.expectFlagsSize(2).expectFlagToContainText(0, 'OTHER').expectFlagToContainText(1, 'Kokonet-BGP');
        });
    });
});
