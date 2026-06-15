const { getCorsOrigins } = require('../src/utils/corsOrigins');

const config = getCorsOrigins();
console.log('Active CORS origins:', config);
