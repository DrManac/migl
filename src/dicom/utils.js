import {__moduleExports as dicomParser} from 'dicom-parser';

function parseDateTime(dataSet, dtag, ttag) {
    var date = dicomParser.parseDA(dataSet.string(dtag) || '');
    var time = dicomParser.parseTM(dataSet.string(ttag) || '');
    if(date) {
        if(time)
            return new Date(date.year, date.month, date.day, time.hours, time.minutes);
        else
            return new Date(date.year, date.month, date.day);
    }
    return undefined;
}

export {parseDateTime};
