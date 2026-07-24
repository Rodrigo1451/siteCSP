# Prompt para a próxima sessão

Copie tudo abaixo da linha divisória e cole como primeira mensagem numa
**sessão nova**.

Antes de colar, se quiser reduzir bastante o custo: rode a sessão com o
GateGuard desligado. Ele exigiu reapresentar fatos antes de cada escrita e
custou várias tentativas repetidas na sessão anterior.

```
ECC_GATEGUARD=off claude
```

---

## Contexto do projeto

`C:\siteCSP`, branch `main`, tudo commitado e no GitHub (`Rodrigo1451/siteCSP`).
Último commit: `2541419` — "Catalogo completo: 99 produtos do site antigo (v1.1.0)".

- Site estático + API PHP/MySQL. O site fica em `public_html/`, espelhando a
  Hostinger. Credenciais em `csp-config.php` na raiz, fora do `public_html` e
  fora do Git.
- Fonte da verdade dos produtos: `public_html/api/seed.json` — **99 produtos**.
- Cópia para o front-end: `public_html/js/seed-data.js` (gerado; mesmos 99
  produtos + `CSP_CAT_LABELS` + `CSP_MARCA_LABELS` + rodapé `CSP_hydrate`).
- 99 páginas de detalhe em `public_html/produtos/produto-*.html`.
- Schema em `public_html/api/db.php`. Colunas: `id, nome, categoria,
  categoriaLabel, marca, marcaLabel, tag, img, alt, url, tipo, embalagem,
  detalhes, aplicacao, descricao, tags, ordem, createdAt`.
- `tipo`, `embalagem` e `detalhes` são novos. `CSP_SEED_VERSION` em `db.php`
  controla o `seed_sync()`, que insere no banco já populado só os ids
  ausentes, sem sobrescrever edições feitas no admin. **Se o conjunto de
  produtos do seed mudar, incremente essa constante**, senão o banco em
  produção não recebe os novos.

Semântica dos campos, já decidida — não reinterprete:

| campo | origem no site antigo |
|---|---|
| `tipo` | o `<h1 class="section-title left">` |
| `descricao` | seção "Aplicações do produto" (prosa principal) |
| `detalhes` | seção "Detalhes do produto" (especificações, vantagens) |
| `embalagem` | seção "Embalagens", uma por linha (`\n`) |
| `aplicacao` | não existe no site antigo; campo editorial nosso, vazio nos 99 |

## Tarefa 1 — corrigir entidades HTML corrompidas (faça primeiro)

Em **31 campos**, quase todos `embalagem`, a entidade HTML não foi decodificada
e o `;` dela virou quebra de linha.

- Original no site antigo: `Gal&atilde;o de 3,6 litros - 48 m&sup2;/dem&atilde;o`
- Deveria estar: `Galão de 3,6 litros - 48 m²/demão`
- Está: `Gal&atilde` + quebra de linha + `o de 3,6 litros`

Entidades envolvidas: `&atilde`, `&sup`, `&nbsp`, `&frac`. Produtos afetados
incluem `acquella-stone`, `bianco`, `camada-separadora-viapol`,
`classic-aluminio`, `classic-poliester`, `contra-umidade`, `desforma-mm`,
`ecol-2`, `ecoprimer`, `fuseprotec-brilhante`, `fuseprotec-fosco`,
`heyd-cryl-mastique`, `k-154`, `kiesey`, `ligmassa`.

Para listar todos:

```js
const seed = require('./public_html/api/seed.json');
for (const p of seed.produtos)
  for (const c of ['tipo','embalagem','detalhes','descricao','nome']) {
    const m = String(p[c]||'').match(/&[a-zA-Z]{2,8}(?![a-zA-Z;])/g);
    if (m) console.log(p.id, c, [...new Set(m)].join(','));
  }
```

**A corrupção é reversível sem precisar do site antigo**: onde há
`&nomeDaEntidade` seguido de quebra de linha, o `;` foi comido. Junte as duas
linhas, recoloque o `;` e decodifique. Corrija nos três lugares:
`api/seed.json`, `js/seed-data.js` e as 99 páginas em `produtos/`.

A causa raiz **não foi diagnosticada** — só o sintoma. Duas hipóteses foram
descartadas por estarem erradas. Se você preferir regerar as páginas em vez de
corrigi-las no lugar, ache a causa primeiro, senão o bug volta.

## Tarefa 2 — aplicar a planilha preenchida

Vou te mandar `produtos-lacunas.csv` preenchido. O arquivo em branco já está
commitado na raiz, junto com `produtos-lacunas-REFERENCIA.txt`.

