const { getCorsOrigins } = require('../src/utils/corsOrigins');

const scenarios = [
  { FRONTEND_URL: 'https://example.com' },
  { FRONTEND_URL_FALLBACK: 'https://fallback.dev' },
  { FRONTEND_URL_ALLOW_ALL: 'true' },
  { FRONTEND_URL_DEV_ORIGINS: 'http://dev1.local,http://dev2.local' },
];

for (const env of scenarios) {
  const config = getCorsOrigins(env.FRONTEND_URL, env.FRONTEND_URL_FALLBACK, env.FRONTEND_URL_ALLOW_ALL === 'true', env.FRONTEND_URL_DEV_ORIGINS);
  console.log(env, '=>', config);
}
