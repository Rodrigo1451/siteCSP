# Sessão 2026-07-24 — alinhamento do catálogo à curva ABC

Branch: `catalogo-planilha` (partiu de `main` em `bc96e4a`, já no GitHub).
A `main` continua com os 99 produtos antigos até alguém aprovar e mergear.

**Resultado: 99 → 117 produtos.** 45 excluídos, 63 criados, 54 mantidos.

O que ficou pronto foram as **etapas 1 a 3** (nomes). A **etapa 4**, que
preenche os campos a partir de `completa.xlsx`, ainda não foi feita.

---

## As duas planilhas

`nome.xlsx` e `completa.xlsx` estão na raiz do projeto, ambas com a aba
`curva abc jan-26 a julho-26`.

- `nome.xlsx` — 1 coluna, 198 linhas de dados.
- `completa.xlsx` — 7 colunas, as mesmas 198 linhas:
  `Nomes produtos`, `Marca`, `Embalagem`, `Descrição`, `Tags`, `Categoria`,
  `Categorias Disponíveis`.

A coluna `Nomes produtos` é **idêntica** nas duas, sem duplicatas. `nome.xlsx`
é só a coluna A de `completa.xlsx`. A coluna G, `Categorias Disponíveis`, não é
dado de produto — é a lista de referência das categorias válidas, desalinhada
das linhas.

## A decisão que mandou em tudo: SKU x produto

A planilha é **por SKU** (produto + embalagem). O site é **por produto**, com a
embalagem como campo interno. `VIABIT 18 L`, `VIABIT 3,6 L` e `VIABIT 900 ML`
são 3 linhas da planilha e 1 produto no site; `TARUCEL` tem 7 linhas.

O critério usado no casamento, aplicado em todas as etapas:

> Variação **só de tamanho ou embalagem** = mesmo produto.
> Variação de **atributo que define o item** (cor de manta, tipo de reforço,
> marca) = produto diferente.

Isso segue a convenção que o site já usava — `SIKA MANTA PS`, por exemplo,
sempre cobriu 3mm, 4mm, alumínio e classes A/B num produto só.

As 198 linhas foram mapeadas uma a uma, sem exceção, e o mapa foi validado por
asserção: toda linha aponta para um produto existente ou para um produto novo.
Os 54 produtos mantidos têm todos pelo menos uma linha na planilha.

---

## Etapa 1 — verificação dos nomes

Comparação dos 99 produtos do site com as 198 linhas, só por nome.

- **54** produtos do site têm correspondente na planilha.
- **45** não têm.
- **63** produtos da planilha não existiam no site.

## Etapa 2 — exclusão dos 45

```
seed.json           99 → 54 produtos
seed-data.js        99 → 54 produtos
produtos/*.html     45 páginas removidas
relacionados        41 páginas com cards órfãos limpos
contadores          54 produtos, 17 categorias
```

Excluídos: `acquella-stone`, `adeflex`, `agua-raz`, `betol-ecologico`,
`cabo-para-rolo`, `classic-poliester`, `contra-umidade`, `desforma-mm`,
`desmoldante-concentrado`, `expancit-500`,
`fibra-de-polipropileno-10-mm-argamassa`,
`fibra-de-polipropileno-20-mm-concreto`, `fita-adesiva-freshfoil`,
`fixmassa-500ml`, `freshfoil-premium`, `fuseprotec-fosco`, `k-154`, `macarico`,
`manta-geotextil-2-30-largura-160-grs`, `matamofo`,
`monopol-construcao-bco-400ml`, `neofix-a-4120`, `premium-ardosiado-glass`,
`primer-viapol`, `protetor-armadura-quartzolit`, `rolo-de-la-de-carneiro-23-cm`,
`selador-fc`, `sika-2`, `sika-3`, `sikadur-31`, `tecbond-mf`, `tecbond-tix`,
`vassoura`, `vedatrinca`, `vedbem-cozinha-e-banheiro`, `vedbem-piscina`,
`viafix`, `viaflex-branco`, `viaflex-preto`, `viafloor-fluor-silicato`,
`viamix-rapido-cl`, `vitkote-elastic`, `vitpoli-eco`, `w-tec-supergroute`,
`weber-ad-bond-ar`.

### Imagens órfãs

As 45 imagens correspondentes **não foram apagadas**. Foram renomeadas com
`git mv` para `<id>_orfa.jpg` em `public_html/img/produtos/`. O diretório
continua com 99 arquivos: 54 em uso e 45 marcados.

Servem para reaproveitar nos produtos novos que forem o mesmo item com outro
nome — `rolo-de-la-de-carneiro-23-cm_orfa.jpg` é a foto do produto que virou
`ROLO ANTI RESP C/CABO 23 CM`, por exemplo.

