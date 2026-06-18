const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Advanced helper to click React Native Web elements using native Puppeteer mouse coordinates
async function clickReactNativeElement(page, text, tag = 'div') {
  console.log(`🖱️ Clicking React Native element with text: "${text}"`);
  
  // Find the element in the page context and return its handle
  const elementHandle = await page.evaluateHandle((txt, tagName) => {
    const elements = Array.from(document.querySelectorAll(tagName));
    
    // Find the element containing the text
    let el = elements.find(e => e.innerText && e.innerText.toLowerCase().trim() === txt.toLowerCase().trim());
    if (!el) {
      el = elements.find(e => e.innerText && e.innerText.toLowerCase().includes(txt.toLowerCase()));
    }
    
    // Fallback to buttons or other tags
    if (!el && tagName !== 'button') {
      const buttons = Array.from(document.querySelectorAll('button'));
      el = buttons.find(b => b.innerText && (b.innerText.toLowerCase().includes(txt.toLowerCase()) || b.innerText.toLowerCase().trim() === txt.toLowerCase().trim()));
    }

    if (!el) return null;

    // Traverse up to find the closest clickable wrapper
    let target = el;
    while (target && target.parentElement) {
      if (target.getAttribute('tabindex') === '0' || target.tagName === 'BUTTON' || target.style.cursor === 'pointer' || target.onclick) {
        break;
      }
      target = target.parentElement;
    }
    return target || el;
  }, text, tag);

  // Check if handle is null
  const isNull = await page.evaluate(h => h === null, elementHandle);
  if (isNull) {
    throw new Error(`Element with text "${text}" not found`);
  }

  // Get bounding box of the element to click it physically
  const box = await elementHandle.boundingBox();
  if (!box) {
    // If not visible, try to scroll into view
    await page.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }), elementHandle);
    await new Promise(r => setTimeout(r, 500));
    const boxRetry = await elementHandle.boundingBox();
    if (!boxRetry) {
      throw new Error(`Element with text "${text}" is not visible (no bounding box)`);
    }
    await page.mouse.click(boxRetry.x + boxRetry.width / 2, boxRetry.y + boxRetry.height / 2);
  } else {
    // Click center of bounding box
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  await elementHandle.dispose();

  // Give React state transitions time to process
  await new Promise((r) => setTimeout(r, 1200));
}

(async () => {
  const artifactDir = '/Users/nikita/.gemini/antigravity/brain/3cc7e2ae-740b-4cd1-922a-792ecd47da82';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: false, // Keep visible as requested
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  // Emulate phone viewport
  await page.setViewport({ width: 390, height: 844 });

  console.log('🚀 Starting onboarding walkthrough test...');

  try {
    // Navigate to local Expo Web App
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
    console.log('🔗 Opened http://localhost:8081');

    // Clear localStorage to ensure onboarding resets
    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    
    // Wait for reload and page load
    await new Promise((r) => setTimeout(r, 3000));
    console.log('🧹 Cleared localStorage and reloaded.');

    // Screenshot Step 0 (Name)
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_0_name.png') });
    console.log('📸 Saved Step 0 (Name) screenshot');

    // Type name
    console.log('✍️ Typing name...');
    const nameInputSelector = 'input[placeholder="Введи своё имя"]';
    await page.waitForSelector(nameInputSelector);
    await page.type(nameInputSelector, 'Никита');

    // Accept Terms checkbox: Click the square box inside the TouchWrapper directly!
    console.log('☑️ Clicking legal checkbox...');
    const checkboxHandle = await page.evaluateHandle(() => {
      const touchables = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const container = touchables.find(t => t.innerText && t.innerText.includes('Я принимаю'));
      if (!container) return null;
      return container.querySelector('div'); // The first inner div is the checkbox square!
    });
    
    const isNullCheckbox = await page.evaluate(h => h === null, checkboxHandle);
    if (isNullCheckbox) {
      throw new Error("Checkbox container not found");
    }
    
    const checkboxBox = await checkboxHandle.boundingBox();
    // Simulate real physical click inside the checkbox square
    await page.mouse.click(checkboxBox.x + checkboxBox.width / 2, checkboxBox.y + checkboxBox.height / 2);
    await checkboxHandle.dispose();
    console.log('✅ Clicked checkbox square.');

    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_0_name_filled.png') });
    console.log('📸 Saved filled Step 0 screenshot');

    // Click "Продолжить"
    await clickReactNativeElement(page, 'Продолжить');

    // Step 1: Gender
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_1_gender.png') });
    console.log('📸 Saved Step 1 (Gender) screenshot');

    await clickReactNativeElement(page, 'Мужской');
    await clickReactNativeElement(page, 'Продолжить');

    // Step 2: Date
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_2_date.png') });
    console.log('📸 Saved Step 2 (Date) screenshot');

    await clickReactNativeElement(page, 'Продолжить');

    // Step 3: Time
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_3_time.png') });
    console.log('📸 Saved Step 3 (Time) screenshot');

    await clickReactNativeElement(page, 'Продолжить');

    // Step 4: Place
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_4_place.png') });
    console.log('📸 Saved Step 4 (Place) screenshot');

    // Type city
    console.log('🏙️ Typing city: Москва...');
    const cityInputSelector = 'input[placeholder="Начните вводить название города"]';
    await page.waitForSelector(cityInputSelector);
    await page.type(cityInputSelector, 'Москва');

    // Wait for city list suggestions to appear and load
    console.log('⏳ Waiting for city suggestions from Rails API & DaData...');
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_4_place_suggestions.png') });

    // Select the first suggestion
    await clickReactNativeElement(page, 'Москва, Россия');

    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_4_place_selected.png') });
    console.log('📸 Saved city selected screenshot');

    // Click "Завершить" / "Рассчитать"
    console.log('🚀 Clicking Finish to calculate chart...');
    try {
      await clickReactNativeElement(page, 'Завершить');
    } catch (e) {
      await clickReactNativeElement(page, 'Рассчитать');
    }

    // Step 5: Loading screen (Houses Wheel)
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_5_loading.png') });
    console.log('📸 Saved Loading screen screenshot');

    // Wait for calculation (5 seconds + transition)
    console.log('⏳ Waiting 6 seconds for calculation animation...');
    await new Promise((r) => setTimeout(r, 6000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_6_result.png') });
    console.log('📸 Saved Result screen screenshot');

    // Click Continue on result screen
    await clickReactNativeElement(page, 'Продолжить');

    // Step 6: HomeScreen / Main
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(artifactDir, 'onboarding_step_7_home.png') });
    console.log('📸 Saved Home screen screenshot');

    console.log('🏁 Onboarding Walkthrough Test Completed successfully!');
  } catch (error) {
    console.error('❌ Walkthrough failed:', error.message);
    const html = await page.content();
    fs.writeFileSync(path.join(artifactDir, 'error_page.html'), html);
  } finally {
    await browser.close();
  }
})();
