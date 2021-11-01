Mouse =(function(){
	const EventsSet=new Set(['mousedown','mouseup','mousemove','wheel'])
	, getEvent=evt=>evt?evt:(window.event?window.event:null)
	, a=['left','middle','right','back','forward']
	, o={1:a[0],2:a[2],4:a[1],8:a[3],16:a[4]}
	return {
		button:function(evt){
			return a[getEvent(evt).button]
			},
		buttons:function(evt){
			let n=getEvent(evt).buttons||0
			,a=[]
			,f=(nId)=>{if(n>=nId){a.push(o[nId]);n-=nId}}
			f(16);f(8);f(4);f(2);f(1)
			return a.join('+')
			},
		position:function(evt){
			evt=getEvent(evt)
			return{ 
				left:evt.pageX||evt.clientX||0,
				top:evt.pageY||evt.clientY||0
				}
			},
		wheel:function(evt){
			return getEvent(evt).deltaY>0?'down':'up'
			}
		}
	})()