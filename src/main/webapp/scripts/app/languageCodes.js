'use strict';

angular.module('dbWebApp')
    .service('LanguageCodes', ['$log', function ($log) {
        var languageCodes = [
            { "key":"ab", "readableName":"Abkhaz"},
            { "key":"aa", "readableName":"Afar"},
            { "key":"af", "readableName":"Afrikaans"},
            { "key":"ak", "readableName":"Akan"},
            { "key":"sq", "readableName":"Albanian"},
            { "key":"am", "readableName":"Amharic"},
            { "key":"ar", "readableName":"Arabic"},
            { "key":"an", "readableName":"Aragonese"},
            { "key":"hy", "readableName":"Armenian"},
            { "key":"as", "readableName":"Assamese"},
            { "key":"av", "readableName":"Avaric"},
            { "key":"ae", "readableName":"Avestan"},
            { "key":"ay", "readableName":"Aymara"},
            { "key":"az", "readableName":"Azerbaijani"},
            { "key":"bm", "readableName":"Bambara"},
            { "key":"ba", "readableName":"Bashkir"},
            { "key":"eu", "readableName":"Basque"},
            { "key":"be", "readableName":"Belarusian"},
            { "key":"bn", "readableName":"Bengali"},
            { "key":"bh", "readableName":"Bihari"},
            { "key":"bi", "readableName":"Bislama"},
            { "key":"bs", "readableName":"Bosnian"},
            { "key":"br", "readableName":"Breton"},
            { "key":"bg", "readableName":"Bulgarian"},
            { "key":"my", "readableName":"Burmese"},
            { "key":"ca", "readableName":"Catalan; Valencian"},
            { "key":"ch", "readableName":"Chamorro"},
            { "key":"ce", "readableName":"Chechen"},
            { "key":"ny", "readableName":"Chichewa; Chewa; Nyanja"},
            { "key":"zh", "readableName":"Chinese"},
            { "key":"cv", "readableName":"Chuvash"},
            { "key":"kw", "readableName":"Cornish"},
            { "key":"co", "readableName":"Corsican"},
            { "key":"cr", "readableName":"Cree"},
            { "key":"hr", "readableName":"Croatian"},
            { "key":"cs", "readableName":"Czech"},
            { "key":"da", "readableName":"Danish"},
            { "key":"dv", "readableName":"Divehi; Dhivehi; Maldivian;"},
            { "key":"nl", "readableName":"Dutch"},
            { "key":"en", "readableName":"English"},
            { "key":"eo", "readableName":"Esperanto"},
            { "key":"et", "readableName":"Estonian"},
            { "key":"ee", "readableName":"Ewe"},
            { "key":"fo", "readableName":"Faroese"},
            { "key":"fj", "readableName":"Fijian"},
            { "key":"fi", "readableName":"Finnish"},
            { "key":"fr", "readableName":"French"},
            { "key":"ff", "readableName":"Fula; Fulah; Pulaar; Pular"},
            { "key":"gl", "readableName":"Galician"},
            { "key":"ka", "readableName":"Georgian"},
            { "key":"de", "readableName":"German"},
            { "key":"el", "readableName":"Greek, Modern"},
            { "key":"gn", "readableName":"Guaraní"},
            { "key":"gu", "readableName":"Gujarati"},
            { "key":"ht", "readableName":"Haitian; Haitian Creole"},
            { "key":"ha", "readableName":"Hausa"},
            { "key":"he", "readableName":"Hebrew (modern)"},
            { "key":"hz", "readableName":"Herero"},
            { "key":"hi", "readableName":"Hindi"},
            { "key":"ho", "readableName":"Hiri Motu"},
            { "key":"hu", "readableName":"Hungarian"},
            { "key":"ia", "readableName":"Interlingua"},
            { "key":"id", "readableName":"Indonesian"},
            { "key":"ie", "readableName":"Interlingue"},
            { "key":"ga", "readableName":"Irish"},
            { "key":"ig", "readableName":"Igbo"},
            { "key":"ik", "readableName":"Inupiaq"},
            { "key":"io", "readableName":"Ido"},
            { "key":"is", "readableName":"Icelandic"},
            { "key":"it", "readableName":"Italian"},
            { "key":"iu", "readableName":"Inuktitut"},
            { "key":"ja", "readableName":"Japanese"},
            { "key":"jv", "readableName":"Javanese"},
            { "key":"kl", "readableName":"Kalaallisut, Greenlandic"},
            { "key":"kn", "readableName":"Kannada"},
            { "key":"kr", "readableName":"Kanuri"},
            { "key":"ks", "readableName":"Kashmiri"},
            { "key":"kk", "readableName":"Kazakh"},
            { "key":"km", "readableName":"Khmer"},
            { "key":"ki", "readableName":"Kikuyu, Gikuyu"},
            { "key":"rw", "readableName":"Kinyarwanda"},
            { "key":"ky", "readableName":"Kirghiz, Kyrgyz"},
            { "key":"kv", "readableName":"Komi"},
            { "key":"kg", "readableName":"Kongo"},
            { "key":"ko", "readableName":"Korean"},
            { "key":"ku", "readableName":"Kurdish"},
            { "key":"kj", "readableName":"Kwanyama, Kuanyama"},
            { "key":"la", "readableName":"Latin"},
            { "key":"lb", "readableName":"Luxembourgish, Letzeburgesch"},
            { "key":"lg", "readableName":"Luganda"},
            { "key":"li", "readableName":"Limburgish, Limburgan, Limburger"},
            { "key":"ln", "readableName":"Lingala"},
            { "key":"lo", "readableName":"Lao"},
            { "key":"lt", "readableName":"Lithuanian"},
            { "key":"lu", "readableName":"Luba-Katanga"},
            { "key":"lv", "readableName":"Latvian"},
            { "key":"gv", "readableName":"Manx"},
            { "key":"mk", "readableName":"Macedonian"},
            { "key":"mg", "readableName":"Malagasy"},
            { "key":"ms", "readableName":"Malay"},
            { "key":"ml", "readableName":"Malayalam"},
            { "key":"mt", "readableName":"Maltese"},
            { "key":"mi", "readableName":"Māori"},
            { "key":"mr", "readableName":"Marathi (Marāṭhī)"},
            { "key":"mh", "readableName":"Marshallese"},
            { "key":"mn", "readableName":"Mongolian"},
            { "key":"na", "readableName":"Nauru"},
            { "key":"nv", "readableName":"Navajo, Navaho"},
            { "key":"nb", "readableName":"Norwegian Bokmål"},
            { "key":"nd", "readableName":"North Ndebele"},
            { "key":"ne", "readableName":"Nepali"},
            { "key":"ng", "readableName":"Ndonga"},
            { "key":"nn", "readableName":"Norwegian Nynorsk"},
            { "key":"no", "readableName":"Norwegian"},
            { "key":"ii", "readableName":"Nuosu"},
            { "key":"nr", "readableName":"South Ndebele"},
            { "key":"oc", "readableName":"Occitan"},
            { "key":"oj", "readableName":"Ojibwe, Ojibwa"},
            { "key":"cu", "readableName":"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic"},
            { "key":"om", "readableName":"Oromo"},
            { "key":"or", "readableName":"Oriya"},
            { "key":"os", "readableName":"Ossetian, Ossetic"},
            { "key":"pa", "readableName":"Panjabi, Punjabi"},
            { "key":"pi", "readableName":"Pāli"},
            { "key":"fa", "readableName":"Persian"},
            { "key":"pl", "readableName":"Polish"},
            { "key":"ps", "readableName":"Pashto, Pushto"},
            { "key":"pt", "readableName":"Portuguese"},
            { "key":"qu", "readableName":"Quechua"},
            { "key":"rm", "readableName":"Romansh"},
            { "key":"rn", "readableName":"Kirundi"},
            { "key":"ro", "readableName":"Romanian, Moldavian, Moldovan"},
            { "key":"ru", "readableName":"Russian"},
            { "key":"sa", "readableName":"Sanskrit (Saṁskṛta)"},
            { "key":"sc", "readableName":"Sardinian"},
            { "key":"sd", "readableName":"Sindhi"},
            { "key":"se", "readableName":"Northern Sami"},
            { "key":"sm", "readableName":"Samoan"},
            { "key":"sg", "readableName":"Sango"},
            { "key":"sr", "readableName":"Serbian"},
            { "key":"gd", "readableName":"Scottish Gaelic; Gaelic"},
            { "key":"sn", "readableName":"Shona"},
            { "key":"si", "readableName":"Sinhala, Sinhalese"},
            { "key":"sk", "readableName":"Slovak"},
            { "key":"sl", "readableName":"Slovene"},
            { "key":"so", "readableName":"Somali"},
            { "key":"st", "readableName":"Southern Sotho"},
            { "key":"es", "readableName":"Spanish; Castilian"},
            { "key":"su", "readableName":"Sundanese"},
            { "key":"sw", "readableName":"Swahili"},
            { "key":"ss", "readableName":"Swati"},
            { "key":"sv", "readableName":"Swedish"},
            { "key":"ta", "readableName":"Tamil"},
            { "key":"te", "readableName":"Telugu"},
            { "key":"tg", "readableName":"Tajik"},
            { "key":"th", "readableName":"Thai"},
            { "key":"ti", "readableName":"Tigrinya"},
            { "key":"bo", "readableName":"Tibetan Standard, Tibetan, Central"},
            { "key":"tk", "readableName":"Turkmen"},
            { "key":"tl", "readableName":"Tagalog"},
            { "key":"tn", "readableName":"Tswana"},
            { "key":"to", "readableName":"Tonga (Tonga Islands)"},
            { "key":"tr", "readableName":"Turkish"},
            { "key":"ts", "readableName":"Tsonga"},
            { "key":"tt", "readableName":"Tatar"},
            { "key":"tw", "readableName":"Twi"},
            { "key":"ty", "readableName":"Tahitian"},
            { "key":"ug", "readableName":"Uighur, Uyghur"},
            { "key":"uk", "readableName":"Ukrainian"},
            { "key":"ur", "readableName":"Urdu"},
            { "key":"uz", "readableName":"Uzbek"},
            { "key":"ve", "readableName":"Venda"},
            { "key":"vi", "readableName":"Vietnamese"},
            { "key":"vo", "readableName":"Volapük"},
            { "key":"wa", "readableName":"Walloon"},
            { "key":"cy", "readableName":"Welsh"},
            { "key":"wo", "readableName":"Wolof"},
            { "key":"fy", "readableName":"Western Frisian"},
            { "key":"xh", "readableName":"Xhosa"},
            { "key":"yi", "readableName":"Yiddish"},
            { "key":"yo", "readableName":"Yoruba"},
            { "key":"za", "readableName":"Zhuang, Chuang"}
        ];
        this.get = function () {
            return languageCodes;
        }
    }]);
