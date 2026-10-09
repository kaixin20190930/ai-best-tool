import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { buildLocalizedPageMetadata, generateLocalizedPath } from '@/lib/seo/metadata';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';

const copy = {
  en: {
    title: 'OpenAI: company, products, and developer platform',
    description:
      'Find the right OpenAI destination: ChatGPT for an AI assistant, Codex for coding work, the API platform for building, or company information.',
    home: 'Home',
    eyebrow: 'Company and platform',
    heading: 'Find the right OpenAI destination',
    intro:
      'OpenAI is an AI research and deployment company. Its name covers several products and a developer platform, each with a different purpose.',
    products: 'Products and platform',
    choose: 'Choose the destination that matches your task.',
    chatgpt: 'An AI assistant for everyday tasks such as writing, studying, planning, and analysis.',
    codex: 'A coding agent for engineering work, including building, reviewing, and changing code.',
    api: 'Documentation for developers building applications with OpenAI models and APIs.',
    company: 'About the company',
    companyText: 'Read OpenAI’s description of its mission, research, and organization.',
    internal: 'Our product guide',
    official: 'Official destination',
    sources: 'Official sources',
    checked: 'Links and descriptions checked October 9, 2026.',
    boundary:
      'The company name is not one AI tool. Product features, access, and pricing should be checked at each official destination.',
  },
  cn: {
    title: 'OpenAI：公司、产品与开发者平台',
    description: '按需求找到 OpenAI 入口：ChatGPT 助手、Codex 编程智能体、API 开发平台及公司信息。',
    home: '首页',
    eyebrow: '公司与平台',
    heading: '找到合适的 OpenAI 入口',
    intro: 'OpenAI 是一家人工智能研究与部署公司。这个名称涵盖不同产品和开发者平台，各自服务于不同任务。',
    products: '产品与平台',
    choose: '根据你的任务选择入口。',
    chatgpt: '用于写作、学习、规划、分析等日常任务的 AI 助手。',
    codex: '用于构建、审查和修改代码等工程工作的编程智能体。',
    api: '面向使用 OpenAI 模型和 API 构建应用的开发者文档。',
    company: '了解公司',
    companyText: '阅读 OpenAI 对其使命、研究和组织的官方介绍。',
    internal: '本站产品指南',
    official: '官方入口',
    sources: '官方资料',
    checked: '链接与描述核查于 2026 年 10 月 9 日。',
    boundary: '公司名称不等于单一 AI 工具。具体功能、使用资格和价格请以各产品的官方页面为准。',
  },
  tw: {
    title: 'OpenAI：公司、產品與開發者平台',
    description: '按需求找到 OpenAI 入口：ChatGPT 助理、Codex 程式代理、API 開發平台及公司資訊。',
    home: '首頁',
    eyebrow: '公司與平台',
    heading: '找到合適的 OpenAI 入口',
    intro: 'OpenAI 是一家人工智慧研究與部署公司。這個名稱涵蓋不同產品與開發者平台，各自服務於不同任務。',
    products: '產品與平台',
    choose: '根據你的任務選擇入口。',
    chatgpt: '用於寫作、學習、規劃與分析等日常任務的 AI 助理。',
    codex: '用於建構、審查及修改程式碼等工程工作的程式代理。',
    api: '面向使用 OpenAI 模型和 API 建構應用的開發者文件。',
    company: '了解公司',
    companyText: '閱讀 OpenAI 對其使命、研究及組織的官方介紹。',
    internal: '本站產品指南',
    official: '官方入口',
    sources: '官方資料',
    checked: '連結與描述查核於 2026 年 10 月 9 日。',
    boundary: '公司名稱不等於單一 AI 工具。具體功能、使用資格和價格請以各產品官方頁面為準。',
  },
  jp: {
    title: 'OpenAI：企業、製品、開発者向けプラットフォーム',
    description: 'ChatGPT、Codex、API プラットフォーム、OpenAI の企業情報への入口を確認できます。',
    home: 'ホーム',
    eyebrow: '企業とプラットフォーム',
    heading: '目的に合う OpenAI の入口を探す',
    intro:
      'OpenAI は AI の研究と展開を行う企業です。その名称には、用途の異なる製品と開発者向けプラットフォームが含まれます。',
    products: '製品とプラットフォーム',
    choose: '目的に合う入口を選んでください。',
    chatgpt: '文章作成、学習、計画、分析などの日常的な作業を支援する AI アシスタント。',
    codex: 'コードの作成、レビュー、変更などの開発作業を支援するコーディングエージェント。',
    api: 'OpenAI のモデルと API を使ってアプリを構築する開発者向けドキュメント。',
    company: '企業情報',
    companyText: 'OpenAI の使命、研究、組織についての公式情報。',
    internal: '当サイトの製品ガイド',
    official: '公式サイト',
    sources: '公式資料',
    checked: 'リンクと説明の確認日：2026 年 10 月 9 日。',
    boundary: '企業名は単一の AI ツールを意味しません。機能、利用条件、料金は各公式サイトで確認してください。',
  },
  de: {
    title: 'OpenAI: Unternehmen, Produkte und Entwicklerplattform',
    description: 'Finden Sie ChatGPT, Codex, die OpenAI API-Plattform und Informationen zum Unternehmen.',
    home: 'Startseite',
    eyebrow: 'Unternehmen und Plattform',
    heading: 'Das passende OpenAI-Angebot finden',
    intro:
      'OpenAI ist ein Unternehmen für KI-Forschung und Bereitstellung. Der Name umfasst verschiedene Produkte und eine Entwicklerplattform mit unterschiedlichen Aufgaben.',
    products: 'Produkte und Plattform',
    choose: 'Wählen Sie nach Ihrem Vorhaben.',
    chatgpt: 'Ein KI-Assistent für Schreiben, Lernen, Planen und Analysieren im Alltag.',
    codex: 'Ein Coding-Agent für Softwareentwicklung, Code-Reviews und Änderungen.',
    api: 'Dokumentation für Entwickler, die Anwendungen mit OpenAI-Modellen und APIs erstellen.',
    company: 'Über das Unternehmen',
    companyText: 'Offizielle Informationen zu Mission, Forschung und Organisation von OpenAI.',
    internal: 'Unser Produktleitfaden',
    official: 'Offizielle Seite',
    sources: 'Offizielle Quellen',
    checked: 'Links und Beschreibungen geprüft am 9. Oktober 2026.',
    boundary:
      'Der Unternehmensname bezeichnet kein einzelnes KI-Tool. Funktionen, Zugang und Preise stehen auf den jeweiligen offiziellen Seiten.',
  },
  es: {
    title: 'OpenAI: empresa, productos y plataforma para desarrolladores',
    description: 'Encuentra ChatGPT, Codex, la plataforma API y la información oficial sobre OpenAI.',
    home: 'Inicio',
    eyebrow: 'Empresa y plataforma',
    heading: 'Encuentra el destino adecuado de OpenAI',
    intro:
      'OpenAI es una empresa de investigación e implementación de IA. Su nombre abarca productos y una plataforma para desarrolladores con fines distintos.',
    products: 'Productos y plataforma',
    choose: 'Elige según la tarea que quieras realizar.',
    chatgpt: 'Un asistente de IA para escribir, estudiar, planificar y analizar tareas cotidianas.',
    codex: 'Un agente de programación para crear, revisar y modificar código.',
    api: 'Documentación para crear aplicaciones con los modelos y las API de OpenAI.',
    company: 'Acerca de la empresa',
    companyText: 'Información oficial sobre la misión, la investigación y la organización de OpenAI.',
    internal: 'Nuestra guía del producto',
    official: 'Sitio oficial',
    sources: 'Fuentes oficiales',
    checked: 'Enlaces y descripciones revisados el 9 de octubre de 2026.',
    boundary:
      'El nombre de la empresa no designa una sola herramienta de IA. Comprueba funciones, acceso y precios en cada sitio oficial.',
  },
  fr: {
    title: 'OpenAI : entreprise, produits et plateforme développeur',
    description: 'Trouvez ChatGPT, Codex, la plateforme API et les informations officielles sur OpenAI.',
    home: 'Accueil',
    eyebrow: 'Entreprise et plateforme',
    heading: 'Trouver la bonne destination OpenAI',
    intro:
      'OpenAI est une entreprise de recherche et de déploiement de l’IA. Son nom regroupe plusieurs produits et une plateforme développeur aux usages distincts.',
    products: 'Produits et plateforme',
    choose: 'Choisissez selon votre tâche.',
    chatgpt: 'Un assistant IA pour écrire, étudier, planifier et analyser au quotidien.',
    codex: 'Un agent de programmation pour créer, relire et modifier du code.',
    api: 'La documentation pour créer des applications avec les modèles et API d’OpenAI.',
    company: 'À propos de l’entreprise',
    companyText: 'Informations officielles sur la mission, la recherche et l’organisation d’OpenAI.',
    internal: 'Notre guide du produit',
    official: 'Site officiel',
    sources: 'Sources officielles',
    checked: 'Liens et descriptions vérifiés le 9 octobre 2026.',
    boundary:
      'Le nom de l’entreprise ne désigne pas un seul outil d’IA. Vérifiez les fonctions, l’accès et les tarifs sur chaque site officiel.',
  },
  pt: {
    title: 'OpenAI: empresa, produtos e plataforma para desenvolvedores',
    description: 'Encontre ChatGPT, Codex, a plataforma de API e informações oficiais sobre a OpenAI.',
    home: 'Início',
    eyebrow: 'Empresa e plataforma',
    heading: 'Encontre o destino certo da OpenAI',
    intro:
      'A OpenAI é uma empresa de pesquisa e implantação de IA. Seu nome abrange produtos e uma plataforma para desenvolvedores com finalidades distintas.',
    products: 'Produtos e plataforma',
    choose: 'Escolha conforme a sua tarefa.',
    chatgpt: 'Um assistente de IA para escrever, estudar, planejar e analisar tarefas cotidianas.',
    codex: 'Um agente de programação para criar, revisar e alterar código.',
    api: 'Documentação para criar aplicativos com modelos e APIs da OpenAI.',
    company: 'Sobre a empresa',
    companyText: 'Informações oficiais sobre a missão, a pesquisa e a organização da OpenAI.',
    internal: 'Nosso guia do produto',
    official: 'Site oficial',
    sources: 'Fontes oficiais',
    checked: 'Links e descrições verificados em 9 de outubro de 2026.',
    boundary:
      'O nome da empresa não representa uma única ferramenta de IA. Confira recursos, acesso e preços em cada site oficial.',
  },
  ru: {
    title: 'OpenAI: компания, продукты и платформа для разработчиков',
    description: 'Найдите ChatGPT, Codex, платформу API и официальную информацию о компании OpenAI.',
    home: 'Главная',
    eyebrow: 'Компания и платформа',
    heading: 'Выберите нужное направление OpenAI',
    intro:
      'OpenAI — компания, занимающаяся исследованиями и внедрением ИИ. Ее имя объединяет разные продукты и платформу для разработчиков.',
    products: 'Продукты и платформа',
    choose: 'Выберите направление по своей задаче.',
    chatgpt: 'ИИ-помощник для письма, учебы, планирования и анализа повседневных задач.',
    codex: 'Агент для разработки, проверки и изменения кода.',
    api: 'Документация для создания приложений с моделями и API OpenAI.',
    company: 'О компании',
    companyText: 'Официальная информация о миссии, исследованиях и структуре OpenAI.',
    internal: 'Наш обзор продукта',
    official: 'Официальный сайт',
    sources: 'Официальные источники',
    checked: 'Ссылки и описания проверены 9 октября 2026 года.',
    boundary:
      'Название компании не обозначает один инструмент ИИ. Возможности, доступ и цены уточняйте на официальных страницах продуктов.',
  },
} as const;

