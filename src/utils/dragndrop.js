export var DragNDrop = {
	enable: function(dropzone, processBuffersCallback) {
		dropzone.addEventListener('dragover', handleDragOver, false);
		dropzone.addEventListener('drop', handleFileSelect, false);

		function handleDragOver(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer.dropEffect = 'copy';
		}
		function handleFileSelect(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			var files;
			if(evt.dataTransfer === undefined)
				files = evt.target.files;
			else
				files = evt.dataTransfer.files;

			if(!files || files.length == 0) return;

			var promises = [];
			for(var i = 0; i < files.length; i++)
				promises.push(new Promise(
					function(resolve, reject){
						readFile(files[i], resolve);
					}));

			Promise.all(promises).then(processBuffersCallback);
		}
		function readFile(file, resolve) {
			var reader = new FileReader();
			reader.onload = function(evt) {
				var arrayBuffer = reader.result;
				resolve(arrayBuffer);
			}
			reader.readAsArrayBuffer(file);
		}
	}
};
