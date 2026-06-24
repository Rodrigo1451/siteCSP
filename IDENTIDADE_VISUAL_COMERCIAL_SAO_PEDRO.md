# Comercial São Pedro — Guia de Identidade Visual & Design System

> Documento de referência para construção do novo site.
> Cores extraídas dos pixels reais dos prints do site atual (`www.comercialsaopedro.com.br`).
> Estruturado para ser lido pelo **Claude Code** como fonte de verdade de design.

---

## 0. Como usar este arquivo (instruções p/ o agente)

- Trate a seção **2 (Tokens)** como a única fonte de verdade de cores. Não invente hex fora dessa lista.
- Use os tokens via CSS custom properties (`var(--...)`) ou via a config Tailwind da seção **8**. Não escreva hex "soltos" no JSX/HTML.
- Antes de criar qualquer componente, leia a seção **6 (Componentes)** — os specs de botão, formulário, card e header/footer já estão definidos.
- A seção **1.3 (Diagnóstico)** lista os problemas do site atual. **Não replique** esses erros no site novo.
- Stack-alvo sugerida: HTML + Tailwind (estático) ou Next.js + Tailwind. Tudo aqui funciona nos dois.

---

## 1. A marca

### 1.1 O que é a empresa
Distribuidora de **materiais técnicos para construção civil** em Jundiaí–SP. Origem na Impercom (atuante em impermeabilização desde 1988); a marca **Comercial São Pedro** nasce em 2001. Posicionamento: fornecedor técnico, com orientação especializada na venda (não é varejo de balcão genérico — é o cara que te explica qual produto usar na obra).

**Linhas de produto** (viram categorias/menu no site): Mantas Asfálticas, Cura Química, Argamassas Especiais, Revestimento de Piso, Endurecedor de Superfície / Agente de Cura, Telhados e Calhas, Selantes/Mástiques/Vedantes, Inibidores de Corrosão, Primers, Adesivos para Argamassas, Juntas de Dilatação, Impermeabilizantes, Grautes, Drenagem, Desmoldantes, Asfaltos Modificados, Aditivos, Adesivos base Epóxi.

**Marca-âncora parceira:** Vedacit (impermeabilizantes) — aparece em destaque e no carrossel. Tratar como "marca representada", não como a marca da loja.

### 1.2 Personalidade da marca
- **Técnica e confiável** — vende solução de engenharia, não enfeite.
- **Regional e próxima** — "Podemos te ajudar em tudo, é só ligar."
- **Robusta / obra pesada** — público é construtor, mestre de obras, engenheiro, aplicador.
- Tem um **mascote**: senhor de uniforme/jaleco branco, capacete amarelo, bigode branco (figura "Seu Pedro" — o especialista veterano). É um ativo de marca forte e deve ser mantido/redesenhado, não descartado.

### 1.3 Diagnóstico do site atual (o que NÃO repetir)
Sendo direto:

1. **Newsletter com texto Lorem Ipsum em produção.** Erro grave de credibilidade. O bloco "Receba as nossas newsletter... Lorem ipsum dolor sit amet" está publicado. No site novo: copy real ou remove o bloco.
2. **Footer e CTA duplicados/repetidos** em quase toda página ("Podemos te ajudar em tudo" aparece 2x na home). Consolidar em um footer único.
3. **Página de produtos sem preço, sem filtro, sem busca, sem CTA claro.** É um catálogo de imagens soltas. Falta: filtro por categoria, busca, e um botão de ação por produto (Solicitar orçamento / WhatsApp).
4. **Carrossel de marca só com a Vedacit** ocupando tela inteira — parece banner solto. Virar uma faixa "Marcas que representamos" com vários logos.
5. **Hierarquia tipográfica fraca** — títulos em itálico fino ("Nossa Empresa", "Soluções") destoam do peso da marca.
6. **Sem WhatsApp clicável de verdade** apesar do ícone. O público liga/zap — isso tem que ser o CTA primário, fixo e flutuante.
7. **Rodapé "© 2020"** — datado. Tornar dinâmico.
8. Layout só visto em mobile aqui, mas precisa ser **mobile-first de verdade** (público acessa da obra, do celular).

---

## 2. Tokens de cor (fonte de verdade)

Cores extraídas via amostragem de pixel dos prints. Os hex `*-500/700` são os **reais** do site; os demais degraus são escala tonal derivada para dar flexibilidade de UI.

### 2.1 Cores de marca

