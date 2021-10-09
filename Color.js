Color =(function(){
	let Color = s =>{
		if( ! s || ! s.charAt ) return s
		if( s.charAt(0)=='#' || s.length<=6 ) return Color.hex( s )
		for(let a=['rgb','hsv','hsl','cmyk'], i=0, ni=a.length; i<ni; i++ )
			if(!s.indexOf(a[i])||!s.indexOf(a[i].toUpperCase()))
				return Color[a[i]]( s )
		throw new Error ('INVALID_COLOR '+ s )
		}

	, MAX= {r:255,g:255,b:255,h:359,s:100,v:100,l:100,c:100,m:100,y:100,k:100,a:1}

	// VALIDATIONS
	, parseString =( s, sMode )=>{
		let a =[], i =-1, re =new RegExp( "^\\s*"+ sMode +"?\\s*\\(([^)]+)\\)", 'gim' )
		s.replace( re, function( sFound, $1 ){
			$1.replace( /\s*(-?\.?\d+(?:\.\d*)?)(%?)\s*,?/gim, function( sFound, $1, $2 ){
				if( i++ < 4 ) a[i] = $2 ? MAX[ sMode.charAt(i)] * $1 / 100 : $1*1
				})
			})
		if( a.length ) return getObject( sMode, a )
		return null
		}
	, getObject =( sMode, a )=>{
		let o ={}
		for(let i=0; s=sMode.charAt(i); i++ ) o[s] = inRange( a[i], s )
		return o
		}
	, inRange =(n,s)=>{
		if( isNaN(n) || ! MAX[s]) return null
		return n>MAX[s]?MAX[s]:(n<0?0:n)
		}
	, isHEX = s =>{
		if( s[0]=='#' ) s = s.slice(1)
		if( s.length==1 ) s = s[0]+s[0]+s[0]+s[0]+s[0]+s[0]
		if( s.length==3 ) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2]
		if( /^[\dABCDEF]{6}$/i.test( s )) return s.toUpperCase()
		throw new Error ('INVALID_HEXADECIMAL_COLOR '+ s )
		}
	, is =( sMode, X, Y, Z, A )=>{
		let o = isNaN(Y)
			? parseString( X, sMode )
			: getObject(sMode, [0+X,0+Y,0+Z,A]) // Fast Conversion
		if( o ){
			o.mode = o.a===null ? sMode.slice(0,-1) : sMode
			return o
			}
		throw new Error ('INVALID_'+ sMode.toUpperCase() +'_COLOR ('+X+','+Y+','+Z+','+A+')' )
		}

	// CONVERSIONS
	, f1= DECtoHEX = n =>{
		n=n<0?0:(n>255?255:Math.round(n))
		if(n==0)return'00'
		n=new Number(n)
		let s=n.toString(16).toUpperCase()
		return(s.length==1?'0':'')+s
		}
	, f2= HEXtoDEC = s =>{
		let n=0, f= n => '0123456789ABCDEF'.indexOf( s.charAt(n))
		for(let nCoef=0, i=s.length-1; i>=0; i--, nCoef++)
			n+=f(i)*Math.pow(16,nCoef)
		return n
		}
	, HEXtoRGB = HEX =>{
		let f = n => f2(HEX.substr(n,2))
		return Color.rgb(f(0),f(2),f(4))
		}
	, RGBtoHEX = o => Color.hex( f1(o.r) + f1(o.g) + f1(o.b))
	, RGBtoHSV = o =>{
		let r=o.r/MAX.r, g=o.g/MAX.g, b=o.b/MAX.b
		let max = Math.max(r,g,b), min = Math.min(r,g,b)
		let h, s, v = max
		let d = max-min
		s = max==0?0:d/max
		if( max==min ) h = 0 // achromatic
		else{
			switch( max ){
				case r: h = (g-b)/d+( g<b ? 6 : 0 ); break
				case g: h = (b-r)/d+2; break
				case b: h = (r-g)/d+4; break
				}
			h /= 6
			}
		return Color.hsv( h*MAX.h, s*MAX.s, v*MAX.v, o.a )
		}
	, RGBtoHSL = o =>{
		let r=o.r/MAX.r, g=o.g/MAX.g, b=o.b/MAX.b
		, max = Math.max(r,g,b), min = Math.min(r,g,b)
		, h, s, l = (max+min)/2
		if( max==min ) h = s = 0 // achromatic
		else{
			let d = max-min
			s = l>0.5 ? d/(2-max-min) : d/(max+min)
			switch(max){
				case r: h = (g-b)/d+(g<b?6:0); break
				case g: h = (b-r)/d+2; break
				case b: h = (r-g)/d+4; break
				}
			h /= 6
			}
		return Color.hsl( h*MAX.h, s*MAX.s, l*MAX.l, o.a )
		}
	, HSVtoRGB = o =>{
		let h=o.h/MAX.h, s=o.s/MAX.s, v=o.v/MAX.v
		let r, g, b
		let i = Math.floor(h*6)
		let f = h*6-i
		let p = v*(1-s)
		let q = v*(1-f*s)
		let t = v*(1-(1-f)*s)
		switch( i%6 ){
			case 0: r=v,g=t,b=p; break
			case 1: r=q,g=v,b=p; break
			case 2: r=p,g=v,b=t; break
			case 3: r=p,g=q,b=v; break
			case 4: r=t,g=p,b=v; break
			case 5: r=v,g=p,b=q; break
			}
		return Color.rgb( r*MAX.r, g*MAX.g, b*MAX.b, o.a )
		}
	, HSVtoHSL = o =>{
		let L = (2-o.s/100)*o.v/2
		, S = o.s*o.v/(L<50?L*2:200-L*2)
		if( isNaN(S)) S = 0
		return Color.hsl(o.h,S,L,o.a)
		}
	, HSLtoRGB = o =>{
		let h=o.h/MAX.h
		, s=o.s/MAX.s
		, l=o.l/MAX.l
		, r,g,b
		if( s==0 ) r=g=b=l // achromatic
		else{
			let q = l<0.5?l*(1+s):l+s-l*s
			, p = 2*l-q
			, hue2rgb = t =>{
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
		return Color.rgb(r*MAX.r,g*MAX.g,b*MAX.b,o.a)
		}
	, HSLtoHSV = o =>{
		let a = 2*o.l/MAX.l
		, b = (a<=1?a:(2-a))*o.s/MAX.s
		, S = a+b==0?0:(2*b)/(a+b)*MAX.s
		return Color.hsv(o.h,S,(a+b)/2*MAX.v,o.a)
		}
	, CMYKtoRGB = o =>{
		let n = 255*(100-o.k)/10000
		, f = s => n*(100-o[s])
		return Color.rgb(f('c'),f('m'),f('y'))
		}
	, RGBtoCMYK = o =>{
		let r= o.r/MAX.r
		, g= o.g/MAX.g, b= o.b/MAX.b
		, k = 1-Math.max(r,g,b)
		, f = N => k==1?0:MAX.c*(1-N-k)/(1-k)
		return Color.cmyk( f(r), f(g), f(b), k*MAX.k )
		}

	, toString = ( sMode, X, Y, Z, a )=>{
		let s = X+','+Y+','+Z
		return sMode + ( a!==null ? 'a('+s+','+a+')' : '('+s+')' )
		}
	, value = ( n, sOption, sAxe )=>{
		return sOption
			? Math.round( 100 * n/MAX[sAxe] ) +'%'
			: Math.round( n )
		}

	// DIVERS
	, aDEC = '0,51,102,153,204,255'.split(',')
	, contrast =function( o1, o2 ){
		let _1 = o1.toRGB(), _2 = o2.toRGB()
		, f = s => Math.abs( _1[s] - _2[s] )
		, brightness =  o => ( o.r*299 + o.g*587 + o.b*114 )/1000
		, difference = () => f('r') + f('g') + f('b')
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
				toString :function( m ){ return toString('rgb', value(this.r,m,'r'), value(this.g,m,'g'), value(this.b,m,'b'), this.a ) },
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
				toString :function( m ){ return toString('hsv', value(this.h||0), value(this.s,m,'s'), value(this.v,m,'v'), this.a ) },
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
				toString :function( m ){ return toString('hsl', value(this.h||0), value(this.s,m,'s'), value(this.l,m,'l'), this.a ) },
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
				toString :function( m ){ return 'cmyk('+ [ value(this.c,m,'c'), value(this.m,m,'m'), value(this.y,m,'y'), value(this.k,m,'k') ] +')' },
				toWeb :function(){return this.toHEX().toString('#')},
				toHEX :function(){return this.toRGB().toHEX()},
				toRGB :function(){return CMYKtoRGB(this)},
				toHSV :function(){return this.toRGB().toHSV(this)},
				toHSL :function(){return this.toRGB().toHSL(this)},
				toCMYK :function(){return this }
				})
			},
		contrast :contrast,
		getWebSafe :  m =>{
			let o = ( m.split ? Color( m ) : m ).toRGB()
			, f = n => DECtoHEX( Math.round( n / 51 ) * 51 )
			return f(o.r)+f(o.g)+f(o.b)
			},
		inRange : inRange,
		visibleColor : o1 =>{
			let n=aDEC.length, o2
			for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++)
				if( contrast( o1, o2 = Color.rgb( aDEC[i], aDEC[j], aDEC[k] )))
					return o2.toWeb()
			return '#000000'
			},
		visibleColors : o1 =>{
			let a=[]
			let f = aDEC => {
				let n=aDEC.length, o2
				for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++)
					if( contrast( o1, o2 = Color.rgb( aDEC[i], aDEC[j], aDEC[k] )))
						a.push( o2.toWeb())
				}
			f( aDEC )
			return a
			}
		})

	return Color
	})()