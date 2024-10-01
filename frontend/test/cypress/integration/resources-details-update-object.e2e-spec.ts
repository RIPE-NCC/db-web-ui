import { ResourcesDetailPage, ResourcesPage } from '../pages/resources.page';

describe('Resources, update object', () => {
    let resourcesDetailPage: ResourcesDetailPage;

    beforeEach(() => {
        cy.setCookie('activeMembershipId', '3629', { path: '/' });
        resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/192.87.0.0%20-%20192.87.255.255/');
    });

    it('should allow editing of the object', () => {
        resourcesDetailPage.clickOnUpdate().typePassword('TST01-MNT').disableAssociateCheckbox().submitModal();
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

    it('should show non Latin1 character error', () => {
        resourcesDetailPage.clickOnUpdate().typePassword('TST01-MNT').disableAssociateCheckbox().submitModal();
        const whoisObjectEditor = resourcesDetailPage.getWhoisObjectEditor();
        whoisObjectEditor
            .typeOnField('netname', 'UNSPECIFIEDč')
            .typeOnField('org', 'remarksŠ')
            .typeOnField('tech-c', 'č')
            .typeOnField('remarks', 'remarksŠ')
            .typeOnField('org', 'remarksŠ')
            .expectDisabledSubmit(true)
            .expectErrorOnField('netname', 'You can only enter latin1 characters')
            .expectErrorOnField('org', 'You can only enter latin1 characters')
            .expectErrorOnField('tech-c', 'You can only enter latin1 characters')
            .expectErrorOnField('remarks', 'You can only enter latin1 characters');
    });

    describe('not comaintained by ripe', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/3.0.103.0%2520-%25203.0.103.255/false');
        });

        it('should edit netname', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TST03-MNT').submitModal();
            // ensure netname is editable and edit it
            resourcesDetailPage
                .getWhoisObjectEditor()
                .expectDisabledField('netname', false)
                .typeOnField('netname', 'some netname')
                // and check the value has changed correctly
                .expectValueInField('netname', 'some netname');
        });

        it('should add org attribute', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TST03-MNT').submitModal();
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
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TST03-MNT').submitModal();
            resourcesDetailPage.getWhoisObjectEditor().expectDeleteObjectButtonExist(true);
        });

        it('should delete resource on click on delete button', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TST03-MNT').submitModal();
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

    describe('which has ALLOCATED PA status', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/193.228.143.0%20-%20193.228.143.255/false');
        });

        it('should have only status ALLOCATED-ASSIGNED PA', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TESTMD-MNT').submitModal();
            resourcesDetailPage
                .expectModalToExist(false)
                .expectFieldToExist('status', true)
                .expectDisabledField('status', false)
                .expectOptionSizeFromNgSelect('status', 1)
                .expectOptionFromNgSelect('status', 'ALLOCATED-ASSIGNED PA');
        });
    });

    describe('which has ALLOCATED-ASSIGNED PA status', () => {
        beforeEach(() => {
            cy.setCookie('activeMembershipId', '3629', { path: '/' });
            resourcesDetailPage = new ResourcesPage().visitDetails('inetnum/80.73.136.0%20-%2080.73.143.255/false');
        });

        it('should have only status ALLOCATED PA', () => {
            resourcesDetailPage.clickOnUpdate().disableAssociateCheckbox().typePassword('TESTMD-MNT').submitModal();
            resourcesDetailPage
                .expectModalToExist(false)
                .expectFieldToExist('status', true)
                .expectDisabledField('status', false)
                .expectOptionSizeFromNgSelect('status', 1)
                .expectOptionFromNgSelect('status', 'ALLOCATED PA');
        });
    });
});