| Token | Hex | RGB | Papel |
|---|---|---|---|
| **brand.gold (PRIMÁRIA)** | `#FCD230` | `252, 210, 48` | Cor-assinatura. Header, botões, faixas CTA, destaques. |
| **brand.maroon (SECUNDÁRIA)** | `#44110D` | `68, 17, 13` | Vinho/marrom escuro. Barra de topo, logotipo, títulos, texto sobre amarelo. |

> O par **amarelo-ouro + vinho escuro** é a identidade. Quase todo o site vive nesse contraste. Mantê-lo.

### 2.2 Escala — Gold (amarelo/ouro)
| Token | Hex | Uso |
|---|---|---|
| `gold-50`  | `#FFFBEE` | Fundos sutis, hover de itens claros |
| `gold-100` | `#FEF6D6` | Badges, realces suaves |
| `gold-200` | `#FEEBA2` | Bordas/realce |
| `gold-300` | `#FDE06E` | — |
| `gold-400` | `#FCD749` | Hover de superfícies amarelas |
| **`gold-500`** | **`#FCD230`** | **Cor de marca (default).** Header, banners, botões primários |
| `gold-600` | `#D9B529` | **Hover/active** de botão primário; links em cima de fundo claro |
| `gold-700` | `#B09322` | Pressed, bordas escuras de elemento dourado |
| `gold-800` | `#836D19` | — |

### 2.3 Escala — Maroon (vinho/marrom)
| Token | Hex | Uso |
|---|---|---|
| `maroon-50`  | `#ECE7E7` | — |
| `maroon-100` | `#D0C4C2` | — |
| `maroon-300` | `#987C7A` | Texto desabilitado sobre claro |
| `maroon-500` | `#572925` | Variante mais quente |
| **`maroon-700`** | **`#44110D`** | **Cor secundária (default).** Topbar, títulos, texto sobre amarelo |
| `maroon-900` | `#330D0A` | Hover de elementos vinho, sombras |

### 2.4 Neutros
| Token | Hex | RGB | Uso |
|---|---|---|---|
| `white`    | `#FFFFFF` | `255,255,255` | Fundo base, cards |
| `gray-50`  | `#F7F7F7` | — | Fundo de seção alternada (claro) |
| `gray-100` | `#EFEFEF` | `239,239,239` | **Fundo de seção real do site.** Blocos intercalados |
| `gray-200` | `#E0E0E0` | — | Bordas, divisórias, inputs |
| `gray-400` | `#9A9A9A` | — | Placeholder, texto auxiliar |
| `gray-700` | `#545454` | `84,84,84` | Texto secundário |
| **`ink`**  | `#333333` | `51,51,51` | **Texto de corpo (default).** |
| `black`    | `#1A1A1A` | — | Faixas escuras ("Principais Notícias"), máx. contraste |

### 2.5 Semânticos (UI)
| Token | Hex | Uso |
|---|---|---|
| `success` | `#1E8E3E` | Confirmação de formulário |
| `error`   | `#C5221F` | Erro de validação |
| `warning` | `#E6A817` | Avisos (deriva do dourado) |
| `info`    | `#1A73E8` | Links informativos neutros |
| `whatsapp`| `#25D366` | Botão/ícone WhatsApp |

---

## 3. Tokens semânticos (mapeamento para a UI)

Use **estes** nos componentes — assim o tema fica trocável.

| Semântico | Aponta para | Observação |
|---|---|---|
| `--color-bg` | `white` | Fundo da página |
| `--color-bg-subtle` | `gray-100` | Seções alternadas |
| `--color-bg-inverse` | `maroon-700` | Faixas/topbar escura |
| `--color-text` | `ink` (`#333333`) | Corpo |
| `--color-text-muted` | `gray-700` | Auxiliar |
| `--color-text-on-brand` | `maroon-700` | Texto SOBRE amarelo |
| `--color-text-inverse` | `white` | Texto sobre vinho/escuro |
| `--color-primary` | `gold-500` | Ação primária / marca |
| `--color-primary-hover` | `gold-600` | — |
| `--color-on-primary` | `maroon-700` | **Texto de botão primário = vinho, NÃO branco** |
| `--color-secondary` | `maroon-700` | Botão secundário, header de seção |
| `--color-link` | `maroon-700` | Links em corpo |
| `--color-link-hover` | `gold-600` | — |
| `--color-border` | `gray-200` | Inputs, cards, divisórias |

> **Regra de contraste crítica:** texto sobre o amarelo `#FCD230` deve ser o vinho `#44110D` (alto contraste, on-brand). **Nunca** branco sobre amarelo (ilegível) e evite preto puro.

