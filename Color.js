Color =(function(){
	var Color =function( s ){
		if( ! s || ! s.charAt ) return s
		if( s.charAt(0)=='#' || s.length<=6 ) return Color.hex( s )
		for(var a=['rgb','hsv','hsl'], i=0, ni=a.length; i<ni; i++ )
			if(!s.indexOf(a[i])||!s.indexOf(a[i].toUpperCase()))
				return Color[a[i]]( s )
		throw new Error ('INVALID_COLOR '+ s )
		}

	, MAX= {r:255,g:255,b:255,h:360,s:100,v:100,l:100,c:100,m:100,y:100,k:100,a:1}
	
	// VALIDATIONS
	, parseString =function( s, sMode ){
		var a =[], i =-1, re =new RegExp( "^\\s*"+ sMode +"?\\s*\\(([^)]+)\\)", 'gim' )
		s.replace( re, function( sFound, $1 ){
			$1.replace( /\s*(\d+(?:\.\d*)?)(%?)\s*,?/gim, function( sFound, $1, $2 ){
				if( i++ < 4 ) a[i] = $2 ? MAX[ sMode.charAt(i)] * $1 / 100 : $1*1
				})
			})
		if( a.length ) return getObject( sMode, a )
		return null
		}
	, getObject =function( sMode, a ){
		for(var o ={}, i=0; s=sMode.charAt(i); i++ ) o[s] = inRange( a[i], s )
		return o
		}
	, inRange =function(n,s){
		if( isNaN(n) || ! MAX[s]) return null
		return n > MAX[s] ? MAX[s] : ( n < 0 ? 0 : n )
		}
	, isHEX =function( s ){
		if( s[0]=='#' ) s = s.slice(1)
		if( s.length==1 ) s = s[0]+s[0] +s[0]+s[0] +s[0]+s[0]
		if( s.length==3 ) s = s[0]+s[0] +s[1]+s[1] +s[2]+s[2]
		if( /^[\dABCDEF]{6}$/i.test( s )) return s.toUpperCase()
		throw new Error ('INVALID_HEXADECIMAL_COLOR '+ s )
		}
	, is =function( sMode, X, Y, Z, A ){
		var o = isNaN(Y)
			? parseString( X, sMode )
			: getObject(sMode, [0+X,0+Y,0+Z,A]) // Fast Conversion
		if( o ){
			o.mode = o.a===null ? sMode.slice(0,-1) : sMode
			return o
			}
		throw new Error ('INVALID_'+ sMode.toUpperCase() +'_COLOR ('+X+','+Y+','+Z+','+A+')' )
		}

	// CONVERSIONS
	// http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
	, f1= DECtoHEX =function( n ){
		n=n<0?0:(n>255?255:Math.round(n))
		if(n==0)return'00'
		n=new Number(n)
		var s=n.toString(16).toUpperCase()
		return(s.length==1?'0':'')+s
		}
	, f2= HEXtoDEC =function( s ){
		var _f=function(n){return '0123456789ABCDEF'.indexOf(s.charAt(n))}
		for(var n=0, nCoef=0, i=s.length-1; i>=0; i--, nCoef++)
			n+=_f(i)*Math.pow(16,nCoef)
		return n
		}
	, HEXtoRGB =function( HEX ){
		var _f=function(n){return f2(HEX.substr(n,2))}
		return Color.rgb( _f(0), _f(2), _f(4) )
		}
	, RGBtoHEX =function( RGB ){
		return Color.hex( f1(RGB.r) + f1(RGB.g) + f1(RGB.b) )
		}
	, RGBtoHSV =function( RGB ){
		var r=RGB.r/MAX.r, g=RGB.g/MAX.g, b=RGB.b/MAX.b
		var max = Math.max(r,g,b), min = Math.min(r,g,b)
		var h, s, v = max
		var d = max-min
		s = max==0 ? 0 : d/max
		if( max==min ) h = 0 // achromatic
		else{
			switch( max ){
				case r: h = (g-b)/d+( g<b ? 6 : 0 ); break
				case g: h = (b-r)/d+2; break
				case b: h = (r-g)/d+4; break
				}
			h /= 6
			}
		return Color.hsv( h*MAX.h, s*MAX.s, v*MAX.v, RGB.a )
		}
	, RGBtoHSL =function( RGB ){
		var r=RGB.r/MAX.r, g=RGB.g/MAX.g, b=RGB.b/MAX.b
		var max = Math.max(r,g,b), min = Math.min(r,g,b)
		var h, s, l = (max+min)/2
		if( max==min ) h = s = 0 // achromatic
		else{
			var d = max-min
			s = l>0.5 ? d/(2-max-min) : d/(max+min)
			switch(max){
				case r: h = (g-b)/d+( g<b ? 6 : 0 ); break
				case g: h = (b-r)/d+2; break
				case b: h = (r-g)/d+4; break
				}
			h /= 6
			}
		return Color.hsl( h*MAX.h, s*MAX.s, l*MAX.l, RGB.a )
		}
	, HSVtoRGB =function( HSV ){
		var h=HSV.h/MAX.h, s=HSV.s/MAX.s, v=HSV.v/MAX.v
		var r, g, b
		var i = Math.floor(h*6)
		var f = h*6-i
		var p = v*(1-s)
		var q = v*(1-f*s)
		var t = v*(1-(1-f)*s)
		switch( i%6 ){
			case 0: r=v,g=t,b=p; break
			case 1: r=q,g=v,b=p; break
			case 2: r=p,g=v,b=t; break
			case 3: r=p,g=q,b=v; break
			case 4: r=t,g=p,b=v; break
			case 5: r=v,g=p,b=q; break
			}
		return Color.rgb( r*MAX.r, g*MAX.g, b*MAX.b, HSV.a )
		}
	, HSVtoHSL =function( HSV ){
		var L = (2-HSV.s/100)*HSV.v/2
		, S = HSV.s*HSV.v/( L<50 ? L*2 : 200-L*2 )
		if( isNaN(S)) S = 0
		return Color.hsl( HSV.h, S, L, HSV.a )
		}
	, HSLtoRGB =function( HSL ){
			var h=HSL.h/MAX.h, s=HSL.s/MAX.s, l=HSL.l/MAX.l
			var r, g, b
			if( s==0 ) r=g=b=l // achromatic
			else{
				var q = l<0.5 ? l*(1+s) : l+s-l*s
				var p = 2*l-q
				function hue2rgb(t){
					if(t<0) t+=1
					if(t>1) t-=1
					if(t<1/6) return p+(q-p)*6*t
					if(t<1/2) return q
					if(t<2/3) return p+(q-p)*(2/3-t)*6
					return p
					}
				r = hue2rgb(h+1/3)
				g = hue2rgb(h)
				b = hue2rgb(h-1/3)
				}
			return Color.rgb( r*MAX.r, g*MAX.g, b*MAX.b, HSL.a )
			}
	, HSLtoHSV =function( HSL ){
		var a = 2*HSL.l/MAX.l
		, b = (a<=1?a:(2-a))*HSL.s/MAX.s
		, S = a+b==0?0:(2*b)/(a+b)*MAX.s
		return Color.hsv( HSL.h, S, (a+b)/2*MAX.v, HSL.a )
		}
	, CMYKtoRGB =function( CMYK ){
		var k = CMYK.k / MAX.k
		, f=function( s ){ return 1 - Math.min( 1, (CMYK[s]/MAX[s]) * ( 1 - k ) + k ) * MAX.r }
		return Color.rgb( f('c'), f('m'), f('y'))
		}
	, RGBtoCMYK =function( RGB ){
		var r= RGB.r/MAX.r, g= RGB.g/MAX.g, b= RGB.b/MAX.b
		, k = Math.min( 1 - r, 1 - g, 1 - b )
		, f =function( N ){ return k==1 ? 0 : MAX.c * ( 1 - N - k ) / ( 1 - k ) }
		return Color.cmyk( f(r), f(g), f(b), k * MAX.k )
		}

	, toString =function( sMode, X, Y, Z, a ){
		var s = X+','+Y+','+Z
		return sMode + ( a!==null ? 'a('+s+','+a+')' : '('+s+')' )
		}
	, value =function( n, sOption, sAxe ){
		return sOption
			? Math.round( 100 * n/MAX[sAxe] ) +'%'
			: Math.round( n )
		}

	// DIVERS
	, aDEC = '0,51,102,153,204,255'.split(',')
	, aDEC2 = '0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255'.split(',')
	, contrast =function( o1, o2 ){
		var _1 = o1.toRGB(), _2 = o2.toRGB()
		, f =function(s){ return Math.abs( _1[s] - _2[s] ) }
		, brightness =function( o ){ return ( o.r*299 + o.g*587 + o.b*114 )/1000 }
		, difference =function(){ return f('r') + f('g') + f('b') }
		return !( Math.abs( brightness(_1) - brightness(_2) ) < 125 || difference() < 500 )
		}
	Object.assign( Color, {
		hex :function( s ){
			return Object.assign( isHEX( s ), {
				mode: 'hex',
				toString :function( m ){ return (m||'') + this },
				toWeb :function(){return this.toHEX().toString('#')},
				toHEX :function(){return this},
				toRGB :function(){return HEXtoRGB(this)},
				toHSV :function(){return HEXtoRGB(this).toHSV()},
				toHSL :function(){return HEXtoRGB(this).toHSL()},
				toCMYK :function(){return HEXtoRGB(this).toCMYK()}
				})
			},
		rgb :function(R,G,B,A){
			return Object.assign( is('rgba',R,G,B,A), {
				toString :function( m ){
					return toString('rgb',
						value(this.r,m,'r'),
						value(this.g,m,'g'),
						value(this.b,m,'b'),
						this.a
						)
					},
				toWeb :function(){return this.toHEX().toString('#')},
				toHEX :function(){return RGBtoHEX(this)},
				toRGB :function(){return this},
				toHSV :function(){return RGBtoHSV(this)},
				toHSL :function(){return RGBtoHSL(this)},
				toCMYK :function(){return RGBtoCMYK(this)}
				})
			},
		hsv :function(H,S,V,A){
			return Object.assign( is('hsva',H,S,V,A), {
				toString :function( m ){
					return toString('hsv',
						value(this.h||0),
						value(this.s,m,'s'),
						value(this.v,m,'v'),
						this.a
						)
					},
				toWeb :function(){return this.toHEX().toString('#')},
				toHEX :function(){return this.toRGB().toHEX()},
				toRGB :function(){return HSVtoRGB(this)},
				toHSV :function(){return this},
				toHSL :function(){return HSVtoHSL(this)},
				toCMYK :function(){return this.toRGB().toCMYK()}
				})
			},
		hsl :function(H,S,L,A){
			return Object.assign( is('hsla',H,S,L,A), {
				toString :function( m ){
					return toString('hsl',
						value(this.h||0),
						value(this.s,m,'s'),
						value(this.l,m,'l'),
						this.a
						)
					},
				toWeb :function(){return this.toHEX().toString('#')},
				toHEX :function(){return this.toRGB().toHEX()},
				toRGB :function(){return HSLtoRGB(this)},
				toHSV :function(){return HSLtoHSV(this)},
				toHSL :function(){return this},
				toCMYK :function(){return this.toRGB().toCMYK()}
				})
			},
		cmyk :function(C,M,Y,K){
			return Object.assign( is('cmyk',C,M,Y,K), {
				toString :function( m ){
					return 'cmyk('+ [
						value(this.c,m,'c'),
						value(this.m,m,'m'),
						value(this.y,m,'y'),
						value(this.k,m,'k')
						] +')'
					},
				toWeb :function(){return this.toHEX().toString('#')},
				toHEX :function(){return this.toRGB().toHEX()},
				toRGB :function(){return CMYKtoRGB(this)},
				toHSV :function(){return this.toRGB().toHSV(this)},
				toHSL :function(){return this.toRGB().toHSL(this)},
				toCMYK :function(){return this }
				})
			},

		contrast:contrast,
		getWebSafe :function( m ){
			var o = ( m.split ? Color( m ) : m ).toRGB()
			, f=function( n ){ return DECtoHEX( Math.round( n / 51 ) * 51 )}
			return f(o.r)+f(o.g)+f(o.b)
			},
		inRange: inRange,
		visibleColor :function( o1 ){
			var n=aDEC.length, o2
			for(var i=0;i<n;i++)for(var j=0;j<n;j++)for(var k=0;k<n;k++)
				if( contrast( o1, o2 = Color.rgb( aDEC[i], aDEC[j], aDEC[k] )))
					return o2.toWeb()
			return '#000000'
			},
		visibleColors :function( o1 ){
			var a=[]
			var f =function( aDEC ){
				var n=aDEC.length, o2
				for(var i=0;i<n;i++)for(var j=0;j<n;j++)for(var k=0;k<n;k++)
					if( contrast( o1, o2 = Color.rgb( aDEC[i], aDEC[j], aDEC[k] )))
						a.push( o2.toWeb())
				}
			f( aDEC )
			return a
			}
		})
	
	return Color
	})()