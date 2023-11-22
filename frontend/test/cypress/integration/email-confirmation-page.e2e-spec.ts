import { EmailConfirmationPage } from '../pages/email-confirmation.page';

describe('Email Confirmation Page', () => {
    const emailConfirmationPage = new EmailConfirmationPage();

    it('should show successful validation page', () => {
        emailConfirmationPage
            .visit('SUCCESS-TOKEN')
            .expectCheckImagePresent()
            .expectEmailConfirmationMsgToContain('Thank you! This email has now been validated. No further action is required.');
    });

    it('should show unsuccessful validation page', () => {
        emailConfirmationPage
            .visit('FAILED-TOKEN-EXPIRATION-DATE')
            .expectExclamationImagePresent()
            .expectEmailConfirmationMsgToContain('Sorry, this link is not valid anymore.');
    });
});
