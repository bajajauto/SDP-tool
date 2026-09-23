const { chromium } = require(process.env.TRACKING_PLAYWRIGHT_PATH);
const ExcelJS = require('exceljs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Users/achaturvedi2/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe', headless: true });
  try {
    for (const role of ['tdadmin', 'buhr']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      page.setDefaultTimeout(15000);
      await page.addInitScript((view) => sessionStorage.setItem('sdp_authenticated_view_v1', view), role);
      const keys = ['SDP_SUBMITTED','GROWTH_CONVERSATION','MGR_PLAN_FEEDBACK','Q1_CHECKIN','MID_YEAR_CHECKIN','MGR_MID_FEEDBACK','Q2_CHECKIN','YEAR_END_CHECKIN','MGR_YEAR_FEEDBACK'];
      const rows = Array.from({ length: 205 }, (_, i) => ({ employeeId: `E${i}`, employeeName: i === 0 ? '=1+1' : `Employee ${i}`, managerName: 'Manager', bu: 'BU A', department: i % 2 ? 'Engineering' : 'Operations', designation: 'Engineer', sharingScope: null, milestones: Object.fromEntries(keys.map((key, k) => [key, { state: k === 0 && i % 2 ? 'DONE' : k < 3 ? 'PENDING' : 'NOT_DUE', completedAt: null }])) }));
      rows.forEach((row, i) => {
        row.bu = i % 2 ? 'BU B' : 'BU A';
        row.designation = i % 2 ? 'Engineer' : 'Specialist';
        row.managerName = i % 2 ? 'Engineering Manager' : 'Operations Manager';
        row.company = i % 2 ? 'Test Company' : null;
      });
      await page.route('**/api/me', route => route.fulfill({ json: { employee: { fullName: 'Test User', employeeId: 'HR001' }, roles: [role === 'buhr' ? 'BUHR' : 'TD_ADMIN'] } }));
      await page.route('**/api/sdp', route => route.fulfill({ status: 404, json: {} }));
      await page.route('**/api/hr/tracking?*', route => {
        const pageNumber = Number(new URL(route.request().url()).searchParams.get('page'));
        return route.fulfill({ json: { data: rows.slice((pageNumber - 1) * 200, pageNumber * 200), pagination: { total: rows.length } } });
      });
      await page.goto(process.env.TRACKING_BASE_URL || 'http://127.0.0.1:5173');
      await page.getByText('No selection applied', { exact: true }).waitFor();
      assert.equal(await page.locator('.buhr-table').count(), 0);
      const categoryPicker = page.getByLabel('Filter category to add');
      assert.equal(await categoryPicker.count(), 0);
      assert.equal(await page.getByText('Add another filter', { exact: true }).count(), 0);
      await page.getByRole('button', { name: 'Add filter', exact: true }).click();
      assert.deepEqual(await categoryPicker.locator('option').evaluateAll(options => options.map(option => option.value)), ['', 'company']);
      await page.getByLabel('Business Unit', { exact: true }).selectOption('BU A');
      assert.equal(await categoryPicker.count(), 0);
      assert.equal(await page.getByRole('button', { name: 'Add filter', exact: true }).count(), 0);
      await page.getByLabel('Business Unit', { exact: true }).selectOption('BU B');
      assert.equal(await categoryPicker.count(), 0);
      await page.getByRole('button', { name: 'Add filter', exact: true }).click();
      assert(await categoryPicker.isVisible());
      assert.equal(await categoryPicker.inputValue(), '');
      assert.deepEqual(await categoryPicker.locator('option').evaluateAll(options => options.map(option => option.value)), ['', 'company']);
      await page.getByLabel('Filter category to add').selectOption('company');
      const companyFilter = page.getByLabel('Company', { exact: true });
      assert(await companyFilter.isVisible());
      assert(await companyFilter.evaluate(element => element === document.activeElement));
      assert.equal(await page.getByRole('button', { name: 'Add filter', exact: true }).count(), 0);
      await page.getByLabel('Business Unit', { exact: true }).selectOption('BU A');
      assert(await companyFilter.isVisible());
      await page.getByRole('button', { name: 'Remove Company filter' }).click();
      assert.equal(await companyFilter.count(), 0);
      assert.equal(await categoryPicker.count(), 0);
      await page.getByRole('button', { name: 'Clear', exact: true }).click();
      assert.equal(await categoryPicker.count(), 0);
      await page.getByRole('button', { name: 'Add filter', exact: true }).click();
      await page.getByLabel('Filter category to add').selectOption('company');
      await companyFilter.selectOption('Test Company');
      await page.getByRole('button', { name: 'Apply filters' }).click();
      assert.equal(await page.locator('.tracking-metrics strong').first().textContent(), '102');
      await page.getByRole('button', { name: 'Clear', exact: true }).click();
      await page.getByRole('button', { name: 'Apply filters' }).click();
      assert.equal(await page.locator('.tracking-metrics strong').first().textContent(), '205');
      await page.getByLabel('Department', { exact: true }).selectOption('Engineering');
      assert.equal(await page.locator('.tracking-metrics strong').first().textContent(), '205');
      await page.getByRole('button', { name: 'Apply filters' }).click();
      assert.equal(await page.locator('.tracking-metrics strong').first().textContent(), '102');
      await page.screenshot({ path: `tracking-${role}-desktop.png`, fullPage: true });
      if (!process.env.TRACKING_FILTERS_ONLY) {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export selection', exact: true }).click();
      const download = await downloadPromise;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(await download.path());
      assert.equal(workbook.getWorksheet('Employee tracking').rowCount, 103);
      const allPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export all to Excel', exact: true }).click();
      const all = await allPromise;
      await workbook.xlsx.readFile(await all.path());
      assert.equal(workbook.getWorksheet('Employee tracking').rowCount, 206);
      assert.equal(workbook.getWorksheet('Employee tracking').getCell('B2').type, ExcelJS.ValueType.String);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: `tracking-${role}-mobile.png`, fullPage: true });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      await page.getByLabel('Designation', { exact: true }).selectOption('Engineer');
      await page.getByLabel('Manager Name', { exact: true }).selectOption('Engineering Manager');
      await page.getByLabel('Business Unit', { exact: true }).selectOption('BU A');
      for (const label of ['Department', 'Designation', 'Manager Name']) {
        assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), '');
      }
      assert.deepEqual(await page.getByLabel('Department', { exact: true }).locator('option').evaluateAll(options => options.map(option => option.value)), ['', 'Operations']);
      assert.deepEqual(await page.getByLabel('Designation', { exact: true }).locator('option').evaluateAll(options => options.map(option => option.value)), ['', 'Specialist']);
      assert.deepEqual(await page.getByLabel('Manager Name', { exact: true }).locator('option').evaluateAll(options => options.map(option => option.value)), ['', 'Operations Manager']);
      await page.getByRole('button', { name: 'Apply filters' }).click();
      assert.equal(await page.locator('.tracking-metrics strong').first().textContent(), '103');
      await page.getByLabel('Business Unit', { exact: true }).selectOption('');
      assert.deepEqual(await page.getByLabel('Department', { exact: true }).locator('option').evaluateAll(options => options.map(option => option.value)), ['', 'Engineering', 'Operations']);
      await page.getByRole('button', { name: 'Clear', exact: true }).click();
      await page.getByText('No selection applied', { exact: true }).waitFor();
      console.log(`${role}: pagination, add/remove filters, charts, reset, and mobile width passed${process.env.TRACKING_FILTERS_ONLY ? '' : ', plus both XLSX exports'}`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
