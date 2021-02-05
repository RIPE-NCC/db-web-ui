package net.ripe.whois.web.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LeftMenuConfiguration {

    @Value("${lir.account.details.url:}")
    private String lirAccountDetailsUrl;
    @Value("${lir.billing.details.url:}")
    private String lirBillingDetailsUrl;
    @Value("${lir.gm.preferences.url:}")
    private String lirGeneralMeetingUrl;
    @Value("${lir.user.accounts.url:}")
    private String lirUserAccountsUrl;
    @Value("${lir.tickets.url:}")
    private String lirTicketsUrl;
    @Value("${lir.training.url:}")
    private String lirTrainingUrl;
    @Value("${lir.api.access.keys.url:}")
    private String lirApiAccessKeysUrl;
    @Value("${my.resources.url}")
    private String myResourcesUrl;
    @Value("${request.resources.url:}")
    private String requestResourcesUrl;
    @Value("${request.transfer.url:}")
    private String requestTransferUrl;
    @Value("${request.update.url:}")
    private String requestUpdateUrl;
    @Value("${ipv4.transfer.listing.service.url}")
    private String ipv4TransferListingServiceUrl;
    @Value("${rpki.dashboard.url:}")
    private String rpkiDashboardUrl;
    @Value("${database.query.url}")
    private String databaseQueryUrl;
    @Value("${database.full.text.search.url}")
    private String databaseFullTextSearchUrl;
    @Value("${database.syncupdates.url}")
    private String databaseSyncupdatesUrl;
    @Value("${database.create.url}")
    private String databaseCreateUrl;
    @Value("${open.acquisition.url:}") //we need it to be #/open-lir-org-change
    private String openAcquisitionUrl;

    public String getLirAccountDetailsUrl() {
        return lirAccountDetailsUrl;
    }

    public String getLirBillingDetailsUrl() {
        return lirBillingDetailsUrl;
    }

    public String getLirGeneralMeetingUrl() {
        return lirGeneralMeetingUrl;
    }

    public String getLirUserAccountsUrl() {
        return lirUserAccountsUrl;
    }

    public String getLirTicketsUrl() {
        return lirTicketsUrl;
    }

    public String getLirTrainingUrl() {
        return lirTrainingUrl;
    }

    public String getLirApiAccessKeysUrl() {
        return lirApiAccessKeysUrl;
    }

    public String getMyResourcesUrl() {
        return myResourcesUrl;
    }

    public String getRequestResourcesUrl() {
        return requestResourcesUrl;
    }

    public String getRequestUpdateUrl() {
        return requestUpdateUrl;
    }

    public String getRequestTransferUrl() {
        return requestTransferUrl;
    }

    public String getIpv4TransferListingServiceUrl() {
        return ipv4TransferListingServiceUrl;
    }

    public String getRpkiDashboardUrl() {
        return rpkiDashboardUrl;
    }

    public String getDatabaseQueryUrl() {
        return databaseQueryUrl;
    }

    public String getDatabaseFullTextSearchUrl() {
        return databaseFullTextSearchUrl;
    }

    public String getDatabaseSyncupdatesUrl() {
        return databaseSyncupdatesUrl;
    }

    public String getDatabaseCreateUrl() {
        return databaseCreateUrl;
    }

    public String getOpenAcquisitionUrl() {
        return openAcquisitionUrl;
    }
}
