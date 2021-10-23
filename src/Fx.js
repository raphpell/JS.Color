/*  REQUIS Les classes Color et Style.... each isset */
if( ! Color ) throw Error( "Fx :: Class Color required." )
if( ! Style ) throw Error( "Fx :: Class Style required." )

Fx =function( e, o2, mEffect, nTime, oSettings ){
	let o = this
	Object.assign( o, Fx.oDefaultSettings, oSettings )
	if( o.bPlayNow ) Fx.stop( e )
	if( mEffect.constructor==Array ){
		nTime = mEffect[1]
		mEffect = mEffect[0]
		}
	o.time = parseInt(nTime) || Fx.time
	Object.assign( o, {
		e:e,
		o2:o2,
		fFx:Fx.getEffect( mEffect ),
		oFrames:{},
		nFrameTime: parseInt( 1000/o.fps ),
		nFrames: o.countFrames(),
		o1: Fx.Last[ ( o.method=='merge' ? 'get_o1' : 'get_o2' )]( e ),
		oChange: {}
		})
//	o.time = (o.nFrames-1)*o.nFrameTime // important ? sûrement
	if( o2 ){
		Fx._createFrames( o )
		Fx.Methods[ o.method ]( o, o.bPreserveMergin )
		if( o.bPlayNow ) Fx.play( e )
		}
	}

Object.assign( Fx.prototype, {
	aAttr: null,
	nId: null,
	countFrames (){ return parseInt( this.fps*this.time/1000 )+1 },
	playFrame ( nId, b ){
		var o = this
		, e = o.e
		, values=''
		if( o.bCanceling ) return o.bCanceling = undefined
		if( ! b && ! e.sPlaying ){
			e.oFxPaused = o
			return false
			}
		if( o.nId == null ){
			o.nId = e.bDesc ? o.nFrames-1 : -1
			if( o.onlaunch ) o.onlaunch()
			}
		nId = nId === undefined ? ( e.bDesc ? --o.nId : ++o.nId ) : nId

		if( e.bDesc ? nId>=0 : nId<=o.nFrames ){
			o.aAttr.forEach( sAttr =>{
				if( ['cols','rows'].includes( sAttr )){
					e[sAttr] = o.oFrames[sAttr][nId] || e[sAttr] 
					values += ';' // ?
					}
				else if( sAttr.indexOf('scroll')==0 ){
					e[sAttr] = parseInt( o.oFrames[sAttr][nId]) || e[sAttr]
					values += ';' // ?
					}
				else values += Style.validate( sAttr, o.oFrames[sAttr][nId])
				})
			}
		o.onframe( nId, b )
		if( values ){
			if( Style ) Style.set( e, values )
			if( ! b ) Fx.Interval.push( o.fps, ()=>o.playFrame() )
		}else{
			o.nId = null
			if( ! o.oncomplete()) return false
			if( b ) return o.next ? o.next.playFrame( nId-o.nFrames, true ) : null
			var oNext = e.bDesc ? o.previous : o.next
			if( oNext ) Fx.Interval.push( oNext.fps, ()=>oNext.playFrame() )
				else{
					if( nId >= o.nFrames && o.onend ) return o.onend()
					if( nId < 0 && o.onstart ) return o.onstart()
					Fx.stop( e )
					}
			}
		return true
		},

	back ( s, n ){
		var o2 = {}
		each( this.oFrames, function(a,s){o2[s]=a[0]}, [Array])
		return new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'concat' })
		},
	concat ( o2, s, n ){
		return new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'concat' })
		},
	custom ( oFrames, nFps, oSettings ){
		return Fx.custom( this.e, oFrames, nFps||this.fps, oSettings )
		},
	merge ( o2, s, n, bPreserve ){
		new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'merge', bPreserveMergin:bPreserve })
		return this
		},
	push ( o2, s, n, oSettings ){
		new Fx ( this.e, o2, s||this.fFx, n||this.time, Object.assign( { bPlayNow: false, method:'push' }, oSettings ))
		return this
		},
	blink ( n ){
		var o = this, b = n === undefined
		o.onend = ()=> Fx[ b || (n-=0.5)>0 ? 'playInvert' : 'stop' ]( o.e )
		o.onstart = ()=> Fx[ b || (n-=0.5)>0 ? 'play' : 'stop' ]( o.e )
		},
	repeat ( n ){
		var o = this, b = ! isset( n )
		o.onend = ()=> Fx[ b || --n > 0 ? 'play' : 'stop' ]( o.e )
		o.onstart = ()=> Fx[ b || --n > 0 ? 'playInvert' : 'stop' ]( o.e )
		},
	reverse (){
		this.blink(1)
		}
	})
