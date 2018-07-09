'use strict';

describe('updates: CharsetToolsService', function () {

    var subject;

    beforeEach(module('updates'));

    beforeEach(inject(function (CharsetToolsService) {
        subject = CharsetToolsService;
    }));

    afterEach(function() {

    });

    /*
        !	"	#	$	%	&	'	(	)	*	+	,	-	.	/
     0	1	2	3	4	5	6	7	8	9	:	;	<	=	>	?
     @	A	B	C	D	E	F	G	H	I	J	K	L	M	N	O
     P	Q	R	S	T	U	V	W	X	Y	Z	[	\	]	^	_
     `	a	b	c	d	e	f	g	h	i	j	k	l	m	n	o
     p	q	r	s	t	u	v	w	x	y	z	{	|	}	~

        ¡	¢	£	¤	¥	¦	§	¨	©	ª	«	¬		®	¯
     °	±	²	³	´	µ	¶	·	¸	¹	º	»	¼	½	¾	¿
     À	Á	Â	Ã	Ä	Å	Æ	Ç	È	É	Ê	Ë	Ì	Í	Î	Ï
     Ð	Ñ	Ò	Ó	Ô	Õ	Ö	×	Ø	Ù	Ú	Û	Ü	Ý	Þ	ß
     à	á	â	ã	ä	å	æ	ç	è	é	ê	ë	ì	í	î	ï
     ð	ñ	ò	ó	ô	õ	ö	÷	ø	ù	ú	û	ü	ý	þ	ÿ
     */

    it('should handle undefined string', function(){
        expect(subject.isLatin1(undefined)).toEqual(true);
    });

    it('should handle empty string', function(){
        expect(subject.isLatin1('')).toEqual(true);
    });

    it('should recognize latin-1 string', function(){
        expect(subject.isLatin1('"hello"')).toEqual(true);
    });

    // handle extended us-ascii
    it('should recognize all as us-ascii string', function(){
        expect(subject.isLatin1("!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")).toEqual(true);
    });

    // handle extended part of ascii(=latin1)
    it('should recognize extended latin1 string', function(){
        expect(subject.isLatin1(" ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ")).toEqual(true);
    });

    it('should recognize escaped utf-8 string', function(){
        expect(subject.isLatin1("%u0430")).toEqual(true);
    });

    it('should recognize utf-8 string', function(){
        expect(subject.isLatin1('Здравствуйте')).toEqual(false);
    });

    it('should replace certain latin-1 characters', function() {
        expect(subject.replaceSubstitutables('emdash\u2013test')).toEqual('emdash-test');
        expect(subject.replaceSubstitutables('endash\u2014test')).toEqual('endash-test');
        expect(subject.replaceSubstitutables('nbsp\u00A0test')).toEqual('nbsp test');
        expect(subject.replaceSubstitutables('mixed\u2013\u2014\u00A0test')).toEqual('mixed-- test');
        expect(subject.replaceSubstitutables('multiple\u2013\u2013\u00A0\u2014\u2014test')).toEqual('multiple-- --test');
        expect(subject.replaceSubstitutables('r\u00F8\u00e5')).toEqual('røå');
    });

    it('should replace invalid chars with ?', function () {
       expect(subject._replaceNonSubstitutables('test漢字')).toEqual('test??');
    });


});
