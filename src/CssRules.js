CssRules = ( function(){
	let _oSheets = document.styleSheets
	, eStyle = document.createElement('STYLE')
	eStyle.title = 'CssRules'
	let _oSheet = document.firstElementChild.appendChild( eStyle ).sheet
	, s = _oSheet.cssRules ? 'cssRules' : 'rules'
	, _getRules = o=>{ try{return o[s]}catch(error){}} /*prevent operation insecure*/
	return {
		add( s ){
			let m = []
			Array.from(s.matchAll(/\s*([^\{]+)\{\s*([^\}]+)\}\s*/g)).forEach(a=>{
				o=this.get(a[1].trim())
				m.push( o
					? Style.set(o, a[2]) // ne rajoute ainsi pas un sélecteur 2 fois
					: _getRules(_oSheet)[_oSheet.insertRule(a[0],_oSheet.cssRules.length)].style
					)
				})
			return m.length==1?m[0]:m
			},
		disable( bDisable=1, sAttr='title'||'href', rePattern=/CssRules/ ){
			for(let i=_oSheets.length-1;i>=0;i--){
				let oSheet = _oSheets[i]
				if(rePattern.test(oSheet[sAttr])){
					oSheet.disabled=bDisable
					return oSheet
					}
				}
			return null
			},
		get( sSelector, bDelete=0 ){
			for(let i=_oSheets.length-1;i>=0;i--){
				let aRules=_getRules( _oSheets[i])
				if(aRules)
					for(let j=0,nj=aRules.length;j<nj;j++){
						if(aRules[j].selectorText==sSelector){
							if(bDelete)return _oSheets[i].deleteRule(j)
							return aRules[j].style
							}
						}
				}
			return null
			},
		remove( ...a ){
			a.forEach( s=>this.get(s,true) )
			}
		}
	})()