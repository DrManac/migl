export var DragNDrop = {
	enable: function(dropzone, processFilesCallback) {
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

			processFilesCallback(files);
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
