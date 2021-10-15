CssRules = ( function(){
	let _oStyleSheets = document.styleSheets
	, _oSheet
	, e = document.getElementsByTagName('head')[0]
	, _getRules
	, f =function(){
		_oSheet = e.appendChild( Tag( 'STYLE', { title:'CssRules', type:'text/css', media:'all' })).sheet
		let s = _oSheet.rules ? 'rules' : 'cssRules'
		_getRules =(function(){
			return o=>{ try{return o[s]}catch(e){}} // UPDATED : mozilla = operation insecure
			})()
		}
	if( e ) f(); else throw new Error ( 'CssRules::Tag HEAD needed.' )
	return {
		add( s ){
			let aRules=[]
			for(let a=s.split('}'),i=a.length-2;i>=0;i--)
				if(a[i].indexOf('{')!=-1)
					aRules.push(a[i].split('{'))
			for(let i=aRules.length-1,sName,sRule,o;i>=0;i--){
				sName=aRules[i][0].trim()
				sRule=aRules[i][1]
				o=this.get(sName)
				if(o) Style.set(o,sRule) // ne rajoute ainsi pas un sélecteur 2 fois et permet une suppression en un coup.
					else _oSheet.insertRule(sName,sRule)
				}
			},
		disable( rePattern, sAttr='href', bDisable ){
			for(let i=_oStyleSheets.length-1;i>=0;i--)
				if(rePattern.test(_oStyleSheets[i][sAttr]))
					_oStyleSheets[i].disabled=bDisable
			},
		get( sSelector, bDelete ){
			for(let i=_oStyleSheets.length-1;i>=0;i--){
				let aRules=_getRules( _oStyleSheets[i])
				if(aRules)
					for(let j=0,nj=aRules.length;j<nj;j++){
						if(aRules[j].selectorText==sSelector){
							if(bDelete===true)return _oStyleSheets[i].deleteRule(j)
							return aRules[j].style
							}
						}
				}
			return false
			},
		remove(){
			for(let a=arguments,ni=a.length,i=0;i<ni;i++) this.get(a[i].trim(),true)
			return true
			}
		}
	})()