- UTF-8 com BOM, separador `;`, 99 linhas de dados, 16 colunas.
- Chave de casamento: coluna `id`. Não confie na ordem das linhas.
- Colunas em MAIÚSCULA são auxiliares e devem ser **ignoradas**:
  `LACUNAS`, `SUGESTAO_marca`, `REVISAR_categoria`, `marca_site_antigo`,
  `categoria_site_antigo`.
- Colunas que valem: `marca`, `categoria`, `tipo`, `embalagem`, `aplicacao`,
  `tags`, `descricao`, `detalhes`.
- `marca` e `categoria` só aceitam as chaves de `CSP_MARCA_LABELS` e
  `CSP_CAT_LABELS`. **Valide e me avise se eu escrever uma chave inválida**, em
  vez de aceitar calado.
- Se eu preencher marca ou categoria nova, adicione o rótulo em `seed-data.js`
  **e** as `<option>` correspondentes em `produtos.html` e `admin.html` — os
  três têm de bater.
- `embalagem`: uma por linha. `detalhes`: linha começando com `*` vira `<li>`.
- Célula vazia significa "sem alteração" — não apague o valor existente.

Depois de aplicar: regerar `seed.json`, `seed-data.js` e as páginas afetadas,
incrementar `CSP_SEED_VERSION`, e atualizar os contadores estáticos se a
contagem de produtos ou de categorias mudar (`data-csp-count` em `index.html`,
`produtos.html`, `quem-somos.html`; o `data-csp-offset="7"` subtrai 7).

## Lacunas conhecidas, para conferir contra o que eu preencher

- **49 sem marca.** As páginas `/marca/*` do site antigo são vitrines de no
  máximo 4 itens ("Alguns produtos da marca"), então a marca só existe lá para
  26 produtos. Não infira marca pelo nome do produto sem eu confirmar.
- **22 sem `detalhes`** e **1 sem `embalagem`** (`macarico`) — acessórios que não
  têm essa seção na origem.
- **22 categorias divergentes** entre o seed e o site antigo. Foi mantido o
  valor do seed nos 70 antigos e usado o do site antigo nos 29 novos.
  `betol-ecologico` como `desmoldantes` parece errado no seed.

## Fatos já verificados — não gaste tokens redescobrindo

- O banco antigo tem **99 produtos distintos**, não 70 nem 86. A listagem
  `/produtos` tem 99 slots, mas repete 14 slugs de 2 a 4 vezes e esconde 29
  produtos que só aparecem nas páginas de categoria. Os 29 já foram
  recuperados e estão no site.
- O `<h1>` da página antiga é o **tipo**, não o nome. O nome está no
  `<h2 class="section-title">`.
- Relação 1:1 entre os 70 originais e o seed; zero homônimos, zero órfãos.
- `"embalagens".includes("embalagem")` é **false** — o plural em português troca
  m→ns. Isso custou uma rodada de depuração.
- As classes `.produto-detalhe-bloco`, `.produto-embalagens`,
  `.produto-detalhe-badges`, `.produto-detalhe-meta` e
  `.produto-especificacoes` agora têm CSS em `css/style.css`. Antes não tinham
  regra nenhuma em nenhum arquivo.
- `api/produtos.php` usa `SELECT *`, então coluna nova aparece na API sem
  alterar esse arquivo.
- No admin, campo novo exige mudar `admin.html` **e** `js/admin.js` juntos — o
  `Object.assign` em `saveProduto()` sobrescreve com o valor antigo se o JS não
  ler o campo.
- PHP não está instalado localmente; não dá para rodar `php -l`.

## Cache do site antigo

As 99 páginas de detalhe, 9 listagens e 36 páginas de taxonomia ficaram em
cache em:

```
C:\Users\rodri\AppData\Local\Temp\claude\C--siteCSP\4bd440d9-8448-4529-88d9-83b747640116\scratchpad\
```

Essa pasta é específica da sessão anterior e **provavelmente não existe mais**;
com ela vão os scripts `scrape.js`, `taxonomia.js`, `extras.js`, `gerar.js` e
`planilha.js`. As duas tarefas acima foram desenhadas para **não depender**
desse cache. Só volte a raspar
`https://comercialsaopedro.com.br/novo/public/produtos` se surgir necessidade
nova — e, nesse caso, os produtos escondidos estão em
`/produtos/categoria/<slug>`, não na listagem paginada.

## Como quero que você trabalhe

- Faça em massa por script; não leia as 99 páginas uma a uma no seu contexto.
- Valide no fim: 99 produtos, ids únicos, nenhum campo obrigatório vazio,
  imagem e página existindo para cada id, categorias e marcas presentes nos
  filtros e nos mapas de rótulo, `seed-data.js` carregando, tags HTML
  balanceadas e nenhuma entidade vazando.
- Me mostre o resultado antes de commitar. Não commite sem eu pedir.
- Se o custo passar de US$ 20, pare e me avise antes de continuar.
