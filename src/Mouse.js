Mouse =(function(){
	const ButtonSet = new Set (['mousedown','mouseup'])
	, WheelSet = new Set (['mousewheel','DOMMouseScroll'])
	, getEvent = evt=>evt?evt:(window.event?window.event:null)
	return {
		button :function( evt ){
			evt = getEvent( evt )
			if( ButtonSet.has( evt.type )){
				var n = evt.which
				if( n ) switch( n ){
					case 1 : return 'left'
				//	case 2 : return "middle"
					case 3 : return 'right'
					default: return n
					}
				n = evt.button
				if( n ) switch( n ){
					case 1 : return 'left'
					case 2 : return 'right'
				//	case 4 : return "middle"
					default: return n
					}
				}
			return ''
			},
		position :function( evt ){
			evt = getEvent( evt )
			var o = { 
				left: evt.pageX ? evt.pageX : evt.clientX || 0 , 
				top: evt.pageY ? evt.pageY : evt.clientY || 0
				}
			return o
			},
		wheel :function(evt){
			evt = getEvent( evt )
			if( WheelSet.has( evt.type )){
				var n = evt.wheelDelta ? evt.wheelDelta / 120 : -( evt.detail || 0 ) / 3
				return n < 0 ? 'down' : 'up'
				}
			return ''
			}
		}
	})()