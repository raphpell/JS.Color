// Dépendance : CssRules

Style =(()=>{
	const reCssDecl = /\s*([a-z\-]+)\s*:\s*([^\;]+);\s*/g
	, reNS = /-\w/g
	, _o = {
		'background-position':['null',''],
		'font-size':['int0+','px'],
		'font-weight':['int0+',''],
		'height':['int0+','px'],
		'opacity':['0..1',''],
		'width':['int0+','px'],
		}
	, _F ={
		'0+': n => n<=0?0:n,
		'0..1': n => n<=0?0:(n>=1?1:n.toFixed(2)),
		'int0+': n => n<=0?0:parseInt(n),
		'null': n => n
		}

	return {
		calculate( s, m ){
			if(!m&&m!==0) return ''
			if(_o[s]) return s+':'+_F[_o[s][0]](m)+_o[s][1]+";"
			let sUnit = /color/i.test( s )?'':'px'
			if(sUnit=='px') m=parseInt(m)||0
			return s+':'+m+sUnit+";"
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
			if(!~s.indexOf('-')) return s
			return s.replace( reNS, (s)=>s.charAt(1).toUpperCase())
			},
		remove( m, s ){ // m == CssRule || Element
			m=m.style
			s=Style.getAttributeNS(s)
			if(m && m[s]){
				if(m.removeProperty) m.removeProperty(s) 
					else try{m[s]=''}catch(e){}
				}
			},
		set( m, s ){
			m=m.style||m
			Array.from(s.matchAll(reCssDecl)).forEach(a=>m[a[1]]=a[2])
			return m.cssText
			}
		}
	})()