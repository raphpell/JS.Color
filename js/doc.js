/* Concerne la mise en page de la doc */

layoutDoc =(function(){
	var nSummaryCount = 0
	
	class Layout {
		constructor ( eSummary, oSettings, e ){
			nSummaryCount++
			this.sLinkPrefixe = '_'.repeat(nSummaryCount)
			if( oSettings ) Object.assign( this, oSettings )
			this.aHierarchy = this.getHierarchy ( e, 2 )
			let eH4 = document.createElement('H4')
			eH4.innerHTML = 'Sommaire'
			eSummary.appendChild( eH4 )
			eSummary.classList.add( 'summary' )
			this.displaySummary ( eSummary, this.aHierarchy )
			this.mapSections ( this.aHierarchy )
			}
		getHierarchy ( e, nIndex ){
			if( ! e ) e = document
			let a = []
			let o = this.getLevel( nIndex, e )
			for(var i = 0, ni=o.length; i<ni; i++ )
				a[i] = {
					title: o[i],
					childs: this.getHierarchy( o[i].parentNode, nIndex+1 )
					}
			return a 
			}
		getLevel ( nIndex, e ){
			e = e || document
			return e.getElementsByTagName('H'+nIndex )
			}
		displaySummary ( eSummary, a, nParentLevel ){
			if( ! a.length ) return ;
			let eOL = document.createElement('OL')
			for(var i = 0, ni=a.length; i<ni; i++ ){
				let eLI = document.createElement('LI')
				, nLevel = this.getNumbers( (i+1), nParentLevel )
				eLI.innerHTML = this.getLink( nLevel, a[i].title.innerHTML )
				this.displaySummary ( eLI, a[i].childs, nLevel )
				eOL.appendChild( eLI )
				}
			eSummary.appendChild( eOL )
			}
		mapSections ( a, nParentLevel ){
			for(var i = 0, ni=a.length; i<ni; i++ ){
				let e = a[i].title
				, nLevel = this.getNumbers( i+1, nParentLevel )
				e.innerHTML = this.getAnchor( nLevel, e.innerHTML )
				this.mapSections ( a[i].childs, nLevel )
				}
			}
		getNumbers ( nLevel, nParentLevel ){
			return ( nParentLevel ? nParentLevel : '' ) + nLevel +'.'
			}
		getLink ( nLevel, s ){
			let sText = ( this.numbers ? '<b>'+ nLevel +'</b> ' : '' )+ s
			return this.links
				? '<a href="#'+ this.sLinkPrefixe + nLevel +'">'+ sText +'</a>'
				: sText
			}
		getAnchor ( nLevel, s ){
			return '<a name="'+ this.sLinkPrefixe + nLevel +'"></a>'+ ( this.numbers ? '<b>'+ nLevel +'</b> ' : '' )+ s
			}
		}

	return function( eSummary, oSettings, e ){
		let o = new Layout ( eSummary, oSettings, e )
		}
	})()