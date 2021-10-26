Memoire =(function(sBase){
	try{
		let o=JSON.parse(localStorage.getItem(sBase))||{}
		return{
			clear:()=>localStorage.removeItem(sBase),
			set:(sName,mValue)=>{
				if(o[sName]==mValue) return false
				o[sName]=mValue
				localStorage.setItem(sBase,JSON.stringify(o))
				return true
				},
			get:sName=>o[sName],
			remove:sName=>{
				delete o[sName]
				localStorage.setItem(sBase,JSON.stringify(o))
				}
			}
		}catch(e){return{clear:()=>{},set:()=>{},get:()=>{},remove:()=>{}}}
	})('JS.Objects')

class Page {
	constructor (){
		this.eActif = null
		this.setActif( ePreload )
		}
	setActif ( e ){ 
		if(!e) return goTo(document.getElementById( Memoire.get('page')||'eDoc')||eDoc)
		this.update( this.eActif, 'remove' )
		this.update( e, 'add' )
		this.eActif = e
		if( e.id!="ePreload") Memoire.set('page',e.id)
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