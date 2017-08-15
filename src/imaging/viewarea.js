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

		root.style.overflow = 'hidden';

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
        var els = generateGrid(this.container, layout);
		attachElements(this, els);
	}
}

function generateGrid(root, layout, isRow)
{
	var res = [];
   	if(isRow == undefined)
   		isRow = true;
   	if(Array.isArray(layout))
   	{
   		for(var i = 0; i < layout.length; i++)
   		{
   			var container = document.createElement('div');
   			container.style.position = 'relative';
   			container.style.overflow = 'hidden';
   			container.style.display = 'flex';
   			container.style.flex = '1 1 auto';
   			if(isRow)
   				container.style['flex-direction'] = 'column';
   			else
   				container.style['flex-direction'] = 'row';
   			root.appendChild(container);
   			var tmp = generateGrid(container, layout[i], !isRow);
			res.push(...tmp);
   		}
   		return res;
   	}
   	root.style['flex-grow'] = layout.size || 1;
	//root.className += " cell";
	res.push({container: root, view: layout.element});
	return res;
}

function attachElements(area, elements) {
	for(var i = 0; i < elements.length; i++)
	{
		var root = elements[i].container;
		var el = elements[i].view;
		if(el && el.Attach)
			el.Attach(area, root);
	}
}

export { ViewArea };
