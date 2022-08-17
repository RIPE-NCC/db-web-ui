import { WebupdatesPage } from '../pages/webupdates.page';

describe('webupdates', () => {
    const webupdatesPage = new WebupdatesPage();

    it("should show 'force delete' for an inetnum if NOT allocated by RIPE", () => {
        webupdatesPage.visit('display/ripe/inetnum/194.219.52.224%20-%20194.219.52.239').modifyObject().expectFooterToContain('Force delete this object?');
    });

    it("should NOT show 'force delete' for an inetnum if allocated by RIPE", () => {
        webupdatesPage.visit('display/ripe/inetnum/91.208.34.0%20-%2091.208.34.255').modifyObject().expectFooterToContain('Force delete this object?', false);
    });

    it("should NOT show 'force delete' for an inetnum if allocated by RIPE and no extra mntners", () => {
        webupdatesPage
            .visit('display/ripe/inetnum/185.102.172.0%20-%20185.102.175.255')
            .modifyObject()
            .expectFooterToContain('Cancel')
            .expectFooterToContain('Force delete this object?', false)
            .expectBannerToContain(
                'The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer here.',
            );
    });

    it("should NOT show 'force delete' for an inetnum if allocated by RIPE and no mntners have a passwd", () => {
        webupdatesPage
            .visit('display/ripe/inetnum/186.102.172.0%20-%20186.102.175.255')
            .modifyObject()
            .expectFooterToContain('Cancel')
            .expectFooterToContain('Force delete this object?', false)
            .expectBannerToContain(
                'You cannot modify this object here because your SSO account is not associated with any of the maintainers and none of the maintainers are protected with an MD5 password',
            );
    });

    it("should show 'force delete' for an inet6num if NOT allocated by RIPE", () => {
        webupdatesPage
            .visit('display/ripe/inet6num/2001%253A978%253Affff%253Afffe%253A%253A%252F64')
            .modifyObject()
            .expectFooterToContain('Force delete this object?');
    });

    it("should NOT show 'force delete' for an inet6num if allocated by RIPE and no mntners have a passwd", () => {
        webupdatesPage
            .visit('display/ripe/inet6num/2001%253Aa08%253A%253A%252F32')
            .modifyObject()
            .expectFooterToContain('Cancel')
            .expectFooterToContain('Force delete this object?', false)
            .expectBannerToContain(
                'The default LIR Maintainer has not yet been set up for this object. If you are the holder of this object, please set up your LIR Default maintainer here.',
            );
    });
});
