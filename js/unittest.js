class UnitTest {
	constructor ( eTarget, a ){
		let eDF = new DocumentFragment ()
		, _ = s =>{ return document.createElement( s )}
		
		a.forEach( o =>{
			
			
			let eDL = _('DL'), eTitle, bOK = true
			if( o.title ){
				eTitle = _('DT')
				eTitle.innerHTML = o.title
				eTitle.className = 'title'
				eDL.appendChild( eTitle )
				}
			if( o.desc ){
				let eDesc = _('DT')
				eDesc.innerHTML = o.desc
				eDL.appendChild( eDesc )
				}
			
			if( o.eval )
				o.eval.forEach( s =>{
					let eDT = _('DT')
					eDT.innerHTML = '<pre>'+ s +'</pre>'
					try{
						eval( s )
					}catch( e ){
						bOK = false
						let eDIV = _('DIV')
						eDIV.innerHTML = e.toString()
						eDIV.className = 'error'
						eDT.appendChild( eDIV )
						 throw e
						}
					eDL.appendChild( eDT )
					})
			if( o.assertions )
				o.assertions.forEach( s =>{
					let eDD = _('DD')
					eDD.innerHTML = '<code>'+ s +'</code>'
					try{
						let b = eval( s )
						bOK &&= b
						eDD.className = b ? 'true' : 'false'
					}catch( e ){
						bOK = false
						let eDIV = _('DIV')
						eDIV.innerHTML = e.toString()
						eDIV.className = 'error'
						eDD.appendChild( eDIV )
						throw e
						}
					eDL.appendChild( eDD )
					})
			if( eTitle ) eTitle.classList.add( bOK ? 'true' : 'false' )
			eDF.appendChild( eDL )
			})
		eTarget.appendChild( eDF )
		}
	}