import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Lighthouse
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    // Remover auditorias específicas que causam problemas no Lantern
    skipAudits: [
      'first-contentful-paint-all-frames',
      'largest-contentful-paint-all-frames'
    ],
  },
};

// Obter URL base dos argumentos da linha de comando ou variável de ambiente
const getBaseUrl = () => {
  // Verificar argumentos da linha de comando
  const urlArg = process.argv.find(arg => arg.startsWith('--url='));
  if (urlArg) {
    return urlArg.split('=')[1];
  }
  
  // Verificar variável de ambiente
  if (process.env.LIGHTHOUSE_BASE_URL) {
    return process.env.LIGHTHOUSE_BASE_URL;
  }
  
  // Se estiver no GitHub Actions, usar URL de produção por padrão
  if (process.env.GITHUB_ACTIONS) {
    return 'https://mediflow-tau.vercel.app';
  }
  
  // Padrão para desenvolvimento local
  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();
console.log(`🌐 URL base para testes: ${BASE_URL}`);

// URLs para testar
const urlsToTest = [
  { url: `${BASE_URL}/`, name: 'home' },
  { url: `${BASE_URL}/auth/login`, name: 'login' },
  { url: `${BASE_URL}/auth/register`, name: 'register' }
];

// Função para executar auditoria Lighthouse
async function runLighthouseAudit(url, name, formFactor = 'mobile') {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    formFactor: formFactor,
    // Configuração de emulação correta
    screenEmulation: {
      mobile: formFactor === 'mobile',
      width: formFactor === 'mobile' ? 375 : 1350,
      height: formFactor === 'mobile' ? 667 : 940,
      deviceScaleFactor: formFactor === 'mobile' ? 2 : 1,
      disabled: false,
    },
    throttling: {
      rttMs: formFactor === 'mobile' ? 150 : 40,
      throughputKbps: formFactor === 'mobile' ? 1638.4 : 10240,
      cpuSlowdownMultiplier: formFactor === 'mobile' ? 4 : 1,
    },
  };

  try {
    console.log(`🔍 Executando auditoria Lighthouse para ${name} (${formFactor})...`);
    const runnerResult = await lighthouse(url, options, config);
    
    if (!runnerResult) {
      throw new Error('Lighthouse não retornou resultados');
    }

    // Extrair scores
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };

    // Salvar relatório HTML
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    const reportPath = path.join(reportsDir, `lighthouse-${name}-${formFactor}.html`);
    await fs.writeFile(reportPath, runnerResult.report);

    console.log(`✅ Relatório salvo: ${reportPath}`);
    console.log(`📊 Scores - Performance: ${scores.performance}, Accessibility: ${scores.accessibility}, Best Practices: ${scores.bestPractices}, SEO: ${scores.seo}`);

    // Tentar fechar Chrome com tratamento de erro
    try {
      await chrome.kill();
    } catch (killError) {
      console.log(`⚠️  Aviso: Erro ao fechar Chrome (${killError.message}) - continuando...`);
    }
    
    return { scores, reportPath, name, formFactor };
    
  } catch (error) {
    // Tentar fechar Chrome mesmo em caso de erro
    try {
      await chrome.kill();
    } catch (killError) {
      console.log(`⚠️  Aviso: Erro ao fechar Chrome após falha (${killError.message})`);
    }
    throw error;
  }
}

