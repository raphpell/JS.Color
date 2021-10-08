/* Concerne la mise en page de la doc */

layoutDoc =(function(){
	class Layout {
		constructor ( eSummary, oSettings ){
			if( oSettings ) Object.assign( this, oSettings )
			this.aHierarchy = this.getHierarchy ()
			let eH4 = document.createElement('H4')
			eH4.innerHTML = 'Sommaire'
			eSummary.appendChild( eH4 )
			this.displaySummary ( eSummary, this.aHierarchy )
			this.mapSections ( this.aHierarchy )
			}
		getHierarchy ( e, nIndex ){
			if( ! e ){
				e = document
				nIndex = 2
				}
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
				? '<a href="#'+ nLevel +'">'+ sText +'</a>'
				: sText
			}
		getAnchor ( nLevel, s ){
			return '<a name="'+ nLevel +'">'+ ( this.numbers ? '<b>'+ nLevel +'</b> ' : '' )+ s +'</a>'
			}
		}

	return function( eSummary, oSettings ){
		let o = new Layout ( eSummary, oSettings )
		}
	})()