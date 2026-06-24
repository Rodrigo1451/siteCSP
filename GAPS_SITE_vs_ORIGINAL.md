# Plano: Gaps do Site vs. Site Original

## Context

Comparação feita entre o site em produção (`www.comercialsaopedro.com.br`) e o site que estamos desenvolvendo (`D:/siteCSP`). O objetivo é identificar o que falta, o que está melhor no nosso site, e o que precisa ser adicionado/corrigido.

---

## Resumo da Comparação

### ✅ O que nosso site já tem (e é MELHOR que o original)

| Recurso | Original | Nosso Site |
|---|---|---|
| Design visual | Datado, sem hierarquia | Premium, premium, animado |
| Imagens na listagem de produtos | ❌ Só o nome | ✅ Cards com imagem |
| Busca de produtos | ❌ Não tem | ✅ Input + chips de filtro |
| Páginas de detalhe de produto | ❌ Mínimas | ✅ 70 páginas completas |
| WhatsApp integrado | ❌ Ícone sem link real | ✅ Float fixo + CTAs |
| Páginas de marcas | ❌ Não tem | ✅ 9 páginas dedicadas |
| Mapa de soluções interativo | ✅ Tem | ✅ Tem (com 20 hotspots) |
| Mobile-first | ❌ Incompleto | ✅ Totalmente responsivo |
| Animações / scroll reveal | ❌ Nenhuma | ✅ Completas |
| Mascote "Seu Pedro" | ✅ Tem | ✅ Tem, melhor posicionado |

---

## ❌ O que FALTA no nosso site (gaps identificados)

### 1. Categorias ausentes nos filtros de produtos

O site original tem **21 categorias**. Nossa página `produtos.html` tem algumas faltando nos chips de filtro:

- **Grautes** (existe hotspot no mapa interativo mas não como filtro)
- **Endurecedor de Superfície / Agente de Cura** (idem)
- **Telhados e Calhas** (pode estar faltando como chip)

**Arquivo:** `produtos.html` — seção de chips `.filtros-bar` e `.chip`

---

### 2. Volume de produtos menor que o original

O original tem **~108 produtos** (9 páginas × 12 por página). Nosso catálogo tem **~70 produtos** em `produtos.html`. Faltam aproximadamente **38 produtos** para cobrir o catálogo completo. A referência dos produtos faltantes está em `paginasProdutos.md` (URLs das 9 páginas do sistema legado).

**Arquivo:** `produtos.html`, pasta `/produtos/`

---

### 3. Seção Newsletter ausente ou sem copy real

O original tem um bloco de newsletter em várias páginas. O documento `IDENTIDADE_VISUAL_COMERCIAL_SAO_PEDRO.md` alerta que o original tinha **Lorem Ipsum** na newsletter — um erro grave. Nosso site não tem newsletter implementada nas páginas (a não ser fragmentos incompletos).

**Ação:** Implementar newsletter com copy real em `index.html`, `noticias.html`:
> "Receba dicas técnicas e novidades de produtos no seu e-mail."

**Arquivo:** `index.html` (antes do footer), `noticias.html`

---

### 4. E-mail de contato ausente

O site original não exibe e-mail, mas o nosso também não. A página de contato (`contato.html`) tem telefone e WhatsApp mas **nenhum endereço de e-mail**. Precisamos confirmar com o cliente ou deixar o campo sem e-mail se ele não quiser.

**Status:** A confirmar com o cliente.

---

### 5. Páginas de marcas ausentes para 5 marcas

Temos 9 páginas em `/marcas/`, mas **5 marcas do grid não têm página dedicada**:
- ITW
- Fibratex
- Novoflex
- Branyl
- CB-PAV

Essas marcas aparecem no grid do index mas são `<div>` (sem link), enquanto as com página são `<a>`.

**Arquivo:** `index.html` (logo grid), criar `/marcas/marca-itw.html`, etc.

---

### 6. Notícias sem conteúdo real / datas

O site original tem apenas 2 artigos com conteúdo real. Nosso `noticias.html` tem artigos placeholder. Os dois artigos reais do original são:

1. **"Recuperação e reforço de estruturas foi o tema da palestra..."** — palestra para colaboradores e clientes da CSP, ocorreu em 28 de junho.
2. **"Comercial São Pedro estará presente na 8ª FEICCAD..."** — 8ª Feira do Imóvel, Construção, Condomínios, Arquitetura e Decoração.

**Arquivo:** `noticias.html` — substituir artigos placeholder pelo conteúdo real

---

### 7. Meta tags OG / SEO incompletas

O `index.html` não tem tags Open Graph (`og:image`, `og:title`, `og:description`). O original provavelmente tem. Importante para compartilhamento em redes sociais.

**Arquivo:** `<head>` de todos os HTMLs principais

---

### 8. Mapa do Google ausente na página de Contato

A página de contato do original não tinha mapa embed visível, e a nossa `contato.html` também não tem. Seria um diferencial útil. **Item opcional** — depende da decisão do cliente.

---

## Prioridade de Implementação

| # | Item | Impacto | Esforço |
|---|---|---|---|
| 1 | Notícias com conteúdo real | Alto | Baixo |
| 2 | Categorias faltando nos filtros | Alto | Baixo |
| 3 | Newsletter com copy real | Médio | Baixo |
| 4 | Meta OG tags | Médio | Baixo |
| 5 | Páginas das 5 marcas sem página | Médio | Médio |
| 6 | +38 produtos no catálogo | Alto | Alto |
| 7 | E-mail de contato | Baixo | Baixo |
| 8 | Mapa Google no contato | Baixo | Médio |

---

## Arquivos a Modificar

- `index.html` — newsletter section, links de marcas sem página (tornar divs em links ou remover href)
- `noticias.html` — conteúdo real dos 2 artigos do original
- `contato.html` — e-mail (se disponível), mapa (opcional)
- `produtos.html` — adicionar chips Grautes, Endurecedor de Superfície, Telhados e Calhas
- Todos os `<head>` — meta OG tags
- Criar `/marcas/marca-itw.html`, `marca-fibratex.html`, `marca-novoflex.html`, `marca-branyl.html`, `marca-cb-pav.html`
- Criar produtos faltantes em `/produtos/` (precisa de levantamento completo)

---

## Verificação

Após as correções:
1. Abrir `produtos.html` e verificar que todos os chips de categoria aparecem e filtram corretamente
2. Abrir `noticias.html` e confirmar que os 2 artigos reais estão no lugar dos placeholders
3. Verificar meta tags com `curl -s https://... | grep og:` ou inspecionar `<head>`
4. Testar links das marcas no grid do index — devem abrir as páginas dedicadas