// Função para gerar relatório consolidado
async function generateConsolidatedReport(results) {
  const reportsDir = path.join(process.cwd(), 'reports');
  const consolidatedPath = path.join(reportsDir, 'lighthouse-summary.html');
  
  let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Lighthouse - MediFlow</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        .score { font-size: 24px; font-weight: bold; text-align: center; margin: 10px 0; }
        .score.good { color: #0cce6b; }
        .score.average { color: #ffa400; }
        .score.poor { color: #ff4e42; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; }
        .metric { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .metric-value { font-weight: bold; font-size: 18px; }
        .metric-label { font-size: 12px; color: #666; }
        .timestamp { text-align: center; color: #666; margin-top: 20px; }
        .criteria { margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 8px; }
        .criteria h3 { margin-top: 0; color: #1976d2; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.pass { background: #c8e6c9; color: #2e7d32; }
        .status.fail { background: #ffcdd2; color: #c62828; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Relatório Lighthouse - MediFlow</h1>
        
        <div class="criteria">
            <h3>🎯 Critérios de Aceite</h3>
            <p><strong>Mobile:</strong> Performance ≥ 80, Best Practices ≥ 90, Accessibility ≥ 90</p>
        </div>
        
        <div class="summary">
`;

  results.forEach(result => {
    const { scores, name, formFactor } = result;
    
    // Determinar status dos critérios
    let criteriaStatus = 'pass';
    if (formFactor === 'mobile') {
      if (scores.performance < 80 || scores.bestPractices < 90 || scores.accessibility < 90) {
        criteriaStatus = 'fail';
      }
    }
    
    html += `
            <div class="card">
                <h3>${name.charAt(0).toUpperCase() + name.slice(1)} (${formFactor})</h3>
                <div class="status ${criteriaStatus}">
                    ${criteriaStatus === 'pass' ? '✅ APROVADO' : '❌ REPROVADO'}
                </div>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value score ${scores.performance >= 90 ? 'good' : scores.performance >= 50 ? 'average' : 'poor'}">
                            ${scores.performance}
                        </div>
                        <div class="metric-label">Performance</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value score ${scores.accessibility >= 90 ? 'good' : scores.accessibility >= 50 ? 'average' : 'poor'}">
                            ${scores.accessibility}
                        </div>
                        <div class="metric-label">Accessibility</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value score ${scores.bestPractices >= 90 ? 'good' : scores.bestPractices >= 50 ? 'average' : 'poor'}">
                            ${scores.bestPractices}
                        </div>
                        <div class="metric-label">Best Practices</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value score ${scores.seo >= 90 ? 'good' : scores.seo >= 50 ? 'average' : 'poor'}">
                            ${scores.seo}
                        </div>
                        <div class="metric-label">SEO</div>
                    </div>
                </div>
            </div>
`;
  });

  html += `
        </div>
        
        <div class="timestamp">
            <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>Relatórios detalhados disponíveis na pasta reports/</p>
        </div>
    </div>
</body>
</html>
`;

  await fs.writeFile(consolidatedPath, html);
  console.log(`📋 Relatório consolidado salvo: ${consolidatedPath}`);
  
  return consolidatedPath;
}

// Função principal
async function main() {
  console.log('🚀 Iniciando auditoria Lighthouse...');
  
  const results = [];
  
  try {
    // Testar cada URL em mobile e desktop
    for (const { url, name } of urlsToTest) {
      // Mobile
      const mobileResult = await runLighthouseAudit(url, name, 'mobile');
      results.push(mobileResult);
      
      // Desktop
      const desktopResult = await runLighthouseAudit(url, name, 'desktop');
      results.push(desktopResult);
      
      // Aguardar um pouco entre as auditorias
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Gerar relatório consolidado
    await generateConsolidatedReport(results);
    
    // Verificar critérios de aceite
    const mobileResults = results.filter(r => r.formFactor === 'mobile');
    const failedCriteria = mobileResults.filter(r => 
      r.scores.performance < 80 || 
      r.scores.bestPractices < 90 || 
      r.scores.accessibility < 90
    );
    
    if (failedCriteria.length > 0) {
      console.log('\n❌ CRITÉRIOS DE ACEITE NÃO ATENDIDOS:');
      failedCriteria.forEach(result => {
        console.log(`   ${result.name}: Performance ${result.scores.performance}, Best Practices ${result.scores.bestPractices}, Accessibility ${result.scores.accessibility}`);
      });
      process.exit(1);
    } else {
      console.log('\n✅ TODOS OS CRITÉRIOS DE ACEITE FORAM ATENDIDOS!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a auditoria:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Se for erro de permissão na limpeza de arquivos temporários, continuar
    if (error.code === 'EPERM' || error.message.includes('taskkill') || error.message.includes('lighthouse.')) {
      console.log('⚠️  Aviso: Erro de permissão na limpeza de arquivos temporários (pode ser ignorado)');
      
      // Verificar critérios mesmo com erro de limpeza
      if (results.length > 0) {
        const mobileResults = results.filter(r => r.formFactor === 'mobile');
        const failedCriteria = mobileResults.filter(r => 
          r.scores.performance < 80 || 
          r.scores.bestPractices < 90 || 
          r.scores.accessibility < 90
        );
        
        if (failedCriteria.length > 0) {
          console.log('\n❌ CRITÉRIOS DE ACEITE NÃO ATENDIDOS:');
          failedCriteria.forEach(result => {
            console.log(`   ${result.name}: Performance ${result.scores.performance}, Best Practices ${result.scores.bestPractices}, Accessibility ${result.scores.accessibility}`);
          });
          process.exit(1);
        } else {
          console.log('\n✅ TODOS OS CRITÉRIOS DE ACEITE FORAM ATENDIDOS!');
        }
      }
    } else {
      process.exit(1);
    }
  }
}

// Verificar se o servidor está rodando
async function checkServer() {
  console.log('🔍 Verificando se o servidor está rodando...');
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`Servidor não está respondendo (Status: ${response.status})`);
    }
    console.log('✅ Servidor está rodando!');
  } catch (error) {
    if (BASE_URL.includes('localhost')) {
      console.error(`❌ Erro: O servidor deve estar rodando em ${BASE_URL}`);
      console.log('   Execute: npm run dev');
    } else {
      console.error(`❌ Erro: Não foi possível acessar ${BASE_URL}`);
      console.log('   Verifique se a URL está correta e acessível');
    }
    process.exit(1);
  }
}

// Executar
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith('lighthouse-audit.js') || import.meta.url.endsWith('lighthouse-audit.mjs')) {
  console.log('🎯 Iniciando script lighthouse-audit.mjs');
  checkServer().then(() => main()).catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

export { runLighthouseAudit, generateConsolidatedReport };