const electron = require('electron');
console.log('Type of electron export:', typeof electron);
console.log('Value of electron export:', electron);
console.log('process.versions:', process.versions);

if (typeof electron === 'string') {
    console.log('WARNING: electron module returned a string path. attempting to require that path? No, that is the binary.');
}
