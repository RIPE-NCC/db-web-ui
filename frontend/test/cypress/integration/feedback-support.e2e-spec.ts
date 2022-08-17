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
            .expectNumberOfItemsInDialog(3)
            //email
            .expectItemOnPositionToContainText(0, 'Contact our support team')
            .expectItemOnPositionToContainText(0, 'Need help? Open a ticket.')
            //usersnap
            .expectItemOnPositionToContainText(1, 'Report a bug')
            .expectItemOnPositionToContainText(1, 'Something broken? Let us know!')
            //chat
            .expectItemOnPositionToContainText(2, 'Chat')
            .expectItemOnPositionToContainText(2, 'Launch Chat.');
    });
});
