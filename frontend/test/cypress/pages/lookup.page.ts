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
        return this.expectLinkHrefToContain('a.ripe-stat-button', href);
    }

    expectXmlLinkHref(href: string) {
        return this.expectLinkHrefToContain('a:contains("XML")', href);
    }

    expectPlainTextLinkHref(href: string) {
        return this.expectLinkHrefToContain('a:contains("PLAIN TEXT")', href);
    }

    expectJsonLinkHref(href: string) {
        return this.expectLinkHrefToContain('a:contains("JSON")', href);
    }

    expectLinkHrefToContain(selector: string, href: string) {
        cy.get(selector).invoke('attr', 'href').should('contain', href);
        return this;
    }

    expectVersionToBe(version: string) {
        cy.get('whois-version').should('contain.text', version);
        return this;
    }
}