---

## 4. Tipografia

O site atual usa fontes genéricas e títulos em itálico fino — ponto fraco. Recomendação para o site novo (Google Fonts, gratuitas, com peso "de obra"):

| Papel | Fonte | Pesos | Fallback |
|---|---|---|---|
| **Títulos / display** | `Archivo` (ou `Saira Condensed` p/ pegada industrial) | 700, 800, 900 | `system-ui, sans-serif` |
| **Corpo / UI** | `Inter` | 400, 500, 600, 700 | `system-ui, sans-serif` |
| **Números/dados** (opcional) | `Inter` tabular-nums | — | — |

> Se quiser ecoar o logotipo (que é uma display itálica robusta), use `Archivo` em peso 800/900 nos H1/H2 — passa solidez sem o itálico fininho atual.

### Escala tipográfica (mobile-first, rem)
| Nível | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| Display | `2.5rem` (40px) | 800 | 1.1 | Hero |
| H1 | `2rem` (32px) | 800 | 1.15 | Título de página |
| H2 | `1.5rem` (24px) | 700 | 1.2 | Seção |
| H3 | `1.25rem` (20px) | 700 | 1.25 | Subseção / card title |
| Body-lg | `1.125rem` (18px) | 400 | 1.6 | Lead |
| Body | `1rem` (16px) | 400 | 1.6 | Texto padrão |
| Small | `0.875rem` (14px) | 400 | 1.5 | Auxiliar, legendas |
| Caption | `0.75rem` (12px) | 500 | 1.4 | Footer fino, copyright |

Títulos de seção: considerar **CAIXA ALTA** com `letter-spacing: 0.02em` — combina com "MISSÃO / VISÃO / VALORES / DESTAQUES" do site atual (esse padrão funciona, manter).

---

## 5. Layout, espaçamento e grid

- **Mobile-first.** Breakpoints Tailwind padrão (`sm 640 / md 768 / lg 1024 / xl 1280`).
- **Container:** máx. `1200px`, padding lateral `1rem` (mobile) → `2rem` (desktop).
- **Escala de espaçamento (8px base):** `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- **Seções alternadas:** branco → `gray-100` → branco, para ritmo (padrão já usado no site).
- **Raio de borda:** `radius-sm 6px`, `radius-md 10px` (cards/inputs), `radius-lg 16px`, `radius-full 9999px` (botão pílula/flutuante).
- **Sombras:**
  - `shadow-sm`: `0 1px 2px rgba(0,0,0,.06)`
  - `shadow-md`: `0 4px 12px rgba(0,0,0,.08)` (cards de produto)
  - `shadow-cta`: `0 6px 20px rgba(252,210,48,.35)` (botão primário em destaque)

---

## 6. Componentes (specs)

### 6.1 Topbar (faixa fina superior)
- Fundo `maroon-700` (`#44110D`), texto `white`.
- Conteúdo: endereço (📍 Av. Pref. Luis Latorre, 4097 | Jundiaí–SP) à esquerda; ícones sociais (Facebook, Instagram, WhatsApp) à direita.
- Altura ~`36px`. Some no scroll em mobile (opcional).

### 6.2 Header / navegação
- Fundo `gold-500` (`#FCD230`).
- Logo à esquerda (versão vinho do logotipo). Menu hambúrguer à direita em mobile (`maroon-700`).
- Itens de menu: `maroon-700`, peso 600. Hover: sublinhado ou `maroon-900`.
- Header sticky no scroll com leve `shadow-md`.
- Menu sugerido: **Home · Produtos · Soluções · Quem Somos · Notícias · Contato** + botão **Orçamento no WhatsApp** destacado.

### 6.3 Botões
| Variante | Fundo | Texto | Borda | Hover |
|---|---|---|---|---|
| **Primary** | `gold-500` | `maroon-700` | nenhuma | fundo `gold-600` |
| **Secondary** | `maroon-700` | `white` | nenhuma | fundo `maroon-900` |
| **Outline** | transparente | `maroon-700` | 1.5px `maroon-700` | fundo `gold-50` |
| **WhatsApp** | `whatsapp` `#25D366` | `white` | nenhuma | escurece 8% |

- Padding: `12px 24px`. Raio: `radius-md` (ou `radius-full` p/ CTA principal). Peso 600/700.
- Transição: `all .2s ease`. Em foco: `outline: 2px solid maroon-700`.

