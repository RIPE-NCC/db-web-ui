import { VersionsViewerComponent } from './components/versions-viewer.component';

export class VersionsPage {
    visit(source: string, type: string, key: string, from?: string, searchtext?: string) {
        const qs: any = { source, type, key };
        if (from) qs.from = from;
        if (searchtext) qs.searchtext = searchtext;
        cy.visit({ url: 'versions', qs });
        return this;
    }

    getVersionsViewer() {
        return new VersionsViewerComponent();
    }

    expectVersionToBe(version: string) {
        cy.get('whois-version').should('contain.text', version);
        return this;
    }

    expectedNoImgTag() {
        cy.get('whois-version img').should('not.exist');
        return this;
    }

    expectedNoScriptTag() {
        cy.get('whois-version script').should('not.exist');
        return this;
    }
}
