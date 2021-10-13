CssRules = ( function(){
	var _oStyleSheets = document.styleSheets
	, _oStyleSheet
	, e = getTags( 'head' )[0]
	, _getRules
	, f =function(){
		e.appendChild( Tag( 'STYLE', { title:'CssRules', type:'text/css', media:'all' }))
		for( var i = _oStyleSheets.length - 1 ; i >= 0 ; i-- )
			if( _oStyleSheets[i].title == 'CssRules' ){
				_oStyleSheet = _oStyleSheets[i]
				break
				}
		var b = _oStyleSheet.rules // true == IE , Safari , Chrome // false == Firefox, etc
		_getRules =(function(){
			var s = b ? 'rules' : 'cssRules'
			return function( o ){ try{ return o[ s ] }catch(e){ return null }} // UPDATED : mozilla = operation insecure
			})()
		if( ! b ){
			// if the navigator respect the standard...
			let o = CSSStyleSheet.prototype
			Object.assign( o, {
				addRule ( s1, s2 ){ this.insertRule( s1+'{'+s2+'}', 0 )}
				removeRule: o.deleteRule
				}
			}
		}
	if( e ) f(); else throw new Error ( 'Tag HEAD undefined.' )
	return {
		add( s ){
			if( s ){
				var aRules = []
				for( var a = s.split('}'), i = a.length - 2 ; i >= 0 ; i-- )
					if( a[i].indexOf('{') != -1 )
						aRules.push( a[i].split('{'))
				for( var i = aRules.length - 1, sName, sRule, o ; i >= 0 ; i-- ){
					sName = aRules[i][0].trim()
					sRule = aRules[i][1]
					o = this.get( sName )
					if( o ) Style.set( o, sRule ) // ne rajoute ainsi pas un sélecteur 2 fois et permet une suppression en un coup.
						else _oStyleSheet.insertRule( sName, sRule )
					}
				}
			},
		disable( rePattern, sAttr, bDisable ){
			sAttr = sAttr || 'href'
			for( var i = _oStyleSheets.length - 1 ; i >= 0 ; i-- )
				if( rePattern.test( _oStyleSheets[i][ sAttr ]))
					_oStyleSheets[i].disabled = bDisable
			},
		get( s, bDelete ){
			var sToLowerCase = s.toLowerCase()
			for( var i = _oStyleSheets.length - 1 ; i >= 0 ; i-- ){
				var aRules = _getRules( _oStyleSheets[i])
				if( aRules ) for( var j = 0, nj = aRules.length ; j < nj ; j++ ){
					s = aRules[j].selectorText
					if( s && s.toLowerCase() == sToLowerCase ){
						if( bDelete === true ) return _oStyleSheets[i].removeRule(j)
						return aRules[j].style
						}
					}
				}
			return false
			},
		remove(){
			for( var a = arguments, ni = a.length, i = 0 ; i < ni ; i++ )
				this.get( a[i].trim(), true )
			return true
			}
		}
	})()