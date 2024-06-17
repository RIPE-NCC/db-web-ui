import { FeedbackSupportPage } from '../pages/feedback-support.page';

describe('Feedback support dialog', () => {
    const feedbackSupportPage = new FeedbackSupportPage();

    beforeEach(() => {
        feedbackSupportPage.visit();
        feedbackSupportPage.clickFeedbackSupportMenuItem();
    });

    it('should open dialog on click', () => {
        feedbackSupportPage.expectDialogTitle('Feedback and Support');
    });

    it('should show all dialog options', () => {
        feedbackSupportPage
            .expectNumberOfItemsInDialog(2)
            //email
            .expectItemOnPositionToContainText(0, 'Contact our support team')
            .expectItemOnPositionToContainText(0, 'Need help? Open a ticket.')
            //chat
            .expectItemOnPositionToContainText(1, 'Chat')
            .expectItemOnPositionToContainText(1, 'Launch Chat.');
    });
});
