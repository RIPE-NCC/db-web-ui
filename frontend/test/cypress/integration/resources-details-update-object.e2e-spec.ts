import { ResourcesDetailPage, ResourcesPage } from '../pages/resources.page';

describe('Resources, update object', () => {
    let resourcesDetailPage: ResourcesDetailPage;

    beforeEach(() => {
        cy.setCookie('activeMembershipId', '3629', { path: '/' });
        resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/192.87.0.0%20-%20192.87.255.255/');
    });

    it('should allow editing of the object', () => {
        resourcesDetailPage.clickOnUpdate().typePassword('TPOL888-MNT').disableAssociateCheckbox().submitModal();
        const whoisObjectEditor = resourcesDetailPage.getWhoisObjectEditor();
        whoisObjectEditor.expectFieldExist('abuse-c', false).typeOnField('descr', 'Updated test description').clickAddAttributeOnField('descr').submitModal();
        whoisObjectEditor
            .expectFieldExist('abuse-c', true)
            .clickDeleteAttributeOnField('abuse-c')
            .expectFieldExist('abuse-c', false)
            .expectDisabledField('source', true)
            .clickOnSubmit();
        resourcesDetailPage.expectSuccessMessage('Your object has been successfully updated.');
    });

    describe('not comaintained by ripe', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/3.0.103.0%2520-%25203.0.103.255/false');
        });

        it('should edit netname', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TPOLYCHNIA4-MNT').submitModal();
            // ensure netname is editable and edit it
            resourcesDetailPage
                .getWhoisObjectEditor()
                .expectDisabledField('netname', false)
                .typeOnField('netname', 'some netname')
                // and check the value has changed correctly
                .expectValueInField('netname', 'some netname');
        });

        it('should add org attribute', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TPOLYCHNIA4-MNT').submitModal();
            const whoisObjectEditor = resourcesDetailPage.getWhoisObjectEditor();
            whoisObjectEditor
                .expectFieldExist('org', false)
                .clickAddAttributeOnField('inetnum')
                // add org attribute
                .selectFromList('org')
                .submitModal();

            // and check it's there
            whoisObjectEditor.expectFieldExist('org', true);
        });

        it('should contain delete button for not co-maintained by RIPE-NCC-*-MNT', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TPOLYCHNIA4-MNT').submitModal();
            resourcesDetailPage.getWhoisObjectEditor().expectDeleteObjectButtonExist(true);
        });

        it('should delete resource on click on delete button', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TPOLYCHNIA4-MNT').submitModal();
            resourcesDetailPage.getWhoisObjectEditor().clickDeleteObjectButton().clickOnConfirmDeleteObject();

            cy.expectCurrentUrlToContain(
                'myresources/detail/inetnum/3.0.103.0%20-%203.0.127.255/false?alertMessage=The%20inetnum%20for%203.0.103.0%20-%203.0.103.255%20has%20been%20deleted',
            );
            resourcesDetailPage.expectInfoMessage('The inetnum for 3.0.103.0 - 3.0.103.255 has been deleted');
        });
    });

    describe('comaintained by ripe', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/194.171.0.0%20-%20194.171.255.255/false');
        });

        it('should not contain delete button for co-maintained by RIPE-NCC-*-MNT', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TDACRUZPER2-MNT').submitModal();
            resourcesDetailPage.getWhoisObjectEditor().expectDeleteObjectButtonExist(false);
        });
    });
});
