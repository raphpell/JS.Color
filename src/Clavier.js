Clavier =(function(){
	const special=new Set([16,17,18,91])
	,o={
		8:'BACKSPACE',9:'TAB',
		13:'ENTER',
		16:'SHIFT',17:'CTRL',18:'ALT',19:'PAUSE',20:'CAPS_LOCK',
		27:'ESCAPE',
		32:'SPACE',33:'PAGE_UP',34:'PAGE_DOWN',35:'END',36:'HOME',37:'LEFT',38:'UP',39:'RIGHT',40:'DOWN',
		44:'PRINT_SCREEN',45:'INSERT',46:'DELETE',
		91:'META',
		96:'0',97:'1',98:'2',99:'3',100:'4',101:'5',102:'6',103:'7',104:'8',105:'9',
		106:'STAR',107:'PLUS',
		109:'MINUS',110:'DOT',111:'DIVIDE',
		112:'F1',113:'F2',114:'F3',115:'F4',116:'F5',117:'F6',118:'F7',119:'F8',120:'F9',121:'F10',122:'F11',123:'F12',
		144:'NUM_LOCK',145:'SCROLL_LOCK'
		}
	return {
		id:o,
		code:e=>{
			if(e){
				var n = e.charCode||e.keyCode||0
				Object.assign(Clavier,{
					alt:Clavier.Alt(e),
					ctrl:Clavier.Ctrl(e),
					meta:Clavier.Meta(e),
					shift:Clavier.Shift(e),
					charcode:n,
					key:o[n]||String.fromCharCode(n)
					})
				return n
				}
			return null
			},
		shortcut:e=>{
			var n=Clavier.code(e),a=[]
			, f=s=>{ if(Clavier[s]) a.push(s.toUpperCase())}
			f('ctrl');f('alt');f('shift');f('meta')
			if(!special.has(n)) a.push(Clavier.key)
			return a.join('+')
			},
		Alt:e=>e.modifiers?(e.modifiers%2):e.altKey,
		Ctrl:e=>e.modifiers?((e.modifiers==2)||(e.modifiers==3)||(e.modifiers>5)):e.ctrlKey,
		Meta:e=>e.metaKey,
		Shift:e=>e.modifiers?(e.modifiers>3):e.shiftKey
		}
	})()