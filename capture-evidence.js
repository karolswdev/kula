/**
 * capture-evidence.js
 * 
 * Automated test runner for TC-8.1 Model Normalization
 * Uses puppeteer to run browser test and capture evidence
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureEvidence() {
    console.log('Starting TC-8.1 Model Normalization Test...');
    
    // Ensure evidence directory exists
    const evidenceDir = path.join(__dirname, 'evidence', 'phase-8', 'story-8.1');
    if (!fs.existsSync(evidenceDir)) {
        fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for consistent screenshots
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to test page
        await page.goto('http://localhost:8080/test-model-normalization.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        // Wait for tests to complete
        await page.waitForSelector('#summary', { 
            visible: true,
            timeout: 30000 
        });
        
        // Wait a bit more for all rendering
        await page.waitForTimeout(2000);
        
        // Capture console logs
        const logs = [];
        page.on('console', msg => {
            logs.push(`${msg.type()}: ${msg.text()}`);
        });
        
        // Get test results from the page
        const testResults = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('.test-result').forEach(result => {
                const modelName = result.querySelector('h3').textContent;
                const passed = result.classList.contains('pass');
                const dimensions = result.querySelector('.model-info').textContent;
                results.push({ modelName, passed, dimensions });
            });
            
            const summary = document.getElementById('summary-text').textContent;
            return { results, summary };
        });
        
        // Take screenshot
        const screenshotPath = path.join(evidenceDir, 'model-normalization-proof.png');
        await page.screenshot({ 
            path: screenshotPath,
            fullPage: true 
        });
        console.log(`Screenshot saved to: ${screenshotPath}`);
        
        // Save test results to file
        const resultsPath = path.join(evidenceDir, 'tc-8.1-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
        console.log(`Test results saved to: ${resultsPath}`);
        
        // Save console logs
        const logsPath = path.join(evidenceDir, 'tc-8.1-console.log');
        fs.writeFileSync(logsPath, logs.join('\n'));
        console.log(`Console logs saved to: ${logsPath}`);
        
        // Print summary
        console.log('\nTest Summary:');
        console.log(testResults.summary);
        
        // Return success/failure
        return testResults.summary.includes('ALL TESTS PASSED');
        
    } catch (error) {
        console.error('Error during test execution:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run if executed directly
if (require.main === module) {
    captureEvidence()
        .then(passed => {
            console.log(passed ? '\n✓ TC-8.1 PASSED' : '\n✗ TC-8.1 FAILED');
            process.exit(passed ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { captureEvidence };