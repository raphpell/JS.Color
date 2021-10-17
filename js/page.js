class Page {
	constructor (){
		this.eActif = null
		this.setActif( ePreload )
		}
	setActif ( e ){
		this.update( this.eActif, 'remove' )
		this.update( e, 'add' )
		this.eActif = e
		}
	update ( e, sAction ){
		if( ! e ) return;
		e.classList[sAction]( 'active' )
		e = document.getElementById( e.id+'Menu')
		if( e ) e.classList[sAction]('active')
		}
	}
	
let oPage = new Page ()

goTo = e => oPage.setActif( e )