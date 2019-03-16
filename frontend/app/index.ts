// styles
import "./assets/scss/main.scss";

// General Interceptors
import "./scripts/app";
// import "./scripts/app.constants";
import "./scripts/ErrorInterceptors";

// General Services
import "./scripts/WhoisMetaService";
import "./scripts/LabelFilter";
import "./scripts/Label.constants";
import "./scripts/ResourceStatus";
import "./scripts/WhoisResources";
import "./scripts/AlertService";
import "./scripts/HelpMarkerComponent";
import "./scripts/ScrollerDirective";
import "./scripts/JsUtils";

// Temporary just until we need different menu on test, training and rc enviroments
import "./scripts/EnvironmentStatus";

// General directives
import "./scripts/AlertsComponent";

// General Update services
import "./scripts/dropdown/OrgDropDownComponent";
import "./scripts/fulltextsearch/FullTextSearchComponent";
import "./scripts/fulltextsearch/FullTextResponseService";
import "./scripts/fulltextsearch/FullTextResultSummaryComponent";
import "./scripts/fulltextsearch/FullTextSearchService";
import "./scripts/myresources/FlagComponent";
import "./scripts/myresources/HierarchySelectorComponent";
import "./scripts/myresources/IpAddressService";
import "./scripts/myresources/IpUsageService";
import "./scripts/myresources/IpUsageComponent";
import "./scripts/myresources/IpUsageOfAllResourcesComponent";
import "./scripts/myresources/MoreSpecificsService";
import "./scripts/myresources/ResourceDetailsComponent";
import "./scripts/myresources/ResourceItemComponent";
import "./scripts/myresources/ResourcesComponent";
import "./scripts/myresources/ResourcesDataService";
import "./scripts/myresources/alertsdropdown/AlertsDropDownComponent";
import "./scripts/paginator/PaginationComponent";
import "./scripts/loadingindicator/LoadingIndicatorComponent";
import "./scripts/query/LookupComponent";
import "./scripts/query/LookupService";
import "./scripts/query/LookupSingleObjectComponent";
import "./scripts/query/QueryComponent";
import "./scripts/query/QueryParameters";
import "./scripts/query/QueryService";
import "./scripts/query/template-component/TemplateComponent";

import "./scripts/transferdropdown/TransferDropDownComponent";

import "./scripts/updates/UpdatesModule";
import "./scripts/updates/RestService";
import "./scripts/updates/CredentialsService";
import "./scripts/updates/MessageStore";
import "./scripts/updates/LinkService";
import "./scripts/updates/ErrorReporterService";
import "./scripts/updates/MntnerService";
import "./scripts/updates/ObjectUtilService";
import "./scripts/updates/PreferenceService";
import "./scripts/updates/ScreenLogicInterceptorService";
import "./scripts/updates/CharsetToolsService";
import "./scripts/whoisObject/AttrInfoComponent";
import "./scripts/whoisObject/MaintainersEditorComponent";
import "./scripts/whoisObject/NameFormatterComponent";
import "./scripts/whoisObject/WhoisObjectViewerComponent";
import "./scripts/whoisObject/WhoisObjectEditorComponent";
import "./scripts/wizard/AttributeComponent";
import "./scripts/wizard/AttributeMetadataService";
import "./scripts/wizard/DomainObjectWizard";
import "./scripts/wizard/ModalDomainObjectSplashComponent";
import "./scripts/wizard/ModalDomainCreationWaitComponent";
import "./scripts/wizard/DisplayDomainObjects";
import "./scripts/wizard/PrefixService";

// WebUpdates Services
import "./scripts/updates/web/WebUpdatesModule";
import "./scripts/updates/web/ModalService";
import "./scripts/updates/web/OrganisationHelperService";
import "./scripts/updates/web/WebUpdatesCommonsService";
// import "./scripts/updates/web/cryptojs";
import "./scripts/updates/web/CryptService";
import "./scripts/updates/web/EnumService";

// WebUpdates Directives
import "./scripts/updates/web/AttributeTransformerDirective";

// Webupdates Controllers
import "./scripts/updates/web/WebUpdatesStates";

import "./scripts/updates/web/ModalCreateRoleForAbuseCComponent";
import "./scripts/updates/web/ModalAuthenticationComponent";
import "./scripts/updates/web/ModalMd5PasswordComponent";
import "./scripts/updates/web/ModalAddAttributeComponent";
import "./scripts/updates/web/ModalEditAttributeComponent";
import "./scripts/updates/web/ModalDeleteObjectComponent";
import "./scripts/updates/web/SelectComponent";

import "./scripts/updates/web/CreateModifyComponent";
import "./scripts/updates/web/CreateSelfMaintainedMaintainerComponent";
import "./scripts/updates/web/CreatePersonMntnerPair";
import "./scripts/updates/web/DeleteComponent";
import "./scripts/updates/web/DisplayPersonMntnerPairComponent";
import "./scripts/updates/web/DisplayComponent";
import "./scripts/updates/web/ForceDeleteSelectComponent";
import "./scripts/updates/web/ForceDeleteComponent";
// Webupdates specific javascript end

// Textupdates
import "./scripts/updates/text/TextUpdatesModule";
import "./scripts/updates/text/TextUpdatesStates";
import "./scripts/updates/text/RpslService";
import "./scripts/updates/text/SerialExecutorService";
import "./scripts/updates/text/AutoKeyLogicService";
import "./scripts/updates/text/TextCommonsService";
import "./scripts/updates/text/TextCreateComponent";
import "./scripts/updates/text/TextModifyComponent";
import "./scripts/updates/text/TextMultiDecisionComponent";
import "./scripts/updates/text/TextMultiDecisionModalComponent";
import "./scripts/updates/text/TextMultiComponent";
// Textupdates specific javascript end

// LoginStatus Controllers
import "./scripts/loginStatus/loginStatusModule";
import "./scripts/loginStatus/UserInfoComponent";
//  LoginStatus specific javascript end

// Menu Controllers
import "./scripts/menu/LeftMenuComponent";
import "./scripts/menu/UserInfoService";
//  Menu specific javascript end

// Forgot-Maintainer-Password Controllers
import "./scripts/fmp/FmpModule";
import "./scripts/fmp/FmpStates";
import "./scripts/fmp/FmpServices";
import "./scripts/fmp/FindMaintainerService";
import "./scripts/fmp/FindMaintainerComponent";
import "./scripts/fmp/MailSentComponent";
import "./scripts/fmp/ConfirmMaintainerComponent";
import "./scripts/fmp/SsoAddedComponent";
import "./scripts/fmp/ForgotMaintainerPasswordService";
import "./scripts/fmp/ForgotMaintainerPasswordComponent";
import "./scripts/fmp/RequireLoginComponent";
// Forgot-Maintainer-Password javascript end

// EmailConfirmation Controllers
import "./scripts/emailconfirmation/EmailConfirmationComponent";
import "./scripts/emailconfirmation/EmailConfirmationService";
// EmailConfirmation javascript end
// Search javascript end
