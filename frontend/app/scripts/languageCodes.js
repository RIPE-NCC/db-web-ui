/*global angular*/

(function () {
    'use strict';

// All ISO639-1 codes from http://www.loc.gov/standards/iso639-2/php/code_list.php
    angular.module('dbWebApp')
        .factory('LanguageCodes', function () {
            var languageCodes = [
                {key: 'AA', value: 'Afar'},
                {key: 'AB', value: 'Abkhazian'},
                {key: 'AE', value: 'Avestan'},
                {key: 'AF', value: 'Afrikaans'},
                {key: 'AK', value: 'Akan'},
                {key: 'AM', value: 'Amharic'},
                {key: 'AN', value: 'Aragonese'},
                {key: 'AR', value: 'Arabic'},
                {key: 'AS', value: 'Assamese'},
                {key: 'AV', value: 'Avaric'},
                {key: 'AY', value: 'Aymara'},
                {key: 'AZ', value: 'Azerbaijani'},
                {key: 'BA', value: 'Bashkir'},
                {key: 'BE', value: 'Belarusian'},
                {key: 'BG', value: 'Bulgarian'},
                {key: 'BH', value: 'Bihari'},
                {key: 'BI', value: 'Bislama'},
                {key: 'BM', value: 'Bambara'},
                {key: 'BN', value: 'Bengali'},
                {key: 'BO', value: 'Tibetan'},
                {key: 'BR', value: 'Breton'},
                {key: 'BS', value: 'Bosnian'},
                {key: 'CA', value: 'Catalan; Valencian'},
                {key: 'CE', value: 'Chechen'},
                {key: 'CH', value: 'Chamorro'},
                {key: 'CO', value: 'Corsican'},
                {key: 'CR', value: 'Cree'},
                {key: 'CS', value: 'Czech'},
                {key: 'CU', value: 'Church Slavic'},
                {key: 'CV', value: 'Chuvash'},
                {key: 'CY', value: 'Welsh'},
                {key: 'DA', value: 'Danish'},
                {key: 'DE', value: 'German'},
                {key: 'DV', value: 'Divehi; Dhivehi; Maldivian;'},
                {key: 'DZ', value: 'Dzongkha'},
                {key: 'EE', value: 'Ewe'},
                {key: 'EL', value: 'Greek, Modern'},
                {key: 'EN', value: 'English'},
                {key: 'EO', value: 'Esperanto'},
                {key: 'ES', value: 'Spanish; Castilian'},
                {key: 'ET', value: 'Estonian'},
                {key: 'EU', value: 'Basque'},
                {key: 'FA', value: 'Persian'},
                {key: 'FF', value: 'Fula; Fulah; Pulaar; Pular'},
                {key: 'FI', value: 'Finnish'},
                {key: 'FJ', value: 'Fijian'},
                {key: 'FO', value: 'Faroese'},
                {key: 'FR', value: 'French'},
                {key: 'FY', value: 'Western Frisian'},
                {key: 'GA', value: 'Irish'},
                {key: 'GD', value: 'Scottish Gaelic; Gaelic'},
                {key: 'GL', value: 'Galician'},
                {key: 'GN', value: 'Guaraní'},
                {key: 'GU', value: 'Gujarati'},
                {key: 'GV', value: 'Manx'},
                {key: 'HA', value: 'Hausa'},
                {key: 'HE', value: 'Hebrew'},
                {key: 'HI', value: 'Hindi'},
                {key: 'HO', value: 'Hiri Motu'},
                {key: 'HR', value: 'Croatian'},
                {key: 'HT', value: 'Haitian; Haitian Creole'},
                {key: 'HU', value: 'Hungarian'},
                {key: 'HY', value: 'Armenian'},
                {key: 'HZ', value: 'Herero'},
                {key: 'IA', value: 'Interlingua'},
                {key: 'ID', value: 'Indonesian'},
                {key: 'IE', value: 'Interlingue; Occidental'},
                {key: 'IG', value: 'Igbo'},
                {key: 'II', value: 'Sichuan Yi; Nuosu'},
                {key: 'IK', value: 'Inupiaq'},
                {key: 'IO', value: 'Ido'},
                {key: 'IS', value: 'Icelandic'},
                {key: 'IT', value: 'Italian'},
                {key: 'IU', value: 'Inuktitut'},
                {key: 'JA', value: 'Japanese'},
                {key: 'JV', value: 'Javanese'},
                {key: 'KA', value: 'Georgian'},
                {key: 'KG', value: 'Kongo'},
                {key: 'KI', value: 'Kikuyu, Gikuyu'},
                {key: 'KJ', value: 'Kwanyama, Kuanyama'},
                {key: 'KK', value: 'Kazakh'},
                {key: 'KL', value: 'Kalaallisut, Greenlandic'},
                {key: 'KM', value: 'Khmer'},
                {key: 'KN', value: 'Kannada'},
                {key: 'KO', value: 'Korean'},
                {key: 'KR', value: 'Kanuri'},
                {key: 'KS', value: 'Kashmiri'},
                {key: 'KU', value: 'Kurdish'},
                {key: 'KV', value: 'Komi'},
                {key: 'KW', value: 'Cornish'},
                {key: 'KY', value: 'Kirghiz, Kyrgyz'},
                {key: 'LA', value: 'Latin'},
                {key: 'LB', value: 'Luxembourgish, Letzeburgesch'},
                {key: 'LG', value: 'Luganda'},
                {key: 'LI', value: 'Limburgish, Limburgan, Limburger'},
                {key: 'LN', value: 'Lingala'},
                {key: 'LO', value: 'Lao'},
                {key: 'LT', value: 'Lithuanian'},
                {key: 'LU', value: 'Luba-Katanga'},
                {key: 'LV', value: 'Latvian'},
                {key: 'MG', value: 'Malagasy'},
                {key: 'MH', value: 'Marshallese'},
                {key: 'MI', value: 'Māori'},
                {key: 'MK', value: 'Macedonian'},
                {key: 'ML', value: 'Malayalam'},
                {key: 'MN', value: 'Mongolian'},
                {key: 'MR', value: 'Marathi (Marāṭhī)'},
                {key: 'MS', value: 'Malay'},
                {key: 'MT', value: 'Maltese'},
                {key: 'MY', value: 'Burmese'},
                {key: 'NA', value: 'Nauru'},
                {key: 'NB', value: 'Norwegian Bokmål'},
                {key: 'ND', value: 'North Ndebele'},
                {key: 'NE', value: 'Nepali'},
                {key: 'NG', value: 'Ndonga'},
                {key: 'NL', value: 'Dutch'},
                {key: 'NN', value: 'Norwegian Nynorsk'},
                {key: 'NO', value: 'Norwegian'},
                {key: 'NR', value: 'South Ndebele'},
                {key: 'NV', value: 'Navajo, Navaho'},
                {key: 'NY', value: 'Chichewa; Chewa; Nyanja'},
                {key: 'OC', value: 'Occitan'},
                {key: 'OJ', value: 'Ojibwe, Ojibwa'},
                {key: 'OM', value: 'Oromo'},
                {key: 'OR', value: 'Oriya'},
                {key: 'OS', value: 'Ossetian, Ossetic'},
                {key: 'PA', value: 'Panjabi, Punjabi'},
                {key: 'PI', value: 'Pāli'},
                {key: 'PL', value: 'Polish'},
                {key: 'PS', value: 'Pashto, Pushto'},
                {key: 'PT', value: 'Portuguese'},
                {key: 'QU', value: 'Quechua'},
                {key: 'RM', value: 'Romansh'},
                {key: 'RN', value: 'Kirundi'},
                {key: 'RO', value: 'Romanian, Moldavian, Moldovan'},
                {key: 'RU', value: 'Russian'},
                {key: 'RW', value: 'Kinyarwanda'},
                {key: 'SA', value: 'Sanskrit (Saṁskṛta)'},
                {key: 'SC', value: 'Sardinian'},
                {key: 'SD', value: 'Sindhi'},
                {key: 'SE', value: 'Northern Sami'},
                {key: 'SG', value: 'Sango'},
                {key: 'SI', value: 'Sinhala, Sinhalese'},
                {key: 'SK', value: 'Slovak'},
                {key: 'SL', value: 'Slovenian'},
                {key: 'SM', value: 'Samoan'},
                {key: 'SN', value: 'Shona'},
                {key: 'SO', value: 'Somali'},
                {key: 'SQ', value: 'Albanian'},
                {key: 'SR', value: 'Serbian'},
                {key: 'SS', value: 'Swati'},
                {key: 'ST', value: 'Southern Sotho'},
                {key: 'SU', value: 'Sundanese'},
                {key: 'SV', value: 'Swedish'},
                {key: 'SW', value: 'Swahili'},
                {key: 'TA', value: 'Tamil'},
                {key: 'TE', value: 'Telugu'},
                {key: 'TG', value: 'Tajik'},
                {key: 'TH', value: 'Thai'},
                {key: 'TI', value: 'Tigrinya'},
                {key: 'TK', value: 'Turkmen'},
                {key: 'TL', value: 'Tagalog'},
                {key: 'TN', value: 'Tswana'},
                {key: 'TO', value: 'Tonga (Tonga Islands)'},
                {key: 'TR', value: 'Turkish'},
                {key: 'TS', value: 'Tsonga'},
                {key: 'TT', value: 'Tatar'},
                {key: 'TW', value: 'Twi'},
                {key: 'TY', value: 'Tahitian'},
                {key: 'UG', value: 'Uighur, Uyghur'},
                {key: 'UK', value: 'Ukrainian'},
                {key: 'UR', value: 'Urdu'},
                {key: 'UZ', value: 'Uzbek'},
                {key: 'VE', value: 'Venda'},
                {key: 'VI', value: 'Vietnamese'},
                {key: 'VO', value: 'Volapük'},
                {key: 'WA', value: 'Walloon'},
                {key: 'WO', value: 'Wolof'},
                {key: 'XH', value: 'Xhosa'},
                {key: 'YI', value: 'Yiddish'},
                {key: 'YO', value: 'Yoruba'},
                {key: 'ZA', value: 'Zhuang, Chuang'},
                {key: 'ZH', value: 'Chinese'},
                {key: 'ZU', value: 'Zulu'}
            ];

            return {
                get: function () {
                    return languageCodes;
                }
            };
        });
})();
