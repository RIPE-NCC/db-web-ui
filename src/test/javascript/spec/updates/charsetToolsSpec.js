'use strict';

describe('updates: CharsetTools', function () {

    var subject;

    beforeEach(module('updates'));

    beforeEach(inject(function (CharsetTools) {
        subject = CharsetTools;
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


});
