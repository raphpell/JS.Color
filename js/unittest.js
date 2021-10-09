UnitTest =(function(){
	let _ = ( sNodeName, sInnerHTML, sClassName ) =>{
		let e = document.createElement( sNodeName )
		if( sInnerHTML ) e.innerHTML = sInnerHTML
		if( sClassName ) e.className = sClassName
		return e
		}

	class UnitTest {
		constructor ( eTarget, a ){
			eTarget.appendChild( this.evalList( a, 2 ))
			}
		getTitle ( o, nLevel, eParent ){
			return o.title
				? eParent.appendChild( _('H'+ nLevel , o.title, 'title' ))
				: null
			}
		getDesc ( o, eParent ){
			return o.desc 
				? eParent.appendChild( _('DIV', o.desc, 'desc' ) )
				: null
			}
		getEval ( o, eParent ){
			if( o.eval ){
				let ePRE = _('PRE', o.eval, 'eval' )
				try{
					eval( o.eval )
				}catch( e ){
					bOK = false
					let eDIV = _('DIV', e.toString(), 'error' )
					ePRE.appendChild( eDIV )
					// throw e
					}
				eParent.appendChild( ePRE )
				}
			}

		evalList ( a, nLevel ){
			let eDL = _('DL', null, 'list')
			a.forEach( o =>{
				let eDT = _('DT', null, 'section')
				, bOK = true
				, eTitle = this.getTitle( o, nLevel, eDT )
				, eDesc = this.getDesc( o, eDT )
				this.getEval( o, eDT )

				if( o.assertions ){
					let eDL2 = _('DL', null, 'assertions' )
					o.assertions.forEach( s =>{
						let eDD = _('DD', '<code>'+ s +'</code>' )
						try{
							let b = eval( s )
							bOK &&= b
							eDD.className = b ? 'true' : 'false'
						}catch( e ){
							bOK = false
							let eDIV = _('DIV', e.toString(), 'error' )
							eDD.appendChild( eDIV )
							// throw e
							}
						eDL2.appendChild( eDD )
						eDT.appendChild( eDL2 )
						})
					}
				if( o.list ){
					eDT.appendChild( this.evalList( o.list, nLevel+1 ))
					}
				eDL.appendChild( eDT )
				})
			return eDL
			}
		}
	return UnitTest
	})()