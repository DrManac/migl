import { GlContext } from './glcontext.js'

class ViewArea {
	constructor(root) {
		var viewarea = this;
		var canvas3d = document.createElement('canvas');

		canvas3d.style.position = 'absolute';
		canvas3d.style.left = '0px';
		canvas3d.style.right = '0px';
		canvas3d.style.top = '0px';
		canvas3d.style.bottom = '0px';

		window.addEventListener('resize', onWindowResize, false);

		this.container = root;

		this.canvas = canvas3d;

		this.glctx = new GlContext(canvas3d);

		this.Clear();
		onWindowResize();

		function onWindowResize() {
			var width = viewarea.container.clientWidth;
			var height = viewarea.container.clientHeight;
			canvas3d.width = width;
			canvas3d.height = height;
		}
	}
	Clear() {
		while (this.container.firstChild) {
			this.container.removeChild(this.container.firstChild);
		}
		this.container.appendChild(this.canvas);
	}
	SetLayout(layout) {
		this.Clear();
        generateGrid(this.container, layout);
	}
}

function generateGrid(root, layout, isRow)
{
   	if(isRow == undefined)
   		isRow = true;
   	if(Array.isArray(layout))
   	{
   		for(var i = 0; i < layout.length; i++)
   		{
   			var container = document.createElement('div');
   			if(isRow)
   				container.className = 'ccol';
   			else
   			    container.className = 'crow';
   			root.appendChild(container);
   			generateGrid(container, layout[i], !isRow);
   		}
   		return;
   	}
   	root.style['flex-grow'] = layout.size || 1;
	root.className += " cell";
}


export { ViewArea };
