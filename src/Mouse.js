Mouse =(function(){
	// 'mousedown','mouseup','mousemove','wheel'
	const getEvent=e=>e?e:(window.event?window.event:null)
	, a=['Left','Middle','Right','Back','Forward']
	, o={1:a[0],2:a[2],4:a[1],8:a[3],16:a[4]}
	, _ ='mouse'
	return {
		button:function(e){
			return _+a[getEvent(e).button]
			},
		buttons:function(e){
			let n=getEvent(e).buttons||0
			,a=[]
			,f=(nId)=>{if(n>=nId){a.push(_+o[nId]);n-=nId}}
			f(16);f(8);f(4);f(2);f(1)
			return a.join('+')
			},
		keys:function(e){
			e=getEvent(e)
			let a=[]
			,f=s=>{if(e[s])a.push(s.substring(0,s.length-3).toUpperCase())}
			f('ctrlKey');f('altKey');f('shiftKey');f('metaKey')
			return a.join('+')
			},
		shortcut:function(e){
			e=getEvent(e)
			let a=[]
			,f=s=>{if(s)a.push(s)}
			f( Mouse.keys(e));f( Mouse.buttons(e));f( Mouse.wheel(e))
			return a.join('+')
			},
		position:function(e){
			e=getEvent(e)
			return{ 
				left:e.pageX||e.clientX||0,
				top:e.pageY||e.clientY||0
				}
			},
		wheel:function(e){
			e=getEvent(e)
			return e.deltaY===undefined?'':_+(e.deltaY>0?'Down':'Up')
			}
		}
	})()