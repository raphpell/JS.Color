class Page {
	constructor (){
		this.eActif = null
		this.setActif( ePreload )
		}
	setActif ( e ){
		if( this.eActif ) this.eActif.classList.remove( 'active' )
		e.classList.add( 'active' )
		this.eActif = e
		}
	}
	
let oPage = new Page ()

goTo = e => oPage.setActif( e )