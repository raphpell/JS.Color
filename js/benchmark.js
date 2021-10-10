class Chrono {
	constructor(){ 
		if( performance == undefined ) throw Error ( "Chrono - Object performance undefined" )
		}
	pause(){ return performance.now()}
	start(){ this.dStart = performance.now() }
	stop(){
		this.dStop = performance.now() 
		var nTime = this.dStop - this.dStart
		if( this.onstop ) this.onstop( nTime )
		return nTime
		}
	}

var Benchmark =(function(){
	let oChrono = new Chrono
	let Benchmark = ( e, sNodeName )=>{
		let a = e.getElementsByTagName( sNodeName )
		for(let i=0,ni=a.length;i<ni;i++)
			Benchmark.element( a[i])
		}
	Benchmark.total = 20
	Benchmark.string = ( s, nId = Stats.length )=>{
		let f = new Function ( s )
		for(var j=0;j<Benchmark.total;j++){
			oChrono.start()
			f()
			Stats.set( nId, oChrono.stop())
			}
		return Stats.print.only( Stats.get( nId ))
		}
	Benchmark.element = ( e, sNodeName="DIV" )=>{
		if( e.className == 'bench' ){
			e.innerHTML = Benchmark.string( e.previousSibling.innerHTML, e.statsID )
			}
		else{
			let eTime = document.createElement( sNodeName )
			eTime.className = 'bench'
			eTime.statsID = Stats.length
			e.parentNode.insertBefore( eTime, e.nextSibling )
			eTime.innerHTML = Benchmark.string( e.innerHTML, eTime.statsID )
			}
		}
	Benchmark.repeat = ( e )=>{
		let a = e.getElementsByClassName( 'bench' )
		for(let i=0,ni=a.length;i<ni;i++)
			Benchmark.element( a[i])
		}
	return Benchmark
	})()


var Stats =(function(){
	var aStats = []
	aStats.get= nID => aStats[nID]
	aStats.getTime= n =>{
			n = (n*1000)
			if( n < 100 ) return n ? n.toFixed(0) +' µs' : 0
			n = (n/1000)
			if( n < 100 ) return n.toFixed(2) +' ms'
			n = (n/1000)
			return n.toFixed(2) +' s'
			}
	aStats.init= nID => aStats[nID] = null
	aStats.reset= () => aStats.length = 0
	aStats.set = ( nID, n )=>{
		var o = aStats[nID]
		if( ! o ) o = aStats[nID] = { key:nID, now:n, min:n, moy:n, max:n, som:n, tot:1 }
		else {
			o.now = n
			if( n < o.min ) o.min = n
			if( n > o.max ) o.max = n
			o.som += n
			o.tot++
			o.moy = o.som / o.tot
			}
		}
	aStats.print ={
		now:0,
		min:1,
		moy:0,
		moy:1,
		max:1,
		tot:0,
		som:1,
		moyTot:0,
		times :function( nNow, nMin, nMoy, nMax, nTot, nSum ){
			let a =[]
			, that = this
			, f= ( sAttr, sValue ) => that[ sAttr ] && sValue ? a.push( sAttr+': <b>' + sValue +'</b>' ) : null
			f( 'now', nNow )
			f( 'min', nMin )
			f( 'moy', nMoy )
			f( 'max', nMax )
			f( 'tot', nTot )
			f( 'som', nSum )
			if( this.moyTot ) a.push( 'moy: '+ nMoy+"/"+ nTot)
			return a.join(', ')
			},
		only :function( o ){
			return this.times(
				aStats.getTime( o.now ),
				aStats.getTime( o.min ),
				aStats.getTime( o.moy ),
				aStats.getTime( o.max ),
				o.tot,
				aStats.getTime( o.som )
				)
			}
		}
	return aStats
	})()