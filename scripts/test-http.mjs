const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

const GET_ROUTES = [
  '/',
  '/jobs',
  '/jobs?q=react&ir35=outside&remote=remote',
  '/companies',
  '/candidates',
  '/pricing',
  '/blog',
  '/guides',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/outside-ir35-jobs',
  '/react-contract-jobs',
  '/api/health',
  '/robots.txt',
  '/sitemap.xml',
];

const EXPECT_GONE = ['/api/debug'];

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
  return { path, status: res.status, location: res.headers.get('location') };
}

async function main() {
  const failures = [];

  for (const path of GET_ROUTES) {
    try {
      const result = await get(path);
      const ok = result.status >= 200 && result.status < 400;
      console.log(`${ok ? 'ok' : 'FAIL'} ${result.status} ${path}${result.location ? ' -> ' + result.location : ''}`);
      if (!ok) failures.push(result);
    } catch (error) {
      console.log(`FAIL ${path} ${error.message}`);
      failures.push({ path, error: error.message });
    }
  }

  for (const path of EXPECT_GONE) {
    const result = await get(path);
    const gone = result.status === 404;
    console.log(`${gone ? 'ok' : 'FAIL'} debug route ${result.status} ${path}`);
    if (!gone) failures.push(result);
  }

  const image = await fetch(`${BASE}/api/image`);
  console.log(`${image.status === 400 ? 'ok' : 'FAIL'} ${image.status} /api/image missing params`);
  if (image.status !== 400) failures.push({ path: '/api/image', status: image.status });

  const badImage = await fetch(`${BASE}/api/image?path=../secret`);
  console.log(`${badImage.status === 403 ? 'ok' : 'FAIL'} ${badImage.status} /api/image traversal`);
  if (badImage.status !== 403) failures.push({ path: '/api/image traversal', status: badImage.status });

  if (failures.length) {
    console.error(`\n${failures.length} HTTP check(s) failed`);
    process.exit(1);
  }
  console.log('\nAll HTTP checks passed');
}

main();
