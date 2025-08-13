import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Breakpoints para teste
const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'mobile-large', width: 414, height: 896 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
  { name: 'desktop-large', width: 1440, height: 900 },
  { name: 'desktop-xl', width: 1920, height: 1080 }
];

// Páginas principais para testar
const pagesToTest = [
  { path: '/', name: 'home' },
  { path: '/auth/login', name: 'login' },
  { path: '/auth/register', name: 'register' },
  { path: '/dashboard', name: 'dashboard', requiresAuth: true }
];

// Função para verificar overflow
async function checkOverflow(page: Page): Promise<string[]> {
  const overflowElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const overflowing: string[] = [];
    
    elements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // Verifica se o elemento está transbordando horizontalmente
      if (rect.width > window.innerWidth && 
          computedStyle.overflow !== 'hidden' && 
          computedStyle.overflowX !== 'hidden' &&
          computedStyle.position !== 'fixed' &&
          computedStyle.position !== 'absolute') {
        
        const selector = element.tagName.toLowerCase() + 
          (element.id ? `#${element.id}` : '') +
          (element.className ? `.${Array.from(element.classList).join('.')}` : '') +
          ` (${index})`;
        
        overflowing.push(`${selector} - Width: ${rect.width}px, Viewport: ${window.innerWidth}px`);
      }
    });
    
    return overflowing;
  });
  
  return overflowElements;
}

// Função para fazer login (se necessário)
async function loginIfRequired(page: Page) {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

test.describe('Responsividade - Screenshots e Overflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Criar diretório de screenshots se não existir
    const screenshotsDir = path.join(process.cwd(), 'reports', 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
  });

  for (const pageInfo of pagesToTest) {
    for (const breakpoint of breakpoints) {
      test(`${pageInfo.name} - ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({ page }) => {
        
        // Configurar viewport
        await page.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });

        // Fazer login se necessário
        if (pageInfo.requiresAuth) {
          await loginIfRequired(page);
        }

        // Navegar para a página
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');

        // Aguardar um pouco para garantir que tudo carregou
        await page.waitForTimeout(2000);

        // Capturar screenshot
        const screenshotPath = path.join(
          'reports', 
          'screenshots', 
          `${pageInfo.name}-${breakpoint.name}-${breakpoint.width}x${breakpoint.height}.png`
        );
        
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });

        // Verificar overflow
        const overflowElements = await checkOverflow(page);
        
        // Salvar relatório de overflow
        if (overflowElements.length > 0) {
          const reportPath = path.join(
            'reports', 
            'screenshots', 
            `${pageInfo.name}-${breakpoint.name}-overflow-report.txt`
          );
          
          const report = [
            `Overflow Report - ${pageInfo.name} (${breakpoint.width}x${breakpoint.height})`,
            `Generated: ${new Date().toISOString()}`,
            `Page: ${pageInfo.path}`,
            `Viewport: ${breakpoint.width}x${breakpoint.height}`,
            '',
            'Elements with horizontal overflow:',
            ...overflowElements.map(el => `- ${el}`),
            ''
          ].join('\n');
          
          await fs.writeFile(reportPath, report);
        }

        // Falhar o teste se houver overflow
        expect(overflowElements, 
          `Elementos com overflow horizontal encontrados em ${pageInfo.name} (${breakpoint.width}x${breakpoint.height}):\n${overflowElements.join('\n')}`
        ).toHaveLength(0);

        // Verificar se não há scroll horizontal
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(hasHorizontalScroll, 
          `Scroll horizontal detectado em ${pageInfo.name} (${breakpoint.width}x${breakpoint.height})`
        ).toBe(false);
      });
    }
  }
});

test.describe('Responsividade - Elementos Críticos', () => {
  
  test('Navegação mobile deve ser funcional', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar se o menu mobile existe e é clicável
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]').first();
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }
  });

  test('Formulários devem ser utilizáveis em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/login');
    
    // Verificar se os campos de input são acessíveis
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Verificar se os elementos não estão cortados
    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();
    const buttonBox = await submitButton.boundingBox();
    
    if (emailBox) {
      expect(emailBox.x + emailBox.width).toBeLessThanOrEqual(375);
    }
    if (passwordBox) {
      expect(passwordBox.x + passwordBox.width).toBeLessThanOrEqual(375);
    }
    if (buttonBox) {
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('Textos devem ser legíveis em todos os breakpoints', async ({ page }) => {
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto('/');
      
      // Verificar se não há texto muito pequeno
      const smallTexts = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const smallTexts: string[] = [];
        
        elements.forEach((element) => {
          const computedStyle = window.getComputedStyle(element);
          const fontSize = parseFloat(computedStyle.fontSize);
          
          if (fontSize > 0 && fontSize < 12 && element.textContent?.trim()) {
            smallTexts.push(`${element.tagName}: ${fontSize}px - "${element.textContent.slice(0, 50)}..."`);
          }
        });
        
        return smallTexts;
      });
      
      expect(smallTexts, 
        `Textos muito pequenos encontrados em ${breakpoint.name}:\n${smallTexts.join('\n')}`
      ).toHaveLength(0);
    }
  });
});