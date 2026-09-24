const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Login first
  await page.goto('http://localhost:3000/login');
  await page.type('input[type="email"]', 'dmuvaa70@gmail.com');
  await page.type('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  await page.goto('http://localhost:3000/dashboard/recruiter/settings');
  
  // Evaluate the layout
  const layout = await page.evaluate(() => {
    const grid = document.querySelector('div[style*="gridTemplateColumns"]');
    const aside = document.querySelector('aside');
    const main = document.querySelector('main');
    
    return {
      grid: grid ? {
        display: getComputedStyle(grid).display,
        columns: getComputedStyle(grid).gridTemplateColumns
      } : null,
      aside: aside ? {
        position: getComputedStyle(aside).position,
        left: aside.getBoundingClientRect().left,
        top: aside.getBoundingClientRect().top,
        width: aside.getBoundingClientRect().width,
      } : null,
      main: main ? {
        position: getComputedStyle(main).position,
        left: main.getBoundingClientRect().left,
        top: main.getBoundingClientRect().top,
        width: main.getBoundingClientRect().width,
        gridColumn: getComputedStyle(main).gridColumn
      } : null
    };
  });
  
  console.log(JSON.stringify(layout, null, 2));
  await browser.close();
}
run();
