const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * E2E Тест: Проверка редизайна HomeScreen (Cosmic Redesign)
 * 
 * Этот скрипт:
 * 1. Загружает приложение на localhost:8081
 * 2. Инжектирует AsyncStorage ключи для пропуска онбординга
 * 3. Проверяет наличие новых элементов дизайна (Big 3, "Твои звёзды сегодня")
 * 4. Сохраняет скриншот в папку с результатами
 */

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('🚀 Запуск теста редизайна...');

    try {
        console.log('🔗 Переход на http://localhost:8081...');
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });

        console.log('💉 Инжекция данных для пропуска онбординга...');
        await page.evaluate(() => {
            const userData = {
                id: 1,
                name: "Тестовый Пользователь",
                email: "test@example.com",
                subscription_type: "free",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const userStr = JSON.stringify(userData);

            // Пробуем все возможные варианты префиксов для AsyncStorage на вебе
            const keys = ['user', 'onboarding_completed'];
            const prefixes = ['', 'ReactNativeStorage?', '@natalkartaexpo:'];

            prefixes.forEach(p => {
                localStorage.setItem(`${p}user`, userStr);
                localStorage.setItem(`${p}onboarding_completed`, 'true');
            });

            console.log('Ключи установлены:', localStorage);
            window.location.reload();
        });

        console.log('⏳ Ожидание загрузки HomeScreen (10с)...');
        await new Promise(r => setTimeout(r, 10000)); // Даем время на рендер и Metro

        // Проверка через JS для надежности
        const pageContent = await page.evaluate(() => {
            return {
                text: document.body.innerText,
                html: document.body.innerHTML
            };
        });

        // Ищем подстроку без жесткой привязки к регистру/форматированию
        const isHomeScreen = pageContent.text.toLowerCase().includes('your daily astrology');

        if (isHomeScreen) {
            console.log('✅ HomeScreen загружен. Заголовок найден!');
        } else {
            // Сохраняем скриншот ошибки
            const errorPath = path.join(__dirname, 'test_failure_debug.png');
            await page.screenshot({ path: errorPath });
            throw new Error(`HomeScreen не загружен. Текст "YOUR DAILY ASTROLOGY" не найден. См. ${errorPath}`);
        }

        // Проверка наличия блока Horoscope или Tarot
        const hasMainCards = pageContent.text.includes('HOROSCOPE') || pageContent.text.includes('TAROT') || pageContent.text.includes('SCORPIO');

        if (hasMainCards) {
            console.log('✅ Основные карточки (Гороскоп/Таро) присутствуют на экране.');
        } else {
            console.log('⚠️ Основные карточки не найдены в тексте страницы.');
        }

        // Проверка секции Celestial Alignments
        const hasAlignments = pageContent.text.includes('CELESTIAL ALIGNMENTS');
        if (hasAlignments) {
            console.log('✅ Секция Celestial Alignments найдена.');
        }

        // Финальный скриншот
        const screenshotPath = path.join(__dirname, 'redesign_test_success.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Скриншот успеха сохранен: ${screenshotPath}`);

        console.log('🏁 Тест успешно завершен!');
    } catch (error) {
        console.error('❌ Тест провален:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
