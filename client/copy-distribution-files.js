const fs = require('fs');
fs.copyFile('_redirects', './dist/_redirects', () => {});