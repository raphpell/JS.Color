FSMBridge =(function(){
	let FunctionCache = {}
	, MakeFunction =function( s, aReplacements, bReturn ){
		if( ! s ) throw Error ('MakeFunction')
		if( FunctionCache[s]) return FunctionCache[s]
		aReplacements.forEach(
			([searched, replacement]) => s = s.replace( searched, replacement )
			)
		return FunctionCache[s] = new Function ( "o", (bReturn?'return ':'')+ s )
		}
	return function( oMachine ){
		if( ! oMachine.compiled ){
			let a = eval( '['+ (oMachine.sReplacements||'') +']' )
			let f1 = ( o, s, b )=>{
				if(o[s]){
					o[s] = new String(o[s])
					o[s].fun = MakeFunction(o[s], a, b )
					}
				}
			oMachine.edges.forEach( o=>{
				f1(o,'label',true)
				f1(o,'OnTransition')
				})
			oMachine.nodes.forEach( o=>{
				f1(o,'OnEnter')
				f1(o,'OnStay')
				f1(o,'OnExit')
				})
			}
		this.transitions = {}
		oMachine.edges.forEach( o=>{
			let a = this.transitions[o.from] || (this.transitions[o.from]=[])
			a.push([ o.to, o.label.fun , o.OnTransition.fun ])
			})
		this.statesId = {}
		this.statesName = {}
		this.events ={
			OnEnter: new FSM.Events(this),
			OnStay: new FSM.Events(this),
			OnExit: new FSM.Events(this)
			}
		let f2 = ( sEvent, o )=>{
			if( o[ sEvent ]) this.events[ sEvent ].add( o.id, o[ sEvent ].fun )
			}
		oMachine.nodes.forEach( o=>{
			this.statesId[o.label] = o.id
			this.statesName[o.id] = o.label
			f2( 'OnEnter', o )
			f2( 'OnStay', o )
			f2( 'OnExit', o )
			})
		oMachine.compiled = true
		}
	})()

// Finite State Machine
class FSM {
	nLastState = null
	nCurrentState = null
	constructor( oActor, sInitialState, oMachine ){
		this.oActor = oActor
		FSMBridge.call( this, oMachine )
		this.init( sInitialState )
		}
	init( sInitialState ){
		let n = this.getStateId( sInitialState )
		if( n===undefined ) throw Error ('Invalid state name.')
		this.nLastState = null
		this.nCurrentState = n
		this.throwEvent( 'OnEnter', this.nCurrentState )
		}
	throwEvent( sEvent, nState ){
		let o = this.events[ sEvent ]
		if( o.get( nState )) o.exec( nState )
		}
	setState( nState, fOnTransition=null ){
		if( this.getStateName( nState )===undefined) throw Error ('Invalid state ID.')
		if( this.nCurrentState != nState ){
			this.onchange(
				this.nLastState = this.nCurrentState,
				this.nCurrentState = nState
				)
			this.throwEvent( 'OnExit', this.nLastState )
			if( fOnTransition ) fOnTransition.call( this.oActor )
			this.throwEvent( 'OnEnter', this.nCurrentState )
			}
		else{
			this.nLastState = nState
			if( fOnTransition ) fOnTransition.call( this.oActor )
			this.throwEvent( 'OnStay', this.nCurrentState )
			}
		}
	checkState(){
		let a = this.transitions[ this.nCurrentState ]
		if( a )
			for(let i=0; a[i]; i++ )
				if( a[i][1].call( this.oActor )){
					this.setState( a[i][0], a[i][2])
					return true
					}
		this.setState( this.nCurrentState )
		return false
		}
	onchange( nLastState, nCurrentState ){}
	getStateName( nState ){ return this.statesName[ nState ] }
	getStateId( sStateName ){ return this.statesId[ sStateName ] }

	// Finite State Machine Events
	static Events = class {
		o = null
		constructor( oFSM ){
			this.FSM = oFSM
			this.o = {}
			}
		add( nState, f ){
			this.o[nState] = this.get(nState)||[]
			this.o[nState].push( f )
			}
		get( nState ){ return this.o[nState] }
		exec( nState ){
			let a = this.get(nState)
			if( a ) a.forEach( f=>f.call( this.FSM.oActor ))
			}
		}
	}