const { By, Key, Builder } = require('selenium-webdriver');
var prompt = require('prompt-sync')();
require('chromedriver');
const Chrome = require('selenium-webdriver/chrome');

const COLOR_SEPARATOR = '-';
const SIZE_SEPARATOR = '-';
const LINE_SEPARATOR = '\n--------------------------------\n';

let contents = [];

async function getInfo(input, driver) {
    let content = '';
    let colors = [];
    let sizes = [];

    // Add product code
    await driver.get('https://www.mwc.com.vn/search?s=' + input);

    content += `✔️ Mã sp: ${input}`;

    // Add product colors
    await driver.findElement(By.css('.product-grid-item a')).click();
    const colorElements = await driver.findElements(By.css('.product-option #colorOptions .product-option-item'))

    for(let color of colorElements) {
        colors.push(await color.getAttribute('title'));
    }
    
    content += '\n';
    content += `✔️ Màu sắc: ${colors.join(COLOR_SEPARATOR)}`;

    // Add product sizes
    const sizeElements = await driver.findElements(By.css('.product-option #sizeOptions a.product-option-item'))

    for(let size of sizeElements) {
        await size.click();

        const inStock = await driver.findElement(By.css('.product-cart-actions #btnStatus')).getCssValue('display') === 'none';

        if(inStock) sizes.push(await size.getText());
    }

    content += '\n';
    content += `✔️ Size: ${sizes.join(SIZE_SEPARATOR)}`;

    // Add product price
    const price = await driver.findElement(By.css('.product-detail-main .product-grid-price .product-grid-price-new-text')).getText();
    content += '\n';
    content += `✔️ Giá: ${price}`;

    return content;
}

async function getInputs(){
    let inputs = prompt(`Nhập mã sản phẩm, cách nhau bởi dấu phẩy nha: `);

    // Split and trim input
    inputs = inputs.split(",").map((item) => item.trim());

    // Unique input
    inputs = [...new Set(inputs)];

    return inputs;
}

async function run(){
    const options = new Chrome.Options();
    driver = await new Builder()
            .setChromeOptions(options.addArguments('headless', 'disable-dev-shm-usage', 'no-sandbox'))
            .forBrowser('chrome')
            .build();

    // let driver = await new Builder().forBrowser('chrome').build();

    const inputs = await getInputs();

    for(let input of inputs) {
        console.log(`Đang lấy thông tin sản phẩm ${input}`)
        contents.push(await getInfo(input, driver));
    }

    // Log results
    console.log(LINE_SEPARATOR);
    console.log(contents.join(LINE_SEPARATOR));
    
    driver.quit();
}

run();
