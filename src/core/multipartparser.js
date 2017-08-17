export default function parse(body, contentType) {
    // Examples for content types:
    //      multipart/form-data; boundary="----7dd322351017c"; ...
    //      multipart/form-data; boundary=----7dd322351017c; ...
    var m = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

    if(!m) throw new Error('Bad content-type header, no multipart boundary');

    var boundary = m[1] || m[2];

    function rawStringToBuffer(str) {
        var idx, len = str.length, arr = new Array(len);
        for (idx = 0; idx < len; ++idx) {
            arr[ idx ] = str.charCodeAt(idx) & 0xFF;
        }
        return new Uint8Array(arr).buffer;
    }

    // \r\n is part of the boundary.
    var boundary = '\r\n--' + boundary;

    var isRaw = typeof(body) !== 'string';

	var s;
    if (isRaw) {
        var view = new Uint8Array(body);
        s = String.fromCharCode.apply(null, view);
    } else {
        s = body;
    }

    // Prepend what has been stripped by the body parsing mechanism.
    s = '\r\n' + s;

    var parts = s.split(new RegExp(boundary)),
        partsList = [];

    // First part is a preamble, last part is closing '--'
    for (var i = 1; i < parts.length - 1; i++) {
      var subparts = parts[i].split('\r\n\r\n');
      var headers = subparts[0].split('\r\n');
      partsList.push(isRaw ? rawStringToBuffer(subparts[1]) : subparts[1]);
    }

    return partsList;
}