### 6.4 Card de produto (corrigindo a página atual)
Estrutura: imagem (fundo branco, `object-fit: contain`, raio `radius-md`) → nome do produto (`H3`, `maroon-700`) → categoria (small, `gray-700`) → **botão "Solicitar orçamento"** (primary) ou "Falar no WhatsApp".
- Card: fundo `white`, `border 1px gray-200`, `shadow-md` no hover, `radius-md`.
- Grid: 1 col (mobile) → 2 (sm) → 3–4 (lg).
- **Adicionar no topo:** busca + filtro por categoria (chips). É o maior gap do site atual.

### 6.5 Formulário (Contato / Newsletter)
- Input: fundo `white`, borda `1px gray-200`, raio `radius-md`, padding `12px 14px`, texto `ink`, placeholder `gray-400`.
- Foco: borda `maroon-700` + ring sutil.
- Label: `small`, peso 600, `maroon-700`.
- Erro: borda `error`, mensagem em `error`.
- Botão enviar: **Primary**.
- Campos contato: Nome*, Email*, Telefone*, Cidade*, Mensagem*.
- **Newsletter:** copy real (ex.: "Receba dicas técnicas e novidades de produtos no seu e-mail."). **Zero Lorem Ipsum.**

### 6.6 Footer CTA ("Podemos te ajudar")
- Fundo `gold-500`, mascote à esquerda, texto vinho.
- Blocos: 📍 endereço · 🕐 horário (Seg–Sex 7:30–17:30 / Sáb 7:30–12:00) · 📞 (11) 4522-2929 e (11) 97394-7185 · ícones sociais.
- Telefones e WhatsApp **clicáveis** (`tel:` / `https://wa.me/`).
- Copyright dinâmico: `© {ano atual} Comercial São Pedro. Todos os direitos reservados.`
- **Um footer só** por página.

### 6.7 WhatsApp flutuante (novo, recomendado)
- Botão fixo canto inferior direito, `radius-full`, fundo `whatsapp`, ícone branco, `shadow-cta`.
- Link: `https://wa.me/5511973947185?text=Olá! Vim pelo site e quero um orçamento.`

### 6.8 Faixa "Marcas que representamos"
- Substitui o carrossel só-Vedacit. Faixa `gray-100`, grid de logos em escala de cinza que coloriza no hover.

---

## 7. Iconografia & imagens

- **Ícones de UI:** Lucide (`lucide-react`) ou Phosphor — traço, peso médio, cor `maroon-700`.
- **Sociais:** Facebook, Instagram, WhatsApp (manter os 3 do site).
- **Mascote "Seu Pedro":** ativo de marca. Usar em footer, página "Quem Somos" e estados vazios (ex.: "Nenhum produto encontrado"). Vale um redesenho vetorial limpo no futuro.
- **Imagens de produto:** sempre fundo branco, recortadas, padronizadas em proporção (recomendo `1:1`).
- **Banner "Soluções para sua Obra":** ilustração de casa em corte com pontos numerados (hotspots) → ótimo recurso interativo, manter como página/feature.
- Estilo fotográfico: obra real, materiais, aplicação. Quente, luz de dia.

---

## 8. Implementação — copiar e colar

### 8.1 CSS custom properties (`:root`)
```css
:root {
  /* Marca */
  --gold-50:#FFFBEE; --gold-100:#FEF6D6; --gold-200:#FEEBA2; --gold-300:#FDE06E;
  --gold-400:#FCD749; --gold-500:#FCD230; --gold-600:#D9B529; --gold-700:#B09322; --gold-800:#836D19;
  --maroon-50:#ECE7E7; --maroon-100:#D0C4C2; --maroon-300:#987C7A;
  --maroon-500:#572925; --maroon-700:#44110D; --maroon-900:#330D0A;

  /* Neutros */
  --white:#FFFFFF; --gray-50:#F7F7F7; --gray-100:#EFEFEF; --gray-200:#E0E0E0;
  --gray-400:#9A9A9A; --gray-700:#545454; --ink:#333333; --black:#1A1A1A;

  /* Semânticos UI */
  --success:#1E8E3E; --error:#C5221F; --warning:#E6A817; --info:#1A73E8; --whatsapp:#25D366;

  /* Mapeamento de papel */
  --color-bg:var(--white);
  --color-bg-subtle:var(--gray-100);
  --color-bg-inverse:var(--maroon-700);
  --color-text:var(--ink);
  --color-text-muted:var(--gray-700);
  --color-text-on-brand:var(--maroon-700);
  --color-text-inverse:var(--white);
  --color-primary:var(--gold-500);
  --color-primary-hover:var(--gold-600);
  --color-on-primary:var(--maroon-700);
  --color-secondary:var(--maroon-700);
  --color-link:var(--maroon-700);
  --color-link-hover:var(--gold-600);
  --color-border:var(--gray-200);

  /* Raio / sombra */
  --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-full:9999px;
  --shadow-sm:0 1px 2px rgba(0,0,0,.06);
  --shadow-md:0 4px 12px rgba(0,0,0,.08);
  --shadow-cta:0 6px 20px rgba(252,210,48,.35);
}
```

