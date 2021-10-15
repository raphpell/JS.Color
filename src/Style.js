// Dépendance : CssRules, Tag, Array.unique, each

Style ={
	calculate( s, m ){
		if( ! m && m !== 0 ) return ''
		var bColor = /color/i.test( s ), sUnit = ''
		switch( s ){
			case 'font-size':
			case 'height':
			case 'width':
				m=m<0?0:m
				break
			case 'opacity':
				m = new Number ( m )
				n = m <= 0 ? 0 :( m >= 1 ? 1 : m.toFixed( 2 ))
				return 'opacity:'+ n
			}
		switch( s ){
			// case 'font-size' : sUnit = 'em' ; break;
			case 'font-weight' : sUnit = '' ; m = parseInt( m );break;
			case 'background-position' : sUnit = '';break;
			default :
				sUnit = bColor ? '' : 'px'
				if( sUnit == 'px' ) m = parseInt( m ) || 0
			}
		return s + ':' + m + sUnit + ';'
		},
	get( e, sAttr ){
		let s = Style.getAttributeNS( sAttr )
		let sValue = e.style[s]
		|| e.currentStyle && e.currentStyle[s]
		|| window.getComputedStyle && window.getComputedStyle( e )[s]
		if( sValue && sValue!='0px' ) return sValue
		if( window.CssRules ){
			let f = sSelector =>{
				let o = CssRules.get( sSelector )
				let sValue = o && o[s]
				return sValue && sValue!='0px' ? sValue : null
				}
			if( e.id ){
				var m = f( '#'+e.id )
				if( m ) return m
				}
			e.classList.forEach( sClassName =>{
				sValue = f( '.'+sClassName ) || sValue
				})
			return sValue || null
			}
		},
	getAttributeNS( s ){
		if(~s.indexOf('-')) return s
		let a=s.split('-')
		for(let i=1,n=a.length;i<n;i++)
			a[i] = a[i].charAt(0).toUpperCase()+a[i].substr(1)
		return a.join('')
		},
	remove( m, s ){ // m == CssRule || Element
		m=m.style
		s=Style.getAttributeNS( s )
		if( m && m[s]){
			if( m.removeProperty ) m.removeProperty( s ) 
				else try{ m[s] = '' }catch(e){}
			}
		},
	set( m, s ){
		var e = m
		, m = m.style || m
		, o = {}
		, aAttr = []
		each( ( m.cssText+';'+s ).split( ';' ),function(sAttr){
			var a = sAttr.split( ':' ), key
			if( a.length == 2 && a[1]){
				aAttr.push( key = a[0].trim().toUpperCase())
				o[ key ] = a[1] || ''
				}
			})
		s = ''
		each( Array.unique( aAttr ), function( key ){
				s += key +':'+ o[ key ] +';'
			})
		var sBG1 = m.backgroundImage
		m.cssText = s
		if( sBG1 ) m.backgroundImage = sBG1 // For Chrome
		return s
		}
	}