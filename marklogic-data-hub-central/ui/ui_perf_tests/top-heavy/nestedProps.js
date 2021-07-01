const {extractDataFromPerformanceTiming} = require("./perfHelper");

async function nestedProps(page) {
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  await page.waitFor(1000);
  await page.waitForSelector("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolTallWrapper] > .curateIcon");
  await page.click("main > .contentContainer > [id*=toolbar_toolbar] > [class*=toolbar_toolTallWrapper] > .curateIcon");

  await page.waitFor(1000);
  await page.waitForSelector(".ant-collapse > .ant-collapse-item:nth-child(8) > .ant-collapse-header > .anticon > svg");
  await page.click(".ant-collapse > .ant-collapse-item:nth-child(8) > .ant-collapse-header > .anticon > svg");

  await page.waitFor(1000);
  await page.waitForSelector("li > span > [class*=mapping-card_stepDetails] > [data-testid=map-Top-Heavy-stepDetails]");
  await page.click("li > span > [class*=mapping-card_stepDetails] > [data-testid=map-Top-Heavy-stepDetails]");
  await page.waitForSelector("#functionIcon");

  await page.waitForSelector(".ant-table-row-level-1 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");
  await page.click(".ant-table-row-level-1 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");

  await page.waitForSelector(".ant-table-row-level-2 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");
  await page.click(".ant-table-row-level-2 > .ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon > svg");

  await page.waitForSelector(".ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon-right > svg > path");
  await page.click(".ant-table-column-has-actions > [class*=entity-map-table_expandIcon] > .anticon-right > svg > path");

  return extractDataFromPerformanceTiming(
    performanceTiming,
    "responseEnd",
    "domInteractive",
    "domContentLoadedEventEnd",
    "domComplete",
    "loadEventEnd"
  );
}

module.exports = nestedProps;