const openAiBrandPath = '/brands/openai';

function getOpenAiBrandCopy(locale: string) {
  return copy[locale as keyof typeof copy] || copy.en;
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const content = getOpenAiBrandCopy(locale);
  return buildLocalizedPageMetadata({
    locale,
    path: openAiBrandPath,
    title: content.title,
    description: content.description,
    indexable: false,
  });
}

export default function OpenAiBrandPage({ params: { locale } }: { params: { locale: string } }) {
  const content = getOpenAiBrandCopy(locale);
  const products = [
    { name: 'ChatGPT', description: content.chatgpt, guide: '/ai/chatgpt', official: 'https://chatgpt.com/' },
    { name: 'Codex', description: content.codex, guide: '/ai/codex', official: 'https://openai.com/codex/' },
    { name: 'OpenAI API', description: content.api, official: 'https://developers.openai.com/api/docs' },
  ];

  return (
    <main className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <SeoBreadcrumbs
        locale={locale}
        items={[
          { name: content.home, path: '/' },
          { name: 'OpenAI', path: openAiBrandPath },
        ]}
        className='mb-5'
      />
      <header className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
        <p className='text-sm font-semibold uppercase tracking-wider text-cyan-700'>{content.eyebrow}</p>
        <h1 className='mt-2 text-3xl font-bold text-slate-950 lg:text-5xl'>{content.heading}</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600'>{content.intro}</p>
        <p className='mt-4 max-w-3xl rounded-xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-950'>{content.boundary}</p>
      </header>

      <section aria-labelledby='openai-products' className='mt-8'>
        <h2 id='openai-products' className='text-2xl font-bold text-slate-950'>
          {content.products}
        </h2>
        <p className='mt-2 text-slate-600'>{content.choose}</p>
        <div className='mt-4 grid gap-4 md:grid-cols-3'>
          {products.map((product) => (
            <article key={product.name} className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
              <h3 className='text-xl font-semibold text-slate-950'>{product.name}</h3>
              <p className='mt-3 min-h-24 text-sm leading-6 text-slate-600'>{product.description}</p>
              <div className='mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-cyan-800'>
                {product.guide && (
                  <Link href={generateLocalizedPath(product.guide, locale)} className='underline underline-offset-2'>
                    {content.internal}
                  </Link>
                )}
                <a
                  href={product.official}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 underline underline-offset-2'
                >
                  {content.official}
                  <ArrowUpRight aria-hidden='true' className='size-4' />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby='openai-company' className='mt-8 rounded-xl border border-slate-200 bg-white p-6'>
        <h2 id='openai-company' className='text-2xl font-bold text-slate-950'>
          {content.company}
        </h2>
        <p className='mt-3 text-sm leading-6 text-slate-600'>{content.companyText}</p>
        <a
          href='https://openai.com/about/'
          target='_blank'
          rel='noopener noreferrer'
          className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-800 underline underline-offset-2'
        >
          {content.official}
          <ArrowUpRight aria-hidden='true' className='size-4' />
        </a>
      </section>
      <footer className='mt-6 text-xs leading-6 text-slate-500'>
        <p>{content.checked}</p>
        <p>
          {content.sources}:{' '}
          <a href='https://openai.com/about/' className='underline'>
            OpenAI About
          </a>{' '}
          ·{' '}
          <a href='https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq' className='underline'>
            ChatGPT FAQ
          </a>{' '}
          ·{' '}
          <a href='https://openai.com/codex/' className='underline'>
            Codex
          </a>{' '}
          ·{' '}
          <a href='https://developers.openai.com/api/docs' className='underline'>
            API docs
          </a>
        </p>
      </footer>
    </main>
  );
}
