MyStorage =(function(){
	let LS = {}
	
	return function( sPATH ){
		let PATH = sPATH.split('/')
		const sBase = PATH.shift()
		if(!LS[sBase]) LS[sBase] = JSON.parse( localStorage.getItem( sBase ))||{}
		let ROOT = LS[sBase] // Objet au début du chemin
		let o = ROOT // Objet à la fin du chemin
		let bNewPath = false
		PATH.forEach( sKey=>{
			if(o[sKey]===undefined){
				o[sKey] = {}
				bNewPath = true
				}
			o = o[sKey]
			})
		let write = ()=>localStorage.setItem(sBase,JSON.stringify(ROOT))
		let MyStorage ={
			clear (){
				if( PATH.length==0 ){
					localStorage.removeItem(sBase)
					LS[sBase] = ROOT = o = {}
					}
				else{
					let oTarget = ROOT
					for(var i=0,ni=PATH.length;i<ni;i++){
						if( i==ni-1 ){
							delete oTarget[PATH[i]] 
							write()
							oTarget[PATH[i]] = o = {}
							} else oTarget = oTarget[PATH[i]]
						}
					}
				},
			get ( sName ){
				if(~sName.indexOf('/')){
					let path = sName.split('/')
					, target = o
					for(var i=0,ni=path.length;i<ni;i++){
						if( i==ni-1 ){
							return target[path[i]]
						}else{
							if(target[path[i]]===undefined) return undefined
							target = target[path[i]]
							}
						}
					}
				else return o[sName]
				},
			set ( sName, mValue ){
				if(~sName.indexOf('/')){
					let path = sName.split('/')
					, target = o
					for(var i=0,ni=path.length;i<ni;i++){
						if( i==ni-1 ){
							if(target[path[i]]==mValue) return false
							target[path[i]]=mValue
						}else{
							if(target[path[i]]===undefined) target[path[i]]={}
							target = target[path[i]]
							}
						}
				}else {
					if(o[sName]==mValue) return false
					o[sName]=mValue
					}
				write()
				return true
				},
			get value(){ return o },
			set value ( oNewValue ){
				if( PATH.length==0 ){
					o = ROOT = LS[sBase] = oNewValue
				}else{
					let oTarget = ROOT
					for(var i=0,ni=PATH.length;i<ni;i++){
						if( i==ni-1 ) o = oTarget[PATH[i]] = oNewValue
							else oTarget = oTarget[PATH[i]]
						}
					}
				write()
				},
			remove ( sName ){
				if(~sName.indexOf('/')){
					let path = sName.split('/')
					, target = o
					for(var i=0,ni=path.length;i<ni;i++){
						if( i==ni-1 ){
							delete target[path[i]]
						}else{
							if(target[path[i]]===undefined) return undefined
							target = target[path[i]]
							}
						}
				}else delete o[sName]
				write()
				},
			write (){ write()}
			}
		if( bNewPath ) write()
		return MyStorage
		}
	})()