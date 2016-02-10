'use strict';

angular.module('dbWebApp')
    .service('CountryCodes', ['$log', function ($log) {
        var countryCodes = [
            {"key": "AD", "readableName": "Andorra"},
            {"key": "AE", "readableName": "United Arab Emirates"},
            {"key": "AF", "readableName": "Afghanistan"},
            {"key": "AG", "readableName": "Antigua and Barbuda"},
            {"key": "AI", "readableName": "Anguilla"},
            {"key": "AM", "readableName": "Armenia"},
            {"key": "AQ", "readableName": "Antarctica"},
            {"key": "AS", "readableName": "American Samoa"},
            {"key": "AU", "readableName": "Australia"},
            {"key": "AX", "readableName": "Åland Islands"},
            {"key": "BA", "readableName": "Bosnia and Herzegovina"},
            {"key": "BD", "readableName": "Bangladesh"},
            {"key": "BE", "readableName": "Belgium"},
            {"key": "BF", "readableName": "Burkina Faso"},
            {"key": "BH", "readableName": "Bahrain"},
            {"key": "BJ", "readableName": "Benin"},
            {"key": "BM", "readableName": "Bermuda"},
            {"key": "BO", "readableName": "Bolivia, Plurinational State of"},
            {"key": "BR", "readableName": "Brazil"},
            {"key": "BT", "readableName": "Bhutan"},
            {"key": "BW", "readableName": "Botswana"},
            {"key": "BZ", "readableName": "Belize"},
            {"key": "CC", "readableName": "Cocos (Keeling) Islands"},
            {"key": "CF", "readableName": "Central African Republic"},
            {"key": "CH", "readableName": "Switzerland"},
            {"key": "CK", "readableName": "Cook Islands"},
            {"key": "CM", "readableName": "Cameroon"},
            {"key": "CO", "readableName": "Colombia"},
            {"key": "CU", "readableName": "Cuba"},
            {"key": "CW", "readableName": "Curaçao"},
            {"key": "CY", "readableName": "Cyprus"},
            {"key": "DE", "readableName": "Germany"},
            {"key": "DK", "readableName": "Denmark"},
            {"key": "DO", "readableName": "Dominican Republic"},
            {"key": "EC", "readableName": "Ecuador"},
            {"key": "EG", "readableName": "Egypt"},
            {"key": "ER", "readableName": "Eritrea"},
            {"key": "ET", "readableName": "Ethiopia"},
            {"key": "FJ", "readableName": "Fiji"},
            {"key": "FM", "readableName": "Micronesia, Federated States of"},
            {"key": "FR", "readableName": "France"},
            {"key": "GB", "readableName": "United Kingdom"},
            {"key": "GE", "readableName": "Georgia"},
            {"key": "GG", "readableName": "Guernsey"},
            {"key": "GI", "readableName": "Gibraltar"},
            {"key": "GM", "readableName": "Gambia"},
            {"key": "GP", "readableName": "Guadeloupe"},
            {"key": "GR", "readableName": "Greece"},
            {"key": "GT", "readableName": "Guatemala"},
            {"key": "GW", "readableName": "Guinea-Bissau"},
            {"key": "HK", "readableName": "Hong Kong"},
            {"key": "HN", "readableName": "Honduras"},
            {"key": "HT", "readableName": "Haiti"},
            {"key": "ID", "readableName": "Indonesia"},
            {"key": "IL", "readableName": "Israel"},
            {"key": "IN", "readableName": "India"},
            {"key": "IQ", "readableName": "Iraq"},
            {"key": "IS", "readableName": "Iceland"},
            {"key": "JE", "readableName": "Jersey"},
            {"key": "JO", "readableName": "Jordan"},
            {"key": "KE", "readableName": "Kenya"},
            {"key": "KH", "readableName": "Cambodia"},
            {"key": "KM", "readableName": "Comoros"},
            {"key": "KP", "readableName": "Korea, Democratic People's Republic of"},
            {"key": "KW", "readableName": "Kuwait"},
            {"key": "KZ", "readableName": "Kazakhstan"},
            {"key": "LB", "readableName": "Lebanon"},
            {"key": "LI", "readableName": "Liechtenstein"},
            {"key": "LR", "readableName": "Liberia"},
            {"key": "LT", "readableName": "Lithuania"},
            {"key": "LV", "readableName": "Latvia"},
            {"key": "MA", "readableName": "Morocco"},
            {"key": "MD", "readableName": "Moldova, Republic of"},
            {"key": "MF", "readableName": "Saint Martin (French part)"},
            {"key": "MH", "readableName": "Marshall Islands"},
            {"key": "ML", "readableName": "Mali"},
            {"key": "MN", "readableName": "Mongolia"},
            {"key": "MP", "readableName": "Northern Mariana Islands"},
            {"key": "MR", "readableName": "Mauritania"},
            {"key": "MT", "readableName": "Malta"},
            {"key": "MV", "readableName": "Maldives"},
            {"key": "MW", "readableName": "Malawi"},
            {"key": "MY", "readableName": "Malaysia"},
            {"key": "NA", "readableName": "Namibia"},
            {"key": "NE", "readableName": "Niger"},
            {"key": "NG", "readableName": "Nigeria"},
            {"key": "NL", "readableName": "Netherlands"},
            {"key": "NP", "readableName": "Nepal"},
            {"key": "NU", "readableName": "Niue"},
            {"key": "OM", "readableName": "Oman"},
            {"key": "PE", "readableName": "Peru"},
            {"key": "PG", "readableName": "Papua New Guinea"},
            {"key": "PK", "readableName": "Pakistan"},
            {"key": "PM", "readableName": "Saint Pierre and Miquelon"},
            {"key": "PR", "readableName": "Puerto Rico"},
            {"key": "PT", "readableName": "Portugal"},
            {"key": "PY", "readableName": "Paraguay"},
            {"key": "RE", "readableName": "Réunion"},
            {"key": "RS", "readableName": "Serbia"},
            {"key": "SA", "readableName": "Saudi Arabia"},
            {"key": "SC", "readableName": "Seychelles"},
            {"key": "SE", "readableName": "Sweden"},
            {"key": "SH", "readableName": "Saint Helena, Ascension and Tristan da Cunha"},
            {"key": "SJ", "readableName": "Svalbard and Jan Mayen"},
            {"key": "SL", "readableName": "Sierra Leone"},
            {"key": "SN", "readableName": "Senegal"},
            {"key": "SR", "readableName": "Suriname"},
            {"key": "ST", "readableName": "Sao Tome and Principe"},
            {"key": "SX", "readableName": "Sint Maarten (Dutch part)"},
            {"key": "SZ", "readableName": "Swaziland"},
            {"key": "TD", "readableName": "Chad"},
            {"key": "TG", "readableName": "Togo"},
            {"key": "TJ", "readableName": "Tajikistan"},
            {"key": "TL", "readableName": "Timor-Leste"},
            {"key": "TN", "readableName": "Tunisia"},
            {"key": "TR", "readableName": "Turkey"},
            {"key": "TV", "readableName": "Tuvalu"},
            {"key": "TZ", "readableName": "Tanzania, United Republic of"},
            {"key": "UG", "readableName": "Uganda"},
            {"key": "US", "readableName": "United States"},
            {"key": "UZ", "readableName": "Uzbekistan"},
            {"key": "VC", "readableName": "Saint Vincent and the Grenadines"},
            {"key": "VG", "readableName": "Virgin Islands, British"},
            {"key": "VN", "readableName": "Viet Nam"},
            {"key": "WF", "readableName": "Wallis and Futuna"},
            {"key": "YE", "readableName": "Yemen"},
            {"key": "ZA", "readableName": "South Africa"},
            {"key": "ZW", "readableName": "Zimbabwe"},
        ];

        this.get = function () {
            return countryCodes;
        }

    }]);
