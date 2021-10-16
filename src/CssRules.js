CssRules = ( function(){
	let _oSheets = document.styleSheets
	, _oSheet
	, e = document.getElementsByTagName('head')[0]
	, _getRules
	, f =function(){
		_oSheet = e.appendChild( document.createElement('STYLE')).sheet
		let s = _oSheet.rules ? 'rules' : 'cssRules'
		_getRules =(function(){
			return o=>{ try{return o[s]}catch(error){/* operation insecure */}}
			})()
		}
	if( e ) f(); else throw new Error ( 'CssRules::Tag HEAD needed.' )
	return {
		add( s ){
			let aRules=[]
			,reRules = /\s*([^\{]+)\{\s*([^\}]+)\}\s*/g
			
			console.info( Array.from(s.matchAll(reRules)) )
			// .forEach(a=>m[a[1]]=a[2])
			
			for(let a=s.split('}'),i=a.length-2;i>=0;i--)
				if(a[i].indexOf('{')!=-1)
					aRules.push(a[i].split('{'))
			for(let i=aRules.length-1,sName,sDeclBlock,o;i>=0;i--){
				sName=aRules[i][0].trim()
				sDeclBlock=aRules[i][1]
				o=this.get(sName)
				return o
					? Style.set(o,sDeclBlock) // ne rajoute ainsi pas un sélecteur 2 fois et permet une suppression en un coup.
					: _oSheet.insertRule(s)
				}
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
			for(let a=arguments,ni=a.length,i=0;i<ni;i++) this.get(a[i].trim(),true)
			return true
			}
		}
	})()