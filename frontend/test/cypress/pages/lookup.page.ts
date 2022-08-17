import { WhoisObjectViewer } from './components/whois-object-viewer.component';

export class LookupPage {
    visit(source: string, type: string, key: string) {
        cy.visit({ url: 'lookup', qs: { source, type, key } });
        return this;
    }

    getWhoisObjectViewer() {
        return new WhoisObjectViewer();
    }

    expectHeaderToContain(text: string) {
        cy.get('lookup .lookupheader').should('contain.text', text);
        return this;
    }

    expectHeaderToExist(exist: boolean) {
        cy.get('lookup .lookupheader').should(exist ? 'exist' : 'not.exist');
        return this;
    }

    expectRipeStatLinkHref(href: string) {
        return this.expectLinkHref('a.ripe-stat-button', href);
    }

    expectXmlLinkHref(href: string) {
        return this.expectLinkHref('a:contains("XML")', href);
    }

    expectJsonLinkHref(href: string) {
        return this.expectLinkHref('a:contains("JSON")', href);
    }

    expectLinkHref(selector: string, href: string) {
        cy.get(selector)
            .should('have.attr', 'href')
            .then((val) => expect(val).to.contain(href));
        return this;
    }

    expectVersionToBe(version: string) {
        cy.get('whois-version').should('contain.text', version);
        return this;
    }
}