### 8.2 Tailwind config (`tailwind.config.js`)
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        gold:   { 50:"#FFFBEE",100:"#FEF6D6",200:"#FEEBA2",300:"#FDE06E",
                  400:"#FCD749",500:"#FCD230",600:"#D9B529",700:"#B09322",800:"#836D19" },
        maroon: { 50:"#ECE7E7",100:"#D0C4C2",300:"#987C7A",
                  500:"#572925",700:"#44110D",900:"#330D0A" },
        ink:"#333333",
        whatsapp:"#25D366",
        // semânticos
        primary:"#FCD230", secondary:"#44110D",
      },
      fontFamily: {
        display:["Archivo","system-ui","sans-serif"],
        sans:["Inter","system-ui","sans-serif"],
      },
      borderRadius:{ sm:"6px", md:"10px", lg:"16px" },
      boxShadow:{
        card:"0 4px 12px rgba(0,0,0,.08)",
        cta:"0 6px 20px rgba(252,210,48,.35)",
      },
      maxWidth:{ container:"1200px" },
    },
  },
  plugins: [],
};
```

### 8.3 Classes utilitárias de botão (exemplo)
```html
<!-- Primário -->
<button class="bg-gold-500 hover:bg-gold-600 text-maroon-700 font-semibold
               px-6 py-3 rounded-[10px] transition-colors shadow-cta">
  Solicitar orçamento
</button>

<!-- WhatsApp -->
<a href="https://wa.me/5511973947185"
   class="bg-whatsapp hover:brightness-95 text-white font-semibold
          px-6 py-3 rounded-full inline-flex items-center gap-2">
  Falar no WhatsApp
</a>
```

### 8.4 Import de fontes
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 9. Acessibilidade & contraste

- `maroon-700` sobre `gold-500`: **contraste ~6.9:1** → AA ok p/ texto normal.
- `ink (#333)` sobre `white`: **~12.6:1** → AAA.
- `white` sobre `maroon-700`: **~15:1** → AAA.
- **Não usar** texto `gray-400` sobre branco para conteúdo importante (baixo contraste).
- Foco visível obrigatório em todos os interativos (`outline 2px maroon-700`).
- Alvos de toque ≥ `44×44px` (público mobile, mão de obra na rua).

---

## 10. Tom de voz (conteúdo)

- **Direto, técnico, confiável.** Fala com profissional de obra.
- Frases de ação: "Solicite seu orçamento", "Fale com um especialista".
- Reforçar diferencial: **orientação técnica na venda** + linhas de produto completas.
- Evitar texto de preenchimento. **Nada de Lorem Ipsum.**

---

## 11. Checklist do site novo

- [ ] Header sticky amarelo + logo vinho + WhatsApp em destaque
- [ ] WhatsApp flutuante fixo
- [ ] Produtos com busca + filtro por categoria + CTA por item
- [ ] Telefones e e-mail clicáveis (`tel:` / `mailto:` / `wa.me`)
- [ ] Newsletter com copy real (ou removida)
- [ ] Footer único, copyright dinâmico
- [ ] Faixa "Marcas que representamos" (não só Vedacit)
- [ ] Página "Soluções" com hotspots interativos
- [ ] Mascote presente em Quem Somos / footer / estados vazios
- [ ] Mobile-first, alvos de toque ≥44px, foco visível
- [ ] Meta tags / OG / favicon com o amarelo da marca

---

### Apêndice — Resumo cromático rápido
```
PRIMÁRIA   Amarelo-ouro  #FCD230   (header, botões, CTA)
SECUNDÁRIA Vinho escuro  #44110D   (topbar, logo, títulos, texto sobre amarelo)
TEXTO      Cinza ink     #333333
SEÇÃO      Cinza claro   #EFEFEF
BASE       Branco        #FFFFFF
APOIO      WhatsApp      #25D366
```
*Regra de ouro: amarelo + vinho é a marca. Texto sobre amarelo = vinho, nunca branco.*
