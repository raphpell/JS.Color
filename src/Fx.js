/*  REQUIS Les classes Color et Style... */
if(!Color) throw Error("Fx :: Class Color required.")
if(!Style) throw Error("Fx :: Class Style required.")

Fx=(function( bDev ){
	const setEltAttributes=new Set(['cols','rows','scrollLeft','scrollTop'])
	,notIsSet=m=>m===undefined
	,_Animation =(function(){
		let _oFPS=new Map
		,_purge=nFps=>{
			return ()=>{
				let o=_oFPS.get(nFps),a=o.a.splice(0)
				while(a.length)a.shift()()
				if(o.a.length==0)_remove(nFps)
				}
			}
		,_create=nFps=>{
			let o=_oFPS.get(nFps)
			return _oFPS.set(nFps,o?o:{
				a:[],
				n:setInterval(_purge(nFps),1000/nFps)
				}).get(nFps)
			}
		,_remove=nFps=>{
			let o=_oFPS.get(nFps)
			if(!o)return false
			clearInterval(o.n)
			delete _oFPS.delete(nFps)
			return true
			}
		return o=>{
				let f=()=>o.playFrame()
				return o.bAnimationFrame&&requestAnimationFrame
					?requestAnimationFrame(f)
					:_create(o.fps).a.push(f)
				}
			})()
	_createFrames=(function(){
		let o,i,ni,oDelta
		const oFun={
			Color:(function(){
				let f =(s,s1)=>{
					let n = o.fFx(i*o.nFrameTime,o.o1[s][s1],oDelta[s1],o.time)||0
					return n>1?parseInt(n):n.toFixed(2)
					}
				return s=>{
					let aColor =[]
					for(let k=0, nk=o.sColorMode.length, s1; k<nk; k++ )
						aColor.push( f(s,o.sColorMode.charAt(k)))
					let sColorMode = o.sColorMode.charAt(3)=='a'? o.sColorMode.substr(0,3) : o.sColorMode
					o.oFrames.get(s).push( o.bColorRGBA
						? Color[sColorMode].apply( null, aColor ).toRGB().toString()
						: Color[sColorMode].apply( null, aColor ).toHEX().toString('#')
						)
					}
				})(),
			Frameset:s=>{
				let a = []
				for(let k=0, nk=oDelta.length; k<nk; k++ ){
					if( o.o1[s][k].indexOf('*')>-1 ){
						a[k]=o.o1[s][k]
						continue
						}
					a[k] = parseInt(o.fFx(i*o.nFrameTime,parseInt(o.o1[s][k]),oDelta[k],o.time)||0)
					if( o.o1[s][k].indexOf('%')>-1 ) a[k]+= '%'
					}
				o.oFrames.get(s).push( a.join(','))
				},
			default:s=>{
				let n = o.fFx(i*o.nFrameTime,o.o1[s],oDelta,o.time)||0
				o.oFrames.get(s).push( n>1 ? parseInt(n) : n )
				}
			}
		return oFx=>{
			o=oFx
			_calculateDeltas(o)
			ni=o.nFrames
			o.aAttr.forEach(s=>{
				o.oFrames.set(s,[])
				i=0
				if(oDelta=o.oDeltas.get(s))
					for(let f=oFun[oDelta.sType]||oFun.default;i<ni;i++)
						f(s)
				})
			}
		})(),
	_calculateDeltas=(function(){
		let o, o1, o2, sMode, s
		, getType =function(s){
			if(s.indexOf(' ')==0) return 'composed'
			if(s.indexOf('scroll')==0) return 'Scroll'
			if(s.indexOf('rows')==0||s.indexOf('cols')==0) return 'Frameset'
			return /color/i.test(s)?'Color':'style'
			}
		, oFun = {
			composed:()=>{/* box-shadow ? color+position+dim */},
			Color:()=>{
				let oDelta=o.oDeltas.set(s,{}).get(s)
				, f=s1=>oDelta[s1]=o2[s][s1]-o1[s][s1]
				if(notIsSet(o1[s])) o1[s]=Style.get(o.e,s)
				var sColorMode = sMode.charAt(3)=='A'?sMode.substr(0,3):sMode
				o1[s]=Color( o1[s])['to'+ sColorMode ]()
				o2[s]=Color( o2[s])['to'+ sColorMode ]()
				if( o.bColorRGBA ){
					if( o1[s].a===null) o1[s].a = 1
					if( o2[s].a===null) o2[s].a = 1
					}
				for(let i=0,ni=o.sColorMode.length; i<ni; i++ ) f(o.sColorMode[i])
				},
			Frameset:()=>{
				if(notIsSet(o1[s])) o1[s]=o.e[s]
				let a=[], a1=o1[s].split(','), a2=o2[s].split(',')
				for(let i=0, ni=a1.length, n1 ; i<ni; i++ ){
					if( a1[i].indexOf('*')>-1){
						a[i]=a1[i]
						continue
						}
					a[i] = parseInt(a2[i])-parseInt(a1[i])
					}
				o1[s] = a1
				o.oDeltas.set(s,a)
				},
			Scroll:()=>{
				if(notIsSet(o1[s])) o1[s]=o.e[s]
				o.oDeltas.set(s,o2[s]-o1[s])
				},
			style:()=>{
				let m1
				if(notIsSet(o1[s])) m1=Style.get(o.e,s)
				if(m1) o1[s]=eval( isNaN(m1)? parseInt(m1): m1 ) || 0
				o.oDeltas.set(s,o2[s]-(o1[s]||0))
				}
			}
		return oFx =>{
			o=oFx
			o1=o.o1
			o2=o.o2
			sMode = o.sColorMode.toUpperCase()
			;( o.aAttr = o.aAttr || new Set( Object.keys(o2)) ).forEach( sAttr=>{
				let sType=getType( s=sAttr )
				oFun[sType]()
				o.oDeltas.get(s).sType = sType
				})
			}
		})()

	,Fx=function(e,o2,mEffect=Fx.effect,nTime=200,oSettings={}){
		let o=this
		Object.assign(o,Fx.oDefaultSettings,oSettings)
		if(o.bPlayNow)Fx.stop(e)
		if(mEffect.constructor==Array){
			nTime=mEffect[1]
			mEffect=mEffect[0]
			}
		o.time=parseInt(nTime)
		Object.assign(o,{
			e:e,
			o2:o2,
			fFx:Fx.getEffect(mEffect),
			oFrames:new Map,
			nFrameTime:parseInt(1000/o.fps),
			nFrames:o.countFrames(),
			o1:Fx.Last[(o.method=='merge'?'get_o1':'get_o2')](e),
			oDeltas:new Map
			})
		o.time = (o.nFrames-1)*o.nFrameTime //!important
		if(o2){
			_createFrames(o)
			Fx.Methods[o.method](o,o.bPreserveMergin)
			if(o.bPlayNow)Fx.play(e)
			}
		}
	Object.assign(Fx.prototype,{
		aAttr:null,
		nId:null,
		countFrames(){return parseInt(this.fps*this.time/1000)+1},
		playFrame:function(nId,b){
			let o=this
			, e=o.e
			, values=''
			// animation stoppée
			if(o.bCanceling) return o.bCanceling=undefined
			// animation pausée
			if(!e.sPlaying&&!b){
				e.oFxPaused=o
				return false
				}
			// animation jouée en arrière
			let bDesc=e.sPlaying=='playInvert'
			// première image jouée de l'animation
			if(o.nId===null){
				o.nId=bDesc?o.nFrames-1:-1
				if(o.onlaunch)o.onlaunch()
				}
			// récupération id image : animation ou image seule
			nId=nId===undefined?(bDesc?--o.nId:++o.nId):nId
			// récupération des valeurs des attributs modifiés
			if(bDesc?nId>=0:nId<=o.nFrames){
				o.aAttr.forEach( sAttr=>{
					let aFrame=o.oFrames.get(sAttr)
					if(Fx.setEltAttributes.has(sAttr)){
						e[sAttr]=aFrame[nId]
						values+=';'// nécessaire if(values)
						}
					else values+=Style.validate(sAttr,aFrame[nId])
					})
				}
			o.onframe(nId,b)
			if(values){
				// met à jour les valeurs de l'élément animé
				if(Style)Style.set(e,values)
				if(!b)_Animation(o)
			}else{
				// Dernière animation ou animation suivante
				o.nId=null
				if(!o.oncomplete())return false
				// cas image seule affiché
				if(b)return o.next?o.next.playFrame(nId-o.nFrames,true):null
				// cas animation suivante
				let oNext=bDesc?o.previous:o.next
				if(oNext)_Animation(oNext)
					else{
						// Cas dernière animation
						// Evénements internes : voir blink entre autre.
						if(o.onend&&nId>=o.nFrames)return o.onend()
						if(o.onstart&&nId<0)return o.onstart()
						Fx.stop(e)
						}
				}
			return true
			},

		back(s,n){
			let o2={},o1=this.o1
			this.aAttr.forEach(s=>{o2[s]=o1[s]})
			return new Fx(this.e,o2,s||this.fFx,n||this.time,{bPlayNow:false,method:'concat',sColorMode:this.sColorMode})
			},
		blink(n){
			let o=this,b=notIsSet(n)
			o.onend=()=>Fx[b||(n-=0.5)>0?'playInvert':'stop'](o.e)
			o.onstart=()=>Fx[b||(n-=0.5)>0?'play':'stop'](o.e)
			},
		concat(o2,s,n){
			return new Fx(this.e,o2,s||this.fFx,n||this.time,{bPlayNow:false,method:'concat'})
			},
		custom(oFrames,oSettings){
			return Fx.custom(this.e,oFrames,oSettings )
			},
		merge(o2,s,n,bPreserve=false){
			new Fx(this.e,o2,s||this.fFx,n||this.time,{bPlayNow:false,method:'merge',bPreserveMergin:bPreserve})
			return this
			},
		push(o2,s,n,oSettings){
			new Fx(this.e,o2,s||this.fFx,n||this.time,Object.assign({bPlayNow:false,method:'push'},oSettings))
			return this
			},
		repeat(n){
			let o=this,b=notIsSet(n)
			o.onend=()=>Fx[b||--n>0?'play':'stop'](o.e)
			o.onstart=()=>Fx[b||--n>0?'playInvert':'stop'](o.e)
			},
		reverse(){ this.blink(1)}
		})
	Object.assign(Fx,{
		setEltAttributes:setEltAttributes,
		effect:'bounce.out',
		oDefaultSettings:{
			bColorRGBA:true,
			bPlayNow:true,
			bPreserveMergin:true,
			bAnimationFrame:true, // plus performant !
			fps:60,
			method:'concat',
			sColorMode:'rgb',
			time:500,
			oncomplete:()=>true,
			onframe:nId=>{},
			onlaunch:()=>{}
			},
		custom(e,oFrames,oSettings){
			var oFx=new Fx(e,0,0,0,{ bPlayNow:false})
			,aAttr=new Set
			,nFrames=0
			,o1={},o2={},oMap=new Map
			Object.keys(oFrames).forEach(s=>{
				let a=oFrames[s]
				aAttr.add(s)
				var n=a.length
				o1[s]=a[0]
				o2[s]=a[n-1]
				oMap.set(s,a)
				if(n>nFrames) nFrames=n
				})
			Object.assign(oFx,Fx.oDefaultSettings,oSettings,{
				aAttr:aAttr,
				time:parseInt(fps*nFrames),
				nFrames:nFrames,
				oFrames:oMap,
				o1:o1,
				o2:o2
				})
			Fx.Methods.concat(oFx)
			return oFx
			},
		getEffect(m){
			if(m.constructor==String)for(var a=m.split('.'),m=Fx.Effects;m&&a.length;m=m[a.shift()]);
			if(m&&m.constructor==Function&&m.length==4&&m(0,0,1,1)==0&&m(1,0,1,1)==1)return m
			return Fx.Effects.linear
			},
		pause(e){
			if(e.sPausing){
				Fx[e.sPlaying=e.sPausing](e)
				return e.sPausing = undefined
				}
			if(e.sPlaying){
				e.sPausing=e.sPlaying
				e.sPlaying=undefined
				}
			},
		playing:e=>(e.sPausing||e.sPlaying)?true:false,
		play(e){
			var oFx=e.oFxPaused||e.oFx
			if(oFx){
				e.sPlaying='play'
				e.oFxPaused=undefined
				return oFx.playFrame()
				}
			return null
			},
		playInvert(e){
			var oFx=e.oFxPaused||Fx.Last(e)
			if(oFx){
				e.sPlaying='playInvert'
				e.oFxPaused=undefined
				return oFx.playFrame()
				}
			return null
			},
		stop(e){
			if(e.oFx){
				for(var o=e.oFx;o;o=o.next)o.bCanceling=1
				let oFx = e.oFx
				e.oFx=e.sPlaying=e.oFxPaused=e.sPausing=undefined
				if(e.onstop) e.onstop(oFx)
				}
			},

		Last:(function(){
			let f=e=>{
				let o=e.oFx
				for(;o&&o.next;o=o.next);
				return o
				}
			f.get_o1=e=>{
				let o=e.oFx,_o={}
				if(o)for(;o&&o.next;o=o.next) Object.assign(_o,o.o2)
				return _o
				}
			f.get_o2=e=>{
				let o=e.oFx,_o={}
				if(o)for(;o;o=o.next) Object.assign(_o,o.o2)
				return _o
				}
			return f
			})(),
		Methods:{
			concat(oFx){
				let e=oFx.e, o=e.oFx
				for(;o&&o.next;o=o.next)
					if(o==oFx) throw Error ( "FX.concat: Instance already in element FX - cycling error possible." )
				o?(o.next=oFx).previous=o:e.oFx=oFx
				return e.oFx
				},
			merge(oFx,bPreserve){
				let e=oFx.e, o=Fx.Last(e)
				if(o){
					o.aAttr=o.aAttr||new Set
					oFx.aAttr.forEach(s=>{
						o.aAttr.add(s)
						if(bPreserve?!o.oFrames.get(s):true)
							o.oFrames.set(s,oFx.oFrames.get(s))
						})
					o.nFrames=o.nFrames>oFx.nFrames?o.nFrames:oFx.nFrames
					if(bPreserve){
						o.o1=Object.assign({},oFx.o1,o.o1)
						o.o2=Object.assign({},oFx.o2,o.o2)
						}
					else{
						o.o1=Object.assign({},o.o1,oFx.o1)
						o.o2=Object.assign({},o.o2,oFx.o2)
						}
					} else e.oFx=oFx
				return e.oFx
				},
			push(oFx){
				let e=oFx.e, o=Fx.Last(e)
				if(o){
					let nMax=o.nFrames, nLength
					o.aAttr=o.aAttr||new Set
					oFx.aAttr.forEach(s=>{
						o.aAttr.add(s)
						o.oFrames.set(s,[...(o.oFrames.get(s)||[]),...oFx.oFrames.get(s)])
						nLength=o.oFrames.get(s).length
						if(nLength>nMax) nMax=nLength
						})
					o.nFrames=nMax
					o.o1=Object.assign({},oFx.o1,o.o1)
					o.o2=Object.assign({},o.o2,oFx.o2)
					} else e.oFx=oFx
				return e.oFx
				}
			},
		Effects:{
			linear :(t,b,c,d)=> c*t/d+b,
			quad:{
				'in':(t,b,c,d)=>c*(t/=d)*Math.pow(t,1)+b,
				'out':(t,b,c,d)=>-c*(t/=d)*(t-2)+b,
				'inOut':(t,b,c,d)=>(t/=d/2)<1?c/2*Math.pow(t,2)+b:-c/2*((--t)*(t-2)-1)+b
				},
			quint:{
				'in':(t,b,c,d)=>c*(t/=d)*Math.pow(t,4)+b,
				'out':(t,b,c,d)=>c*((t=t/d-1)*Math.pow(t,4)+1)+b,
				'inOut':(t,b,c,d)=>(t/=d/2)<1?c/2*Math.pow(t,5)+b:c/2*((t-=2)*Math.pow(t,4)+2)+b
				},
			sine:{
				'in':(t,b,c,d)=>c*(1-Math.cos(t/d*(Math.PI/2)).toFixed(4))+b,
				'out':(t,b,c,d)=>c*Math.sin(t/d*(Math.PI/2))+b,
				'inOut':(t,b,c,d)=>-c/2*(Math.cos(Math.PI*t/d)-1)+b
				},
			expo:{
				'in':(t,b,c,d)=>t==0?b:c*Math.pow(2,10*(t/d-1))+b,
				'out':(t,b,c,d)=>t==d?b+c:c*(-Math.pow(2,-10*t/d)+1)+b,
				'inOut':(t,b,c,d)=>t==0?b:(t==d?b+c:((t/=d/2)<1?c/2*Math.pow(2,10*(t-1))+b:c/2*(-Math.pow(2,-10*--t)+2)+b ))
				},
			circ:{
				'in':(t,b,c,d)=>-c*(Math.sqrt(1-(t/=d)*t)-1)+b,
				'out':(t,b,c,d)=>c*Math.sqrt(1-(t=t/d-1)*t)+b,
				'inOut':(t,b,c,d)=>(t/=d/2)<1?-c/2*(Math.sqrt(1-t*t)-1)+b:c/2*(Math.sqrt(1-(t-=2)*t)+1)+b
				},
			elastic:{
				'in':(t,b,c,d)=>{
					var ts=(t/=d)*t,tc=ts*t
					return b+c*(56*tc*ts+-105*ts*ts+60*tc+-10*ts)
					},
				'out':(t,b,c,d)=>{
					var ts=(t/=d)*t,tc=ts*t
					return b+c*(56*tc*ts+-175*ts*ts+200*tc+-100*ts+20*t)
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
					var ts=(t/=d)*t,tc=ts*t
					return b+c*(4*tc+-3*ts)
					},
				'out':(t,b,c,d)=>{
					var ts=(t/=d)*t,tc=ts*t
					return b+c*(4*tc+-9*ts+6*t)
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
			}
		})
	if( bDev ){
		Object.assign(Fx,{
			animation:_Animation,
			createFrames:_createFrames,
			calculateDeltas:_calculateDeltas,
			})
		}
	
	return Fx
	})(1)