Object.assign( Fx, {
	effect: 'bounce.out',
	oDefaultSettings:{
		bPlayNow: true,
		bPreserveMergin: true,
		fps: 50,
		method: 'concat',
		sColorMode: 'rgb',
		oncomplete:()=> true ,
		onframe: nId => false ,
		onlaunch: ()=>{}
		},
	time: 500,
	custom ( e, oFrames, fps, oSettings ){
		var oFx = new Fx ( e, 0, 0, 0, { bPlayNow: false })
		, aAttr = new Set
		, nFrames = 0
		, o1={}, o2={}
		Object.keys(oFrames).forEach( s =>{
			let a = oFrames[s]
			aAttr.add( s )
			var n = a.length
			o1[ s ] = a[0]
			o2[ s ] = a[n-1]
			if( n > nFrames ) nFrames = n
			})
		Object.assign( oFx, {
			aAttr: aAttr,
			time: parseInt( fps*nFrames ),
			fps: fps||oFx.fps,
			nFrames: nFrames,
			oFrames: oFrames,
			o1: o1,
			o2: o2
			})
		Fx.Methods.concat( oFx )
		return oFx
		},
	getEffect ( m ){
		if(!m)m=Fx.effect
		if(m.constructor==String)for(var a=m.split('.'),m=Fx.Effects;m&&a.length;m=m[a.shift()]);
		if(m&&m.constructor==Function&&m.length==4&&m(0,0,1,1)==0&&m(1,0,1,1)==1)return m
		return Fx.Effects.linear
		},
	pause ( e ){
		if( e.sPausing ){
			Fx[ e.sPausing ]( e )
			return e.sPausing = undefined
			}
		if( e.sPlaying ){
			e.sPausing = e.sPlaying
			e.sPlaying = undefined
			}
		},
	playing: e => e.sPausing || e.sPlaying,
	play ( e ){
		var oFx = e.oFxPaused||e.oFx
		if( oFx ){
			e.bDesc = 0
			e.sPlaying = 'play'
			e.oFxPaused = undefined
			return oFx.playFrame()
			}
		return null
		},
	playInvert ( e ){
		var oFx = e.oFxPaused
		if( ! oFx ) oFx = Fx.Last( e )
		if( oFx ){
			e.bDesc = 1
			e.sPlaying = 'playInvert'
			e.oFxPaused = undefined
			return oFx.playFrame()
			}
		return null
		},
	stop ( e ){
		if( e.oFx ){
			for( var o = e.oFx ; o ; o = o.next ){
				o.bCanceling = 1
				}
			e.bDesc = e.sPlaying = e.oFx = e.oFxPaused = e.sPausing = undefined
			if( e.onstop ) e.onstop()
			}
		},
	_createFrames: (function (){
		let o, i, ni, oChange
		, oFun = {
			Frameset:s=>{
				let a = []
				for(let k=0, nk=oChange.length; k<nk; k++ ){
					if( o.o1[s][k].indexOf('*')>-1 ){
						a[k]=o.o1[s][k]
						continue
						}
					a[k] = parseInt( o.fFx( i*o.nFrameTime, parseInt(o.o1[s][k]), oChange[k], o.time ) || 0 )
					if( o.o1[s][k].indexOf('%')>-1 ) a[k]+= '%'
					}
				o.oFrames[s].push( a.join(','))
				},
			Color:(function(){
				let f = ( s, s1 )=> parseInt( o.fFx( i*o.nFrameTime, o.o1[s][s1], oChange[s1], o.time ) || 0 )
				return s=>{
					let aColor =[]
					for(let k=0, nk=o.sColorMode.length, s1; k<nk; k++ )
						aColor.push( f(s,o.sColorMode.charAt(k)))
					o.oFrames[s].push( Color[ o.sColorMode.substr(0,3)].apply( null, aColor ).toHEX().toString('#'))
					}
				})(),
			default:s=>{
				o.oFrames[s].push( o.fFx( i*o.nFrameTime, o.o1[s], oChange, o.time ) || 0 )
				}
			}
		return function( oFx ){
			o = oFx
			Fx._difference( o )
			ni = o.nFrames
			o.aAttr.forEach( s=>{
				o.oFrames[s]=[]
				i=0
				if(oChange=o.oChange[s])
					for(let f=oFun[oChange.sType ]||oFun.default;i<ni;i++)
						f(s)
				})
			}
		})(),
	_difference ( o ){
		let o1=o.o1, o2=o.o2, sMode = o.sColorMode.substr(0,3).toUpperCase()
		, fDifference =function( m2, s ){
			var fCase =function(){
				if( s.indexOf(' ')==0 ) return 'composed'
				if( s.indexOf('scroll')==0 ) return 'Scroll'
				if( s.indexOf('rows')==0 || s.indexOf('cols')==0 ) return 'Frameset'
				return ( /color/i.test(s)? 'Color': 'style' )
				}
			, m1, sType=fCase()
			, isset = m => m !== undefined
			switch( sType ){
				case 'composed': /* box-shadow ? color+position+dim */
					break;
				case 'Color':
					var oChange=o.oChange[s]={}
					if(!isset(o1[s])) o1[s]=Style.get(o.e,s)
					o1[s]=Color( o1[s])['to'+ sMode ]()
					o2[s]=Color( o2[s])['to'+ sMode ]()
					for(var i=0; i<3; i++ ){
						var s1=o.sColorMode[i]
						oChange[s1]=o2[s][s1]-o1[s][s1]
						}
					break;
				case 'Frameset':
					if(!isset(o1[s])) o1[s]=o.e[s]
					var a=[], a1=o1[s].split(','), a2=m2.split(',')
					for( var i=0, ni=a1.length, n1 ; i<ni; i++ ){
						if( a1[i].indexOf('*')>-1){
							a[i]=a1[i]
							continue
							}
						a[i] = parseInt(a2[i])-parseInt(a1[i])
						}
					o1[s] = a1
					o.oChange[s]= a
					break;
				case 'Scroll':
					if(!isset(o1[s])) o1[s]=o.e[s]
					o.oChange[s]=m2-o1[s]
					break;
				case 'style':
					if(!isset(o1[s])) m1=Style.get(o.e,s)
				default:
					if(isset(m1)) o1[s]=eval( isNaN(m1)? parseInt(m1): m1 ) || 0
					o.oChange[s]=m2-(o1[s]||0)
				}
			o.oChange[s].sType = sType
			}
		;( o.aAttr = o.aAttr || new Set( Object.keys(o2)) ).forEach( s => fDifference( o2[s], s ))
		},
	Last:(function(){
		var f = function( e ){
			for( var o = e.oFx ; o && o.next ; o = o.next );
			return o
			}
		f.get_o1 =function( e ){
			var o = e.oFx, o1 = {}
			if( o ) for(; o && o.next ; o = o.next ) Object.assign( o1, o.o2 )
			return o1
			}
		f.get_o2 =function( e ){
			var o = e.oFx, o1 = {}
			if( o ) for(; o ; o = o.next ) Object.assign( o1, o.o2 )
			return o1
			}
		return f
		})(),
	Methods:{
		concat ( oFx ){
			let e = oFx.e, o = Fx.Last( e )
			for(let o = e.oFx ; o && o.next ; o = o.next )
				if( o == oFx ) throw Error ( "FX.concat: Instance already in element FX - cycling error possible." )
			if( o && o!=oFx ){
				o.next = oFx
				oFx.previous = o
				} else e.oFx = oFx
			return e.oFx
			},
		merge ( oFx, bPreserve ){
			let e = oFx.e, o = Fx.Last( e )
			if( o ){
				o.aAttr = o.aAttr || new Set
				oFx.aAttr.forEach( s =>{
					o.aAttr.add( s )
					if( bPreserve ? ! o.oFrames[s] : true )
						o.oFrames[s] = oFx.oFrames[s]
					})
				o.nFrames = o.nFrames > oFx.nFrames ? o.nFrames : oFx.nFrames
				if( bPreserve ){
					o.o1 = Object.assign( {}, oFx.o1, o.o1 )
					o.o2 = Object.assign( {}, oFx.o2, o.o2 )
					}
				else{
					o.o1 = Object.assign( {}, o.o1, oFx.o1 )
					o.o2 = Object.assign( {}, o.o2, oFx.o2 )
					}
				} else e.oFx = oFx
			return e.oFx
			},
		push ( oFx ){
			let e = oFx.e, o = Fx.Last( e )
			if( o ){
				let nMax = o.nFrames, nLength
				o.aAttr = o.aAttr || new Set
				oFx.aAttr.forEach( s =>{
					o.aAttr.add( s )
					o.oFrames[s] = [ ...(o.oFrames[s]||[]), ...oFx.oFrames[s]]
					nLength = o.oFrames[s].length
					if( nLength > nMax ) nMax = nLength
					})
				o.nFrames = nMax
				o.o1 = Object.assign( {}, oFx.o1, o.o1 )
				o.o2 = Object.assign( {}, o.o2, oFx.o2 )
				} else e.oFx = oFx
			return e.oFx
			}
		},
	Effects :{
		linear :(t,b,c,d)=> c*t/d+b,
		quad:{
			'in':(t,b,c,d)=> c*(t/=d)*Math.pow(t,1)+b,
			'out':(t,b,c,d)=> -c*(t/=d)*(t-2)+b,
			'inOut':(t,b,c,d)=> (t/=d/2)<1 ? c/2*Math.pow(t,2)+b : -c/2*((--t)*(t-2)-1)+b
			},
		quint:{
			'in':(t,b,c,d)=> c*(t/=d)*Math.pow(t,4)+b,
			'out':(t,b,c,d)=> c*((t=t/d-1)*Math.pow(t,4)+1)+b,
			'inOut':(t,b,c,d)=> (t/=d/2)<1 ? c/2*Math.pow(t,5)+b : c/2*((t-=2)*Math.pow(t,4)+2)+b
			},
		sine:{
			'in':(t,b,c,d)=> c*(1-Math.cos(t/d*(Math.PI/2)).toFixed(4))+b,
			'out':(t,b,c,d)=> c*Math.sin(t/d*(Math.PI/2))+b,
			'inOut':(t,b,c,d)=> -c/2*(Math.cos(Math.PI*t/d)-1)+b
			},
		expo:{
			'in':(t,b,c,d)=> t==0 ? b : c*Math.pow(2,10*(t/d-1))+b,
			'out':(t,b,c,d)=> t==d ? b+c : c*(-Math.pow(2,-10*t/d)+1)+b,
			'inOut':(t,b,c,d)=> t==0 ? b : ( t==d ? b+c : ( (t/=d/2)<1 ? c/2*Math.pow(2,10*(t-1))+b : c/2*(-Math.pow(2,-10*--t)+2)+b ))
			},
		circ:{
			'in':(t,b,c,d)=> -c*(Math.sqrt(1-(t/=d)*t)-1)+b,
			'out':(t,b,c,d)=> c*Math.sqrt(1-(t=t/d-1)*t)+b,
			'inOut':(t,b,c,d)=> (t/=d/2)<1 ? -c/2*(Math.sqrt(1-t*t)-1)+b : c/2*(Math.sqrt(1-(t-=2)*t)+1)+b
			},
		elastic:{
			'in':(t,b,c,d)=>{
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(56*tc*ts + -105*ts*ts + 60*tc + -10*ts)
				},
			'out':(t,b,c,d)=>{
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(56*tc*ts + -175*ts*ts + 200*tc + -100*ts + 20*t)
				},
			'inOut':(t,b,c,d)=>{
				var a,p,s
				if(t==0)return b
				if((t/=d/2)==2)return b+c
				a=c*0.1
				p=d*(.3*1.5)
				if(a<Math.abs(c)){a=c;s=p/4;}else var s=p/(2*Math.PI)*Math.asin(c/a)
				if(t<1)return -1.1*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b
				return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p )*1.1+c+b
				}
			},
		back:{
			'in':(t,b,c,d)=>{
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(4*tc + -3*ts)
				},
			'out':(t,b,c,d)=>{
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(4*tc + -9*ts + 6*t)
				},
			'inOut':(t,b,c,d)=>{
				var s=1.70
				if((t/=d/2)<1)return c/2*(t*t*(((s*=(1.53))+1)*t-s))+b
				return c/2*((t-=2)*t*(((s*=(1.53))+1)*t+s)+2)+b
				}
			},
		bounce:{
			'in':(t,b,c,d)=> c-Fx.Effects.bounce['out'](d-t,0,c,d)+b,
			'out':(t,b,c,d)=>{
				if((t/=d)<(1/2.75))return c*(7.5625*t*t)+b
				else if(t<(2/2.75))return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b
				else if(t<(2.5/2.75))return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b
				else return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b
				},
			'inOut':(t,b,c,d)=>{
				if(t<d/2)return Fx.Effects.bounce['in'](t*2,0,c,d)*.5+b
				return Fx.Effects.bounce['out'](t*2-d,0,c,d)*.5+c*.5+b
				}
			}
		},
	Interval :(function(){
		let _oFPS={}
		, _create = nFps =>{
			let o=_oFPS[nFps]
			, f =()=>{
				let o=_oFPS[nFps], a=o.a.splice(0,o.a.length)
				while(a.length) a.shift()()
				if(o.a.length==0)_remove(nFps)
				}
			return _oFPS[nFps] = o ? o : {
				a:[],
				n: setInterval( f, parseInt(1000/nFps))
				}
			}
		, _remove = nFps =>{
				let o=_oFPS[nFps]
				if(!o)return false
				clearInterval(o.n)
				delete _oFPS[nFps]
				return true
				}
		return {
			oFPS: _oFPS,
			create: _create,
			push :( nFps, f )=> _create(nFps).a.push(f),
			remove: _remove
			}})()
	})