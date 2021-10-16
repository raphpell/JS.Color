CssRules = ( function(){
	let _oSheet, _getRules
	const reRules = /\s*([^\{]+)\{\s*([^\}]+)\}\s*/g
	, _oSheets = document.styleSheets
	, e = document.getElementsByTagName('head')[0]
	, f =()=>{
		_oSheet = e.appendChild( document.createElement('STYLE')).sheet
		let s = _oSheet.cssRules ? 'cssRules' : 'rules'
		_getRules =(function(){/*prevent operation insecure*/
			return o=>{ try{return o[s]}catch(error){}}
			})()
		}
	if( e ) f(); else throw new Error ( 'CssRules::Tag HEAD needed.' )
	return {
		add( s ){
			let m = []
			Array.from(s.matchAll(reRules)).forEach(a=>{
				o=this.get(a[1].trim())
				m.push( o
					? Style.set(o, a[2]) // ne rajoute ainsi pas un sélecteur 2 fois
					: _getRules(_oSheet)[_oSheet.insertRule(a[0],_oSheet.cssRules.length)].style.cssText
					)
				})
			return m.length==1?m[0]:m
			},
		disable( rePattern, sAttr='href', bDisable ){
			for(let i=_oSheets.length-1;i>=0;i--)
				if(rePattern.test(_oSheets[i][sAttr]))
					_oSheets[i].disabled=bDisable
			},
		get( sSelector, bDelete ){
			for(let i=_oSheets.length-1;i>=0;i--){
				let aRules=_getRules( _oSheets[i])
				if(aRules)
					for(let j=0,nj=aRules.length;j<nj;j++){
						if(aRules[j].selectorText==sSelector){
							if(bDelete===true)return _oSheets[i].deleteRule(j)
							return aRules[j].style
							}
						}
				}
			return false
			},
		remove(){
			for(let a=arguments,ni=a.length,i=0;i<ni;i++) this.get(a[i],true)
			return true
			}
		}
	})()