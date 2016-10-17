/*global angular*/

(function () {
    'use strict';

// all ISO3166 'officially assigned' country codes, also 'exceptionally reserved' EU, from http://www.iso.org/iso/country_codes
    angular.module('dbWebApp').service('CountryCodes', function () {

        var countryCodes = [
            {key: 'AD', value: 'Andorra'},
            {key: 'AE', value: 'United Arab Emirates'},
            {key: 'AF', value: 'Afghanistan'},
            {key: 'AG', value: 'Antigua and Barbuda'},
            {key: 'AI', value: 'Anguilla'},
            {key: 'AL', value: 'Albania'},
            {key: 'AM', value: 'Armenia'},
            {key: 'AO', value: 'Angola'},
            {key: 'AQ', value: 'Antarctica'},
            {key: 'AR', value: 'Argentina'},
            {key: 'AS', value: 'American Samoa'},
            {key: 'AT', value: 'Austria'},
            {key: 'AU', value: 'Australia'},
            {key: 'AW', value: 'Aruba'},
            {key: 'AX', value: 'Aland Islands'},
            {key: 'AZ', value: 'Azerbaijan'},
            {key: 'BA', value: 'Bosnia and Herzegovina'},
            {key: 'BB', value: 'Barbados'},
            {key: 'BD', value: 'Bangladesh'},
            {key: 'BE', value: 'Belgium'},
            {key: 'BF', value: 'Burkina Faso'},
            {key: 'BG', value: 'Bulgaria'},
            {key: 'BH', value: 'Bahrain'},
            {key: 'BI', value: 'Burundi'},
            {key: 'BJ', value: 'Benin'},
            {key: 'BL', value: 'Saint Barthelemy'},
            {key: 'BM', value: 'Bermuda'},
            {key: 'BN', value: 'Brunei'},
            {key: 'BO', value: 'Bolivia'},
            {key: 'BQ', value: 'Bonaire, Saint Eustatius and Saba'},
            {key: 'BR', value: 'Brazil'},
            {key: 'BS', value: 'Bahamas'},
            {key: 'BT', value: 'Bhutan'},
            {key: 'BV', value: 'Bouvet Island'},
            {key: 'BW', value: 'Botswana'},
            {key: 'BY', value: 'Belarus'},
            {key: 'BZ', value: 'Belize'},
            {key: 'CA', value: 'Canada'},
            {key: 'CC', value: 'Cocos Islands'},
            {key: 'CD', value: 'Democratic Republic of the Congo'},
            {key: 'CF', value: 'Central African Republic'},
            {key: 'CG', value: 'Republic of the Congo'},
            {key: 'CH', value: 'Switzerland'},
            {key: 'CI', value: 'Ivory Coast'},
            {key: 'CK', value: 'Cook Islands'},
            {key: 'CL', value: 'Chile'},
            {key: 'CM', value: 'Cameroon'},
            {key: 'CN', value: 'China'},
            {key: 'CO', value: 'Colombia'},
            {key: 'CR', value: 'Costa Rica'},
            {key: 'CU', value: 'Cuba'},
            {key: 'CV', value: 'Cape Verde'},
            {key: 'CW', value: 'Curacao'},
            {key: 'CX', value: 'Christmas Island'},
            {key: 'CY', value: 'Cyprus'},
            {key: 'CZ', value: 'Czech Republic'},
            {key: 'DE', value: 'Germany'},
            {key: 'DJ', value: 'Djibouti'},
            {key: 'DK', value: 'Denmark'},
            {key: 'DM', value: 'Dominica'},
            {key: 'DO', value: 'Dominican Republic'},
            {key: 'DZ', value: 'Algeria'},
            {key: 'EC', value: 'Ecuador'},
            {key: 'EE', value: 'Estonia'},
            {key: 'EG', value: 'Egypt'},
            {key: 'EH', value: 'Western Sahara'},
            {key: 'ER', value: 'Eritrea'},
            {key: 'ES', value: 'Spain'},
            {key: 'EU', value: 'Europe'},
            {key: 'ET', value: 'Ethiopia'},
            {key: 'FI', value: 'Finland'},
            {key: 'FJ', value: 'Fiji'},
            {key: 'FK', value: 'Falkland Islands'},
            {key: 'FM', value: 'Micronesia'},
            {key: 'FO', value: 'Faroe Islands'},
            {key: 'FR', value: 'France'},
            {key: 'GA', value: 'Gabon'},
            {key: 'GB', value: 'United Kingdom'},
            {key: 'GD', value: 'Grenada'},
            {key: 'GE', value: 'Georgia'},
            {key: 'GF', value: 'French Guiana'},
            {key: 'GG', value: 'Guernsey'},
            {key: 'GH', value: 'Ghana'},
            {key: 'GI', value: 'Gibraltar'},
            {key: 'GL', value: 'Greenland'},
            {key: 'GM', value: 'Gambia'},
            {key: 'GN', value: 'Guinea'},
            {key: 'GP', value: 'Guadeloupe'},
            {key: 'GQ', value: 'Equatorial Guinea'},
            {key: 'GR', value: 'Greece'},
            {key: 'GS', value: 'South Georgia and the South Sandwich Islands'},
            {key: 'GT', value: 'Guatemala'},
            {key: 'GU', value: 'Guam'},
            {key: 'GW', value: 'Guinea-Bissau'},
            {key: 'GY', value: 'Guyana'},
            {key: 'HK', value: 'Hong Kong'},
            {key: 'HM', value: 'Heard Island and McDonald Islands'},
            {key: 'HN', value: 'Honduras'},
            {key: 'HR', value: 'Croatia'},
            {key: 'HT', value: 'Haiti'},
            {key: 'HU', value: 'Hungary'},
            {key: 'ID', value: 'Indonesia'},
            {key: 'IE', value: 'Ireland'},
            {key: 'IL', value: 'Israel'},
            {key: 'IM', value: 'Isle of Man'},
            {key: 'IN', value: 'India'},
            {key: 'IO', value: 'British Indian Ocean Territory'},
            {key: 'IQ', value: 'Iraq'},
            {key: 'IR', value: 'Iran'},
            {key: 'IS', value: 'Iceland'},
            {key: 'IT', value: 'Italy'},
            {key: 'JE', value: 'Jersey'},
            {key: 'JM', value: 'Jamaica'},
            {key: 'JO', value: 'Jordan'},
            {key: 'JP', value: 'Japan'},
            {key: 'KE', value: 'Kenya'},
            {key: 'KG', value: 'Kyrgyzstan'},
            {key: 'KH', value: 'Cambodia'},
            {key: 'KI', value: 'Kiribati'},
            {key: 'KM', value: 'Comoros'},
            {key: 'KN', value: 'Saint Kitts and Nevis'},
            {key: 'KP', value: 'North Korea'},
            {key: 'KR', value: 'South Korea'},
            {key: 'KW', value: 'Kuwait'},
            {key: 'KY', value: 'Cayman Islands'},
            {key: 'KZ', value: 'Kazakhstan'},
            {key: 'LA', value: 'Laos'},
            {key: 'LB', value: 'Lebanon'},
            {key: 'LC', value: 'Saint Lucia'},
            {key: 'LI', value: 'Liechtenstein'},
            {key: 'LK', value: 'Sri Lanka'},
            {key: 'LR', value: 'Liberia'},
            {key: 'LS', value: 'Lesotho'},
            {key: 'LT', value: 'Lithuania'},
            {key: 'LU', value: 'Luxembourg'},
            {key: 'LV', value: 'Latvia'},
            {key: 'LY', value: 'Libya'},
            {key: 'MA', value: 'Morocco'},
            {key: 'MC', value: 'Monaco'},
            {key: 'MD', value: 'Moldova'},
            {key: 'ME', value: 'Montenegro'},
            {key: 'MF', value: 'Saint Martin'},
            {key: 'MG', value: 'Madagascar'},
            {key: 'MH', value: 'Marshall Islands'},
            {key: 'MK', value: 'Macedonia'},
            {key: 'ML', value: 'Mali'},
            {key: 'MM', value: 'Myanmar'},
            {key: 'MN', value: 'Mongolia'},
            {key: 'MO', value: 'Macao'},
            {key: 'MP', value: 'Northern Mariana Islands'},
            {key: 'MQ', value: 'Martinique'},
            {key: 'MR', value: 'Mauritania'},
            {key: 'MS', value: 'Montserrat'},
            {key: 'MT', value: 'Malta'},
            {key: 'MU', value: 'Mauritius'},
            {key: 'MV', value: 'Maldives'},
            {key: 'MW', value: 'Malawi'},
            {key: 'MX', value: 'Mexico'},
            {key: 'MY', value: 'Malaysia'},
            {key: 'MZ', value: 'Mozambique'},
            {key: 'NA', value: 'Namibia'},
            {key: 'NC', value: 'New Caledonia'},
            {key: 'NE', value: 'Niger'},
            {key: 'NF', value: 'Norfolk Island'},
            {key: 'NG', value: 'Nigeria'},
            {key: 'NI', value: 'Nicaragua'},
            {key: 'NL', value: 'Netherlands'},
            {key: 'NO', value: 'Norway'},
            {key: 'NP', value: 'Nepal'},
            {key: 'NR', value: 'Nauru'},
            {key: 'NU', value: 'Niue'},
            {key: 'NZ', value: 'New Zealand'},
            {key: 'OM', value: 'Oman'},
            {key: 'PA', value: 'Panama'},
            {key: 'PE', value: 'Peru'},
            {key: 'PF', value: 'French Polynesia'},
            {key: 'PG', value: 'Papua New Guinea'},
            {key: 'PH', value: 'Philippines'},
            {key: 'PK', value: 'Pakistan'},
            {key: 'PL', value: 'Poland'},
            {key: 'PM', value: 'Saint Pierre and Miquelon'},
            {key: 'PN', value: 'Pitcairn'},
            {key: 'PR', value: 'Puerto Rico'},
            {key: 'PS', value: 'Palestinian Territory'},
            {key: 'PT', value: 'Portugal'},
            {key: 'PW', value: 'Palau'},
            {key: 'PY', value: 'Paraguay'},
            {key: 'QA', value: 'Qatar'},
            {key: 'RE', value: 'Reunion'},
            {key: 'RO', value: 'Romania'},
            {key: 'RS', value: 'Serbia'},
            {key: 'RU', value: 'Russia'},
            {key: 'RW', value: 'Rwanda'},
            {key: 'SA', value: 'Saudi Arabia'},
            {key: 'SB', value: 'Solomon Islands'},
            {key: 'SC', value: 'Seychelles'},
            {key: 'SD', value: 'Sudan'},
            {key: 'SE', value: 'Sweden'},
            {key: 'SG', value: 'Singapore'},
            {key: 'SH', value: 'Saint Helena'},
            {key: 'SI', value: 'Slovenia'},
            {key: 'SJ', value: 'Svalbard and Jan Mayen'},
            {key: 'SK', value: 'Slovakia'},
            {key: 'SL', value: 'Sierra Leone'},
            {key: 'SM', value: 'San Marino'},
            {key: 'SN', value: 'Senegal'},
            {key: 'SO', value: 'Somalia'},
            {key: 'SR', value: 'Suriname'},
            {key: 'SS', value: 'South Sudan'},
            {key: 'ST', value: 'Sao Tome and Principe'},
            {key: 'SV', value: 'El Salvador'},
            {key: 'SX', value: 'Sint Maarten'},
            {key: 'SY', value: 'Syria'},
            {key: 'SZ', value: 'Swaziland'},
            {key: 'TC', value: 'Turks and Caicos Islands'},
            {key: 'TD', value: 'Chad'},
            {key: 'TF', value: 'French Southern Territories'},
            {key: 'TG', value: 'Togo'},
            {key: 'TH', value: 'Thailand'},
            {key: 'TJ', value: 'Tajikistan'},
            {key: 'TK', value: 'Tokelau'},
            {key: 'TL', value: 'East Timor'},
            {key: 'TM', value: 'Turkmenistan'},
            {key: 'TN', value: 'Tunisia'},
            {key: 'TO', value: 'Tonga'},
            {key: 'TR', value: 'Turkey'},
            {key: 'TT', value: 'Trinidad and Tobago'},
            {key: 'TV', value: 'Tuvalu'},
            {key: 'TW', value: 'Taiwan'},
            {key: 'TZ', value: 'Tanzania'},
            {key: 'UA', value: 'Ukraine'},
            {key: 'UG', value: 'Uganda'},
            {key: 'UM', value: 'United States Minor Outlying Islands'},
            {key: 'US', value: 'United States'},
            {key: 'UY', value: 'Uruguay'},
            {key: 'UZ', value: 'Uzbekistan'},
            {key: 'VA', value: 'Vatican'},
            {key: 'VC', value: 'Saint Vincent and the Grenadines'},
            {key: 'VE', value: 'Venezuela'},
            {key: 'VG', value: 'British Virgin Islands'},
            {key: 'VI', value: 'U.S. Virgin Islands'},
            {key: 'VN', value: 'Vietnam'},
            {key: 'VU', value: 'Vanuatu'},
            {key: 'WF', value: 'Wallis and Futuna'},
            {key: 'WS', value: 'Samoa'},
            {key: 'YE', value: 'Yemen'},
            {key: 'YT', value: 'Mayotte'},
            {key: 'ZA', value: 'South Africa'},
            {key: 'ZM', value: 'Zambia'},
            {key: 'ZW', value: 'Zimbabwe'}
        ];

        this.get = function () {
            return countryCodes;
        };

    });

})();
