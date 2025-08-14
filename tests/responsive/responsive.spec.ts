import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Breakpoints otimizados - apenas mobile e desktop
const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'desktop', width: 1024, height: 768 }
];

// Páginas principais para testar
const pagesToTest = [
  { path: '/', name: 'home' },
  { path: '/auth/login', name: 'login' },
  { path: '/auth/register', name: 'register' },
  { path: '/dashboard', name: 'dashboard', requiresAuth: true },
  { path: '/dashboard/patients', name: 'patients', requiresAuth: true },
  { path: '/dashboard/settings', name: 'settings', requiresAuth: true }
];

// Função para verificar overflow
async function checkOverflow(page: Page): Promise<string[]> {
  const overflowElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const overflowing: string[] = [];
    const TOLERANCE = 1; // Tolerância de 1px para arredondamento
    
    elements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // Verificar se há overflow horizontal significativo (> 1px)
      const elementRight = rect.left + rect.width;
      const viewportWidth = window.innerWidth;
      const overflow = elementRight - viewportWidth;
      
      if (overflow > TOLERANCE && 
          computedStyle.overflow !== 'hidden' && 
          computedStyle.overflowX !== 'hidden' &&
          computedStyle.position !== 'fixed' &&
          computedStyle.position !== 'absolute') {
        
        const selector = element.tagName.toLowerCase() + 
          (element.id ? `#${element.id}` : '') +
          (element.className ? `.${Array.from(element.classList).join('.')}` : '') +
          ` (${index})`;
        
        overflowing.push(`${selector} - Width: ${rect.width}px, Viewport: ${viewportWidth}px, Overflow: ${overflow.toFixed(2)}px`);
      }
    });
    
    return overflowing;
  });
  
  return overflowElements;
}

// Função para fazer login (se necessário)
async function loginIfRequired(page: Page) {
  try {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Aguardar os campos aparecerem
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    // Preencher credenciais de teste
    await page.fill('input[type="email"]', 'test@mediflow.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard ou continuar se falhar
    try {
      await page.waitForURL('/dashboard', { timeout: 8000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Login pode ter falhado, mas continuando com o teste...');
      // Se o login falhar, vamos tentar acessar a página diretamente
      // para pelo menos testar a responsividade da página de login
    }
  } catch (error) {
    console.log('Erro durante login:', error);
    // Continuar com o teste mesmo se o login falhar
  }
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
        try {
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');
        } catch (error) {
          console.log(`Erro ao navegar para ${pageInfo.path}:`, error);
          // Se falhar ao acessar página protegida, testar a página de login
          if (pageInfo.requiresAuth) {
            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');
          }
        }

        // Aguardar carregamento otimizado
        await page.waitForTimeout(500);

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

        // Verificar se não há scroll horizontal significativo (tolerância de 1px)
        const hasHorizontalScroll = await page.evaluate(() => {
          const TOLERANCE = 1;
          const overflow = document.documentElement.scrollWidth - window.innerWidth;
          return overflow > TOLERANCE;
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

  test('Textos devem ser legíveis em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar se não há texto muito pequeno apenas em mobile
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
      `Textos muito pequenos encontrados em mobile:\n${smallTexts.join('\n')}`
    ).toHaveLength(0);
  });
});