## Etapa 3 — criação dos 63

Criados **só com o nome**. Todo o resto vazio:

```json
{"id":"acquella-block","nome":"ACQUELLA BLOCK","categoria":"","categoriaLabel":"",
 "marca":"","marcaLabel":"","tag":"","img":"","alt":"ACQUELLA BLOCK",
 "url":"produtos/produto-acquella-block.html","tipo":"","embalagem":"",
 "detalhes":"","aplicacao":"","descricao":"","tags":[],"ordem":0}
```

`img` vazia é seguro: o `produtos.html` (linhas 239–241) já cai num placeholder
SVG quando `p.img` é falsy. Não há imagem quebrada em lugar nenhum.

As páginas de detalhe novas foram geradas a partir de
`produto-kiesey.html` como molde — cabeçalho, nav, footer e scripts idênticos
aos das outras. O miolo tem só breadcrumb, `<h1>`, nome e os dois botões
(orçamento no WhatsApp / voltar ao catálogo). Os blocos de descrição, detalhes
e embalagens nem existem ainda; entram na etapa 4.

A lista dos 63, com as linhas de SKU que cada um agrupa, está em
`_novos_produtos.txt` na raiz.

---

## Julgamentos que valem revisão

Nada aqui é óbvio. Se algum estiver errado, é mais barato corrigir agora do que
depois da etapa 4.

### Produtos que apaguei por não achar o nome na planilha

| Decisão | Raciocínio |
|---|---|
| `vedatrinca` fora, `vedbem-trinca` fica | A planilha traz "VEDATRINCA SELANTE (VEDBEM TRINCA)" — a própria célula diz que são o mesmo item. O `vedatrinca` do site era impermeabilizante elastomérico; o da planilha é selante. |
| `viafix` fora, `viafix-chapisco` fica | A planilha só tem VIAFIX CHAPISCO. O VIAFIX puro (emulsão adesiva) não aparece. |
| fibras de 10mm e 20mm fora | A planilha só tem FIBROMAC 12 MACCAFERRI — 12mm, que não bate com nenhuma das duas. Virou produto novo. |
| `manta-geotextil-2-30-largura-160-grs` fora | A planilha tem 2,15m/130g FIBRATEX e branca 60g/m² SCAVONE. Specs diferentes; viraram 2 produtos novos. |
| `desforma-mm`, `w-tec-supergroute`, `premium-ardosiado-glass`, `classic-poliester` fora | A planilha tem DESFORMA **PLUS**, SUPERGRAUTE **QUARTZOLIT**, PREMIUM **POL**(iéster) ARDOSIADO e CLASSIC **ALUMÍNIO** — variantes ou marcas diferentes. |

### Produtos que mantive casando com nome bem diferente

Todos precisam ser **renomeados na etapa 4** para o nome da planilha:

| id no site | linha da planilha |
|---|---|
| `aplicador-de-sache-600ml` | APLICADOR PRETO |
| `aplicador-de-silicone` | PISTOLA METALICA LARANJA ITW |
| `camisa-solodren-4-polegadas` | CAMISA GEOTEXTIL 4" ACQUA |
| `viaplus-st-acelerado` | EUCOREPAIR V ACELERADO 25 KG (ANTIGO VIAPLUS ST ACELERADO) |
| `viaflex-fita-aluminizada` | VIAFLEX FITA SLEEVE (7 medidas) |
| `monopol-pu-25-300ml` | MONOPOL PU 25 PLUS CINZA 600ML/942 G |
| `fundo-de-junta-tarucel` | TARUCEL 06/08/10/15/20/25/30 MM |

### Agrupamentos de SKU que decidi na criação

- `MANTA VEDACIT PRO TIPO II` juntou 3 linhas (V PRO II ardósia 4mm cinza +
  PRO tipo II poliéster 3mm e 4mm).
- `SUPER MANTA LÍQUIDA` juntou branca, cinza concreto e
  `MSET SUPER MANTA LIQUIDA BRANCA` — assumi que MSET é prefixo de marca do
  mesmo produto. **É o agrupamento menos seguro dos três.**
- `TELA DE POLIÉSTER RESINADA` ficou **separada** da `TELA DE POLIESTER` lisa.
- `SIKA ECO PRIMER` ficou **separado** do `ECOPRIMER` da Viapol — marcas
  diferentes.
- `FUSEPROTEC ECO SUPER BRILHANTE` **separado** do `FUSEPROTEC BRILHANTE`.
- `VIABIT ANTIRRAIZ` **separado** do `VIABIT`.

### Um erro corrigido no meio do caminho

O `rolo-de-la-de-carneiro-23-cm` entrou na lista de exclusão da etapa 2 apesar
de a análise ter concluído mantê-lo — o relatório dizia uma coisa e o script
fez outra. Foi recriado na etapa 3 como `ROLO ANTI RESP C/CABO 23 CM`, o nome
da planilha, então o efeito final está certo. Os outros 44 foram conferidos um
a um depois disso.

