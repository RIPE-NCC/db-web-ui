import { LookupPage } from '../pages/lookup.page';

describe('lookup', () => {
    const lookupPage = new LookupPage();

    describe('The lookup page', () => {
        beforeEach(() => {
            lookupPage.visit('RIPE', 'inetnum', '193.0.0.0 - 193.0.0.63');
        });

        it('should be able to show an object', () => {
            lookupPage.expectHeaderToExist(true).expectHeaderToContain('Responsible organisation: Internet Assigned Numbers Authority');

            lookupPage
                .getWhoisObjectViewer()
                .expectAttributesSize(25)
                .expectHighlightCheckboxToContainText('Highlight RIPE NCC managed values')
                .clickOnShowEntireObject()
                .expectAttributesSize(36);
        });

        it('should show the remarks field starting with hash (#)', () => {
            lookupPage.getWhoisObjectViewer().expectAttributeToContainKeyAndValue(4, 'remarks', '# comments starting with hash');
        });

        it('should show comment behind value starting with hash (#)', () => {
            lookupPage
                .getWhoisObjectViewer()
                .expectAttributeToContainKeyAndValue(2, 'descr', 'IPv4 address block not managed by the RIPE ibihvjg # test shown comment');
        });

        it('should show not filtered object', () => {
            lookupPage.getWhoisObjectViewer().clickOnShowEntireObject().expectAttributeToContainKeyAndValue(25, 'notify', '***@ripe.net');
        });

        it('should show version of whois after searching', () => {
            lookupPage.expectVersionToBe('RIPE Database Software Version 1.97-SNAPSHOT');
        });
    });
    describe('The lookup page for organisation', () => {
        beforeEach(() => {
            lookupPage.visit('RIPE', 'organisation', 'ORG-RIEN1-RIPE');
        });

        it('should show not filtered object', () => {
            lookupPage
                .expectHeaderToExist(false)
                .getWhoisObjectViewer()
                .expectAttributesSize(22)
                .expectAttributeToContainKeyAndValue(10, 'e-mail', '***@ripe.net')
                .expectAttributeToContainKeyAndValue(15, 'notify', '***@ripe.net');
        });

        it('should show version of whois after searching', () => {
            lookupPage.expectVersionToBe('RIPE Database Software Version 1.97-SNAPSHOT');
        });
    });

    describe('The lookup page with out of region object from ripe db', () => {
        beforeEach(() => {
            lookupPage.visit('ripe', 'route', '211.43.192.0/19AS9777');
        });

        it('should be able to show an out of region object from ripe db', () => {
            lookupPage
                .expectJsonLinkHref('/ripe/route/211.43.192.0/19AS9777.json')
                .expectXmlLinkHref('/ripe/route/211.43.192.0/19AS9777.xml')
                .expectPlainTextLinkHref('/ripe/route/211.43.192.0/19AS9777.txt')
                .expectHeaderToExist(false)
                .getWhoisObjectViewer()
                .expectAttributesSize(9)
                .expectRipeStatLinkHref('https://stat.ripe.net/211.43.192.0/19?sourceapp=ripedb')
                .expectAttributeToContainLink(3, '?source=ripe-nonauth&key=AS4663-RIPE-MNT&type=mntner')
                .expectAttributeToContainKeyAndValue(6, 'descr', '# comment')
                .expectAttributeToContainKeyAndValue(7, 'notify', '***@npix.net');
        });

        it('should show version of whois after searching', () => {
            lookupPage.expectVersionToBe('RIPE Database Software Version 1.97-SNAPSHOT');
        });
    });
});
