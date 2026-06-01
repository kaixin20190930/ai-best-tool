#!/usr/bin/env tsx
// @ts-nocheck
/* eslint-disable */

/**
 * Fix Missing Translations Script
 *
 * This script adds missing admin sections and other translations
 * to locale files that are incomplete.
 */
import fs from 'fs';
import path from 'path';

interface TranslationUpdates {
  [locale: string]: {
    admin?: any;
    other?: any;
    [key: string]: any;
  };
}

// Admin section translations for each locale
const adminTranslations: TranslationUpdates = {
  es: {
    admin: {
      title: 'Panel de Administración',
      backToSite: 'Volver al Sitio',
      nav: {
        dashboard: 'Panel de Control',
        tools: 'Herramientas',
        users: 'Usuarios',
        analytics: 'Analíticas',
        settings: 'Configuración',
      },
      dashboard: {
        title: 'Panel de Control de Administración',
      },
    },
  },
  fr: {
    admin: {
      title: "Panneau d'Administration",
      backToSite: 'Retour au Site',
      nav: {
        dashboard: 'Tableau de Bord',
        tools: 'Outils',
        users: 'Utilisateurs',
        analytics: 'Analytiques',
        settings: 'Paramètres',
      },
      dashboard: {
        title: "Tableau de Bord d'Administration",
      },
    },
  },
  de: {
    admin: {
      title: 'Verwaltungspanel',
      backToSite: 'Zurück zur Website',
      nav: {
        dashboard: 'Dashboard',
        tools: 'Werkzeuge',
        users: 'Benutzer',
        analytics: 'Analytik',
        settings: 'Einstellungen',
      },
      dashboard: {
        title: 'Verwaltungs-Dashboard',
      },
    },
  },
  jp: {
    admin: {
      title: '管理パネル',
      backToSite: 'サイトに戻る',
      nav: {
        dashboard: 'ダッシュボード',
        tools: 'ツール',
        users: 'ユーザー',
        analytics: '分析',
        settings: '設定',
      },
      dashboard: {
        title: '管理ダッシュボード',
      },
    },
    // Also add missing Terms & Conditions sections
    FooterNavigation: {
      termsConditions: {
        'terms-of-service': '利用規約',
        '5-h2': '4. 準拠法',
        '5-p':
          'これらの規約は、法の抵触に関する規定にかかわらず、アメリカ合衆国の法律に準拠し、解釈されるものとします。',
        '6-h2': '5. 規約の変更',
        '6-p':
          'AI Best Toolディレクトリは、独自の裁量により、いつでもこれらの規約を変更または置き換える権利を留保します。変更があった場合は、メールでユーザーに通知します。これらの規約の変更後も本ウェブサイトを継続して使用することは、そのような変更を受け入れたことを意味します。',
        '7-h2': '6. 連絡先情報',
        '7-p': 'これらの規約について質問がある場合は、contact@6677.aiまでお問い合わせください。',
        'last-p': 'AI Best Toolディレクトリを使用することにより、これらの利用規約に同意したことになります。',
      },
    },
  },
  pt: {
    admin: {
      title: 'Painel de Administração',
      backToSite: 'Voltar ao Site',
      nav: {
        dashboard: 'Painel de Controle',
        tools: 'Ferramentas',
        users: 'Usuários',
        analytics: 'Análises',
        settings: 'Configurações',
      },
      dashboard: {
        title: 'Painel de Controle de Administração',
      },
    },
  },
  ru: {
    admin: {
      title: 'Панель Администратора',
      backToSite: 'Вернуться на Сайт',
      nav: {
        dashboard: 'Панель Управления',
        tools: 'Инструменты',
        users: 'Пользователи',
        analytics: 'Аналитика',
        settings: 'Настройки',
      },
      dashboard: {
        title: 'Панель Управления Администратора',
      },
    },
  },
  tw: {
    admin: {
      title: '管理後台',
      backToSite: '返回網站',
      nav: {
        dashboard: '儀表板',
        tools: '工具管理',
        users: '用戶管理',
        analytics: '數據分析',
        settings: '設置',
      },
      dashboard: {
        title: '管理儀表板',
      },
    },
  },
};

/**
 * Deep merge objects
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Update translation file with missing content
 */
function updateTranslationFile(locale: string): void {
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${locale}.json`);
    return;
  }

  try {
    // Read existing content
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Get updates for this locale
    const updates = adminTranslations[locale];
    if (!updates) {
      console.log(`ℹ️  No updates defined for ${locale}`);
      return;
    }

    // Merge updates
    const updatedContent = deepMerge(content, updates);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2) + '\n', 'utf-8');

    console.log(`✅ Updated ${locale}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${locale}.json:`, error);
  }
}

/**
 * Main function
 */
function fixMissingTranslations(): void {
  console.log('🔧 Fixing Missing Translations\n');
  console.log('='.repeat(60));

  const locales = Object.keys(adminTranslations);
  console.log(`\n📝 Updating ${locales.length} locale files...\n`);

  for (const locale of locales) {
    updateTranslationFile(locale);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Translation updates complete!\n');
  console.log('Run the audit script again to verify:');
  console.log('  npx tsx scripts/verify-language-content.ts');
}

// Run the fix
fixMissingTranslations();