---

## Estado dos arquivos

| arquivo | estado |
|---|---|
| `public_html/api/seed.json` | 117 produtos, `ordem` reindexada, ordenado por nome |
| `public_html/js/seed-data.js` | mesmos 117, com `origin: "seed"` |
| `public_html/produtos/*.html` | 117 páginas, nenhuma órfã |
| `public_html/img/produtos/` | 99 arquivos: 54 em uso, 45 com sufixo `_orfa` |
| `public_html/api/db.php` | `CSP_SEED_VERSION` = `2026-07-24-117` |
| `index.html`, `produtos.html`, `quem-somos.html` | `data-csp-count` = 117 produtos, 17 categorias |

### Validação que passou

ids iguais entre `seed.json` e `seed-data.js`; ids e nomes únicos; `seed-data.js`
carrega no Node; toda página e imagem referenciada existe; nenhuma página órfã
em `produtos/`; nenhum link `produto-*.html` quebrado nas 117 páginas.

---

## Pendências

### 1. Etapa 4 — preencher os campos (é o próximo passo)

A partir de `completa.xlsx`, casando pela coluna `Nomes produtos`:

- Preencher `marca`, `categoria`, `embalagem`, `descricao`, `tags` nos 63 novos.
- Corrigir os mesmos campos nos 54 que já existiam.
- Renomear os 7 produtos da tabela "casando com nome bem diferente".
- Decidir a acentuação: os nomes vieram da planilha como estão lá, alguns sem
  acento (`RODAPE`, `GRANULOS`, `ESPATULA`, `LIQUIDA`). Normalizar ou manter
  idêntico à planilha?
- Consolidar as embalagens: cada produto novo agrega várias linhas de SKU, e a
  coluna `Embalagem` de cada uma vira uma linha do campo `embalagem`
  (separadas por `\n`).

Regras que continuam valendo, de `PROXIMA-SESSAO.md`:

- `marca` e `categoria` só aceitam as chaves de `CSP_MARCA_LABELS` e
  `CSP_CAT_LABELS` (lista em `produtos-lacunas-REFERENCIA.txt`). Marca ou
  categoria nova exige adicionar o rótulo em `seed-data.js` **e** as `<option>`
  em `produtos.html` **e** `admin.html` — os três têm de bater.
- `embalagem`: uma por linha. `detalhes`: linha começando com `*` vira `<li>`.
- Campo novo no admin exige mexer em `admin.html` **e** `js/admin.js` juntos.
- Depois de aplicar: incrementar `CSP_SEED_VERSION` e atualizar os contadores
  se a contagem mudar (o `data-csp-offset="7"` no `index.html` subtrai 7).

### 2. O banco de produção não foi tocado

`seed_sync()` em `api/db.php` **só insere ids ausentes — nunca apaga**. Os 45
produtos removidos continuam no MySQL da Hostinger. Subir a branch faz os 63
novos aparecerem, mas **não** faz os 45 sumirem. Falta gerar e rodar os `DELETE`
no phpMyAdmin.

### 3. Não subir para produção antes da etapa 4

Os 63 novos estão sem categoria e sem marca. Se forem para o ar assim, aparecem
no catálogo fora de qualquer filtro e sem imagem.

### 4. Bug antigo ainda aberto

As entidades HTML corrompidas descritas na Tarefa 1 do `PROXIMA-SESSAO.md`
(`Gal&atilde` + quebra de linha, em vez de `Galão`) **continuam lá** nos
produtos que sobreviveram — `bianco`, `camada-separadora-viapol`,
`classic-aluminio`, `ecol-2`, `ecoprimer`, `fuseprotec-brilhante`,
`heyd-cryl-mastique`, `kiesey`, `ligmassa`. A causa raiz nunca foi
diagnosticada. Como a etapa 4 vai reescrever `embalagem` a partir da planilha,
é provável que o sintoma desapareça sozinho nos campos reescritos — mas não em
`detalhes` e `descricao`.

---

## Como o trabalho foi feito

Tudo por script, em massa, nunca editando as 117 páginas à mão. Os scripts
`etapa2_excluir.py` e `etapa3_criar.py` ficaram no scratchpad temporário da
sessão, que provavelmente não existe mais. O que importa deles está preservado:
o mapa das 198 linhas → produto está reconstituível a partir de
`_novos_produtos.txt` (que lista, para cada produto novo, exatamente quais SKUs
ele agrega) somado à lista de exclusões acima.

Se for refazer, o gargalo não é o script — é o casamento dos nomes. Comece pelo
critério SKU-x-produto no topo deste documento.
