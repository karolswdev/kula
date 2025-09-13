// Quick verification script to test if the app loads without errors
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Collect console messages and errors
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        errors.push(error.toString());
    });
    
    console.log('Loading application at http://localhost:8081...');
    
    try {
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
        
        // Wait a bit for the app to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if CANNON is defined
        const cannonCheck = await page.evaluate(() => {
            return {
                cannonDefined: typeof CANNON !== 'undefined',
                threeDefined: typeof THREE !== 'undefined',
                hasWorld: typeof CANNON !== 'undefined' && CANNON.World !== undefined
            };
        });
        
        console.log('\n✅ Page loaded successfully');
        console.log('\nGlobal variables check:');
        console.log('  THREE.js loaded:', cannonCheck.threeDefined ? '✅' : '❌');
        console.log('  CANNON.js loaded:', cannonCheck.cannonDefined ? '✅' : '❌');
        console.log('  CANNON.World available:', cannonCheck.hasWorld ? '✅' : '❌');
        
        if (errors.length > 0) {
            console.log('\n❌ JavaScript Errors Found:');
            errors.forEach(err => console.log('  ', err));
        } else {
            console.log('\n✅ No JavaScript errors detected');
        }
        
        console.log('\nConsole output from the app:');
        consoleMessages.forEach(msg => console.log('  ', msg));
        
    } catch (error) {
        console.error('❌ Failed to load the application:', error);
    }
    
    await browser.close();
})();