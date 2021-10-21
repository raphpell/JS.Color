UnitTest =(function(){
	let _ = ( sNodeName, sInnerHTML, sClassName ) =>{
		let e = document.createElement( sNodeName )
		if( sInnerHTML ) e.innerHTML = sInnerHTML
		if( sClassName ) e.className = 'UT_'+ sClassName
		return e
		}
	class UnitTest {
		constructor ( eTarget, a, oSettings = { unittest:true, benchmark:false }){
			Object.assign( this, oSettings )
			this.nError = 0
			let e = this.evalList( a, 2 )
			eTarget.appendChild( e )
			if( this.benchmark ){
				let eButton = _('BUTTON')
				eButton.innerHTML = "Benchmark ("+Benchmark.total+")"
				eButton.count = Benchmark.total
				eButton.onclick = ()=>{
					Benchmark.repeat( eTarget )
					eButton.innerHTML = "Benchmark ("+(eButton.count+=Benchmark.total)+")"
					}
				e.insertBefore( eButton, e.firstChild )
				}
			if( this.unittest )
				e.insertBefore(
					this.nError
						? _('DIV', 'Attention: '+this.nError+' erreur(s) !', 'error' )
						: _('DIV', "Ok! pas une erreur.", 'correct' )
					, e.firstChild )
			}
		evalList ( a, nLevel ){
			let eDL = _('DL', null, 'list')
			a.forEach( o =>{
				let eDT = _('DT', null, 'section')
				this.getTitle( o, nLevel, eDT )
				this.getDesc( o, eDT )
				this.getEval( o, eDT )
				this.getAssertions( o, eDT )
				this.getList( o, nLevel, eDT )
				eDL.appendChild( eDT )
				})
			return eDL
			}
		getTitle ( o, nLevel, e ){
			return o.title
				? e.appendChild( _('H'+ nLevel , o.title, 'title' ))
				: null
			}
		getDesc ( o, e ){
			return o.desc 
				? e.appendChild( _('DIV', o.desc, 'desc' ) )
				: null
			}
		getEval ( o, e ){
			if( o.eval ){
				let ePRE = _('PRE', o.eval, 'eval' )
				try{
					eval( o.eval )
				}catch( error ){
					this.nError++
					ePRE.appendChild( _('DIV', error.toString(), 'error' ))
					console.info( error )
					// throw error
					}
				return  e.appendChild( ePRE )
				}
			return null
			}
		getAssertions ( o, e ){
			if( o.assertions ){
				let eDL2 = _('DL', null, 'assertions' )
				o.assertions.forEach( s =>{
					let eDD = _('DD', '<code>'+ s +'</code>' )
					try{
						let b = eval( s )
						if( ! b ) this.nError++
						if( this.unittest ) eDD.className = b ? 'UT_true' : 'UT_false'
						if( this.benchmark ) Benchmark.element( eDD.firstChild )
					}catch( error ){
						this.nError++
						eDD.className ='UT_false'
						eDD.appendChild( _('DIV', error.toString(), 'error' ))
						console.info( error )
						// throw error
						}
					eDL2.appendChild( eDD )
					return  e.appendChild( eDL2 )
					})
				}
			return null
			}
		getList ( o, nLevel, e ){
			return o.list
				? e.appendChild( this.evalList( o.list, nLevel+1 ))
				: null
			}
		}
	return UnitTest
	})()