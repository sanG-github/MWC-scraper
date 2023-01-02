require('chromedriver');
const { By, Key, Builder } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
var morgan = require('morgan')
var express = require('express')
var app = express();
var port = process.env.PORT || 3000;

app.use(morgan('combined'))

const COLOR_SEPARATOR = '-';
const SIZE_SEPARATOR = '-';
const LINE_BREAK = '<br/>';
const TEXT_OPEN_TAG = '<span>';
const TEXT_CLOSE_TAG = '</span>';
const LINE_SEPARATOR = `${LINE_BREAK}--------------------------------${LINE_BREAK}`;

async function getInfo(input, driver) {
    let content = '';
    let colors = [];
    let sizes = [];

    // Add product code
    await driver.get('https://www.mwc.com.vn/search?s=' + input);

    content += `${TEXT_OPEN_TAG}✔️ Mã sp: ${input}${TEXT_CLOSE_TAG}`;

    // Add product colors
    await driver.findElement(By.css('.product-grid-item a')).click();
    const colorElements = await driver.findElements(By.css('.product-option #colorOptions .product-option-item'))

    for (let color of colorElements) {
        colors.push(await color.getAttribute('title'));
    }

    content += LINE_BREAK;
    content += `${TEXT_OPEN_TAG}✔️ Màu sắc: ${colors.join(COLOR_SEPARATOR)}${TEXT_CLOSE_TAG}`;

    // Add product sizes
    const sizeElements = await driver.findElements(By.css('.product-option #sizeOptions a.product-option-item'))

    for (let size of sizeElements) {
        // await size.click();

        // const inStock = await driver.findElement(By.css('.product-cart-actions #btnStatus')).getCssValue('display') === 'none';

        // if (inStock) 
        sizes.push(await size.getText());
    }

    content += LINE_BREAK;
    content += `${TEXT_OPEN_TAG}✔️ Size: ${sizes.join(SIZE_SEPARATOR)}${TEXT_CLOSE_TAG}`;

    // Add product price
    const price = await driver.findElement(By.css('.product-detail-main .product-grid-price .product-grid-price-new-text')).getText();
    content += LINE_BREAK;
    content += `${TEXT_OPEN_TAG}✔️ Giá: ${price}${TEXT_CLOSE_TAG}`;

    return content;
}

function parseInputs(inputs) {
    if (!inputs) return [];

    // Split and trim input
    inputs = inputs.split(",").map((item) => item.trim());

    // Unique input
    inputs = [...new Set(inputs)];

    return inputs;
}

app.get('/', async function(req, res) {
    let contents = [];
    const inputs = parseInputs(req.query.codes);

    const options = new Chrome.Options();
    driver = await new Builder()
        .setChromeOptions(options.addArguments('headless', 'disable-dev-shm-usage', 'no-sandbox'))
        .forBrowser('chrome')
        .build();

    for (let input of inputs) {
        console.log(`Đang lấy thông tin sản phẩm ${input}`)
        contents.push(await getInfo(input, driver));
    }

    // Log results
    res.setHeader('Content-type', 'text/html');
    res.send(contents.join(LINE_SEPARATOR));

    driver.quit();
});

app.listen(port, function() {
    console.log('App listening on port: ', port)
})