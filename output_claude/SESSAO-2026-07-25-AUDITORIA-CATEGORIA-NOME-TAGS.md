# Auditoria completa dos 117 produtos x `completa.xlsx` — categoria, nome e tags

Continuação de [`SESSAO-2026-07-25-AUDITORIA-PLANILHA.md`](./SESSAO-2026-07-25-AUDITORIA-PLANILHA.md),
que já tinha coberto **marca**, **embalagem** e **descrição**. Esta rodada
cobre os campos que faltavam: **categoria**, **nome** e **tags** — nenhum dos
três tinha sido comparado com a planilha até agora.

Método: reconstruí o mapa das 198 linhas → 117 produtos (mesmo critério da
sessão de 24/07 — variação só de tamanho/embalagem é o mesmo produto) e
validei que **as 198 linhas batem certinho com os 117 produtos, sem sobra e
sem produto sem nenhuma linha**. A partir daí comparei campo a campo.

---

## 1. Categoria — 13 produtos antigos com categoria diferente da planilha

Nunca tinha sido comparado antes. São todos dos 54 produtos mantidos do site
anterior — a categoria deles já existia antes da planilha existir, então pode
ser uma escolha editorial válida ou pode ser desatualizada. Preciso que você
decida caso a caso; não mudei nada.

| id | categoria no site | categoria na planilha |
|---|---|---|
| `camada-separadora-viapol` | Asfaltos Modificados | Produtos Complementares |
| `eucon-rapid-10` | Cura Química | Aditivos p/ Concretos |
| `kiesey` | Selantes / Mastiques | Impermeabilizantes |
| `ligmassa` | Argamassas Especiais | Adesivos p/ Argamassas |
| `mactra-2000` | Argamassas Especiais | Impermeabilizantes |
| `mactracol` | Argamassas Especiais | Adesivos p/ Argamassas |
| `mactraset` | Argamassas Especiais | Impermeabilizantes |
| `sika-1` | Selantes / Mastiques | Impermeabilizantes |
| `sika-multiseal` | Selantes / Mastiques | Mantas Asfálticas |
| `sikafill-rapido` | Selantes / Mastiques | Impermeabilizantes |
| `viabit` | Asfaltos Modificados | Impermeabilizantes |
| `viaflex-fita-aluminizada` | Telhados e Calhas | Mantas Asfálticas |
| `viaplus-st-acelerado` | Grautes | Argamassas Especiais |

### Os 63 produtos novos: categoria vazia, mas a planilha tem o dado pronto

Nenhum dos 63 produtos novos tem `categoria` preenchida no site (pendência já
conhecida da sessão de 24/07). A boa notícia: a planilha tem uma categoria
válida para **todos os 63**, batendo exatamente com as chaves que já existem
em `CSP_CAT_LABELS` — dá pra preencher em lote sem inventar nada, igual foi
feito com `embalagem` na sessão passada. Lista completa (produto → categoria
sugerida):

```
acquella-block → Aditivos p/ Tamponamento
argamassa-acaba-trinca → Argamassas Especiais
argamassa-bautech-rodape → Argamassas Especiais
bautech-7000 → Impermeabilizantes
bautech-bloqueio-de-umidade → Impermeabilizantes
bautech-borracha-liquida → Impermeabilizantes
bautech-chapisco → Adesivos p/ Argamassas
bautech-fita-trinca → Produtos Complementares
bautech-fita-veda-tudo → Mantas Asfálticas
bautech-manta-liquida-incolor → Impermeabilizantes
bautech-silicone-veda-e-cola → Selantes / Mastiques
biancola-ciplak → Adesivos p/ Argamassas
desforma-plus → Desmoldantes
duralfoil-extra → Telhados e Calhas
espatula-plastica → Produtos Complementares
espuma-expansiva-quartzolit → Selantes / Mastiques
eucorepair-vi-60 → Argamassas Especiais
fast-set → Aditivos p/ Tamponamento
fibra-de-polipropileno-fibromac-12 → Aditivos p/ Concretos
fita-adesiva-aluminizada-astrofita → Produtos Complementares
fita-crepe → Produtos Complementares
fita-multiuso-mactra → Mantas Asfálticas
fixtudo-branco → Selantes / Mastiques
fuseprotec-eco-super-brilhante → Impermeabilizantes
granulos-de-ardosia-cinza-clara → Produtos Complementares
igol-s → Primers
igolflex-preto → Impermeabilizantes
jogo-de-acessorios-p-sache → Produtos Complementares
manta-coberturas-aluminio-ciplak → Telhados e Calhas
manta-geotextil-2-15-m-130-grs-fibratex → Drenagem
manta-geotextil-branca-60-g-m2-scavone → Drenagem
manta-vedacit-pro-tipo-ii → Mantas Asfálticas
pu-40-multiuso-quartzolit → Selantes / Mastiques
repele-agua → Impermeabilizantes
resina-bautech-protege-parede-e-muros → Impermeabilizantes
rolo-anti-resp-c-cabo-23-cm → Produtos Complementares
sika-eco-primer → Primers
sikaflex-101-sela-plus → Selantes / Mastiques
sikaflex-universal → Selantes / Mastiques
super-manta-liquida → Impermeabilizantes
supergraute-quartzolit → Grautes
tela-de-poliester-resinada → Produtos Complementares
ultraflex-pu-40 → Selantes / Mastiques
vedacit-aditivo-acelerador-ultra → Aditivos p/ Concretos
vedalage-preto → Impermeabilizantes
vedax-10-aditivo-super-impermeabilizante → Impermeabilizantes
vedax-chapisco-pva → Adesivos p/ Argamassas
vedax-flex-5000 → Impermeabilizantes
vedax-flex-fibras-7000 → Impermeabilizantes
vedax-lastic-fibras-10-000 → Impermeabilizantes
vedax-max-manta-liquida → Impermeabilizantes
vedax-plast-aditivo-plastificante → Aditivos p/ Concretos
vedax-pu-flex → Selantes / Mastiques
vedax-sela-trinca → Selantes / Mastiques
vedax-top-1000 → Impermeabilizantes
viabit-antirraiz → Impermeabilizantes
vialastic-branco → Impermeabilizantes
viaplus-reparo → Argamassas Especiais
viapol-sela-espuma-expansiva → Selantes / Mastiques
viapol-torodin-el-4-pp-tipo-iii → Mantas Asfálticas
viapolseca-rapidissimo → Aditivos p/ Tamponamento
viapolsela-pu-30 → Selantes / Mastiques
viapolsela-trincas → Selantes / Mastiques
```

Isso é um preenchimento de lacuna, não uma correção de erro — se você topar, é
seguro rodar em lote.

---

## 2. Nome — 16 produtos com nome bem diferente do da planilha

Já era sabido que **7** desses precisavam de decisão sobre renomear (listado
na sessão de 24/07, seção "Julgamentos que valem revisão" — nunca foi
aplicado). Nesta auditoria achei mais **9** que não tinham sido documentados
antes. Nenhum foi tocado.

| id | nome no site | nome na planilha | já era conhecido? |
|---|---|---|---|
| `aplicador-de-sache-600ml` | APLICADOR DE SACHÊ 600ML | APLICADOR PRETO | sim (24/07) |
| `aplicador-de-silicone` | APLICADOR DE SILICONE | PISTOLA METALICA LARANJA ITW | sim (24/07) |
| `camisa-solodren-4-polegadas` | CAMISA SOLODREN 4 POLEGADAS | CAMISA GEOTEXTIL 4" ACQUA | sim (24/07) |
| `monopol-pu-25-300ml` | MONOPOL PU 25 300ML | MONOPOL PU 25 PLUS CINZA 600ML/942 G | sim (24/07) |
| `fundo-de-junta-tarucel` | FUNDO DE JUNTA TARUCEL | TARUCEL 06/08/10/15/20/25/30 MM (7 linhas) | sim (24/07) |
| `viaflex-fita-aluminizada` | VIAFLEX FITA ALUMINIZADA | VIAFLEX FITA SLEEVE (7 medidas) | sim (24/07) |
| `compound-adesivo-tix` | COMPOUND ADESIVO TIX | COMPOUND TIX 1 KG | **novo** |
| `heyd-cryl-mastique` | HEYD'CRYL MÁSTIQUE | HEYDICRYL MASTIQUE (2 linhas) | **novo** |
| `macdrain-2l-fp` | MACDRAIN 2L FP | MACDRAIN 2 L FP 2X30 | **novo** |
| `pincel-2-polegadas` | PINCEL 2 polegadas | PINCEL 2" (Compel / Roma) | **novo** |
| `pincel-3-polegadas` | PINCEL 3 polegadas | PINCEL 3" (Compel / Roma) | **novo** |
| `premium-poliester` | PREMIUM POLIÉSTER | VIAPOL PREMIUM POL ARDOSIADO CZA (3mm/4mm) | **novo** |
| `selante-pu-30-quartzolit` | SELANTE PU 30 QUARTZOLIT | PU 30 QUARTZOLIT (cinza/preto/branco) | **novo** |
| `sikaflex-construcao` | SIKAFLEX CONSTRUÇÃO | SIKAFLEX-416 CONSTR. (cinza/branco) | **novo** |
| `tela-vedatrinca-0-10-x-3m` | TELA VEDATRINCA 0,10 x 3M | TELA VEDATRINCA 0,10X3M | **novo** (só espaçamento — cosmético) |
| `tubo-dreno-4-polegadas` | TUBO DRENO 4 POLEGADAS | TUBO DE DRENO 4" | **novo** |

`tela-vedatrinca-0-10-x-3m` é só diferença de espaço/formatação, não precisa
de decisão. Os outros 15 são nomes genuinamente diferentes — o nome do site
provavelmente é mais amigável para o cliente (ex.: "APLICADOR DE SACHÊ" é mais
claro que "APLICADOR PRETO"), então manter o nome do site pode ser a escolha
certa. Fica pra você decidir se renomeia para bater com a planilha ou mantém.

Encontrei também alguns casos de diferença **só de abreviação/formatação**
(não precisam de decisão, listo só por transparência):
`fita-multiuso-mactra`, `manta-coberturas-aluminio-ciplak`,
`manta-geotextil-2-15-m-130-grs-fibratex`, `vedacit-aditivo-acelerador-ultra`,
`vedax-10-aditivo-super-impermeabilizante`, `viabit-antirraiz`,
`viapolsela-pu-30` — a planilha só tem a palavra por extenso ou um sufixo de
tamanho a mais (ex.: "ADIT" → "ADITIVO", "VIABIT ANTIRAIZ" → "VIABIT
ANTIRRAIZ").

---

## 3. Tags — 0 de 117 produtos têm tag preenchida

O campo `tags` (array) está vazio em **todos os 117 produtos**, mas a
planilha tem a coluna `Tags` preenchida em praticamente todas as 198 linhas
(ex.: `impermeabilizante;argamassa polimérica;flexível;laje`). Isso nunca foi
puxado pro site. Não é bem uma "divergência" — é uma lacuna total, e como o
dado já existe pronto na planilha (bastando unir as tags de todas as linhas
de SKU de cada produto e remover duplicata), dá pra preencher em lote como foi
feito com embalagem. Não gerei a lista completa das 117 aqui porque é grande
demais para o corpo do relatório — se você quiser seguir com o preenchimento,
eu gero e aplico.

---

## 4. Marca — reforço de 2 achados, e 1 divergência nova

Marca já tinha sido auditada e corrigida na sessão anterior (4 corrigidos, 4
seguem sem marca por ambiguidade entre fabricantes: `broxa-retangular`,
`pincel-2-polegadas`, `pincel-3-polegadas`, `tela-de-poliester`). Nesta
rodada, rodando o comparativo de novo sobre o estado atual, apareceu **1
divergência real que não tinha sido notada antes**:

| id | marca no site | marca na planilha | observação |
|---|---|---|---|
| `instant-pav` | CB-PAV | Instant Pav (FH) | vale conferir — "FH" pode ser outro fabricante, não CB-PAV |

Também apareceram 8 casos que **parecem** divergência mas não são erro, só
convenção de rótulo — não precisam de ação:
- `espuma-expansiva-quartzolit`, `pu-40-multiuso-quartzolit`,
  `selante-pu-30-quartzolit`, `supergraute-quartzolit`: site usa
  "Weber-Quartzolit" (rótulo oficial da marca no site), planilha só escreve
  "Quartzolit" — mesma marca.
- `fita-vedatrinca-5x5-m`, `imperall-premium`, `tela-vedatrinca-0-10-x-3m`,
  `vedbem-trinca`: planilha escreve "Mactra (Vedbem)" porque VedBem é uma
  submarca da Mactra; o site usa "VedBem" direto, que é consistente com como
  os outros produtos VedBem já são tratados.

---

## 5. Embalagem — 1 divergência nova além das já conhecidas

Embalagem já foi totalmente auditada na sessão anterior: 48 produtos com
texto diferente da planilha, decisão tomada de **não mexer** (dado do site é
mais rico/detalhado — múltiplos tamanhos onde a planilha só lista o principal).
Rodando de novo sobre o estado atual (hoje são 40 nessa situação, a diferença
de contagem é só refinamento do meu critério de comparação, nada mudou nos
dados), os 2 casos que já pediam sua atenção continuam em aberto:

- `monopol-pu-25-300ml`: site 300 ml, planilha 600 ml/942 g.
- `vedalage-plus`: site 18 kg, planilha 12 kg/4 kg/4 L.

E apareceu um terceiro que também parece ser diferença de quantidade real,
não só formatação:

- **`instant-pav`**: site diz **"SC 40kg"**, planilha diz **"Saco 25 kg"**.
  Mesmo produto que já está com a marca divergente (seção 4) — vale a pena
  conferir os dois campos juntos com o fabricante/fornecedor.

O bug antigo de entidades HTML corrompidas (`Gal&atilde` no lugar de "Galão",
`&nbsp` solto) continua presente em vários dos 40 — mesma pendência já
registrada, não é novidade desta rodada.

---

## Resumo

| campo | situação |
|---|---|
| Categoria — 54 antigos | 13 divergem da planilha, decisão pendente |
| Categoria — 63 novos | 100% vazia no site; planilha tem dado pronto pra preencher |
| Nome | 16 nomes bem diferentes (6 já sabidos, 10 novos); maioria parece nome mais amigável de propósito |
| Tags | 0/117 preenchida; planilha tem dado pronto pra preencher |
| Marca | 1 divergência nova (`instant-pav`); resto já resolvido ou é só rótulo |
| Embalagem | 1 divergência nova (`instant-pav`); 2 já conhecidas seguem em aberto (`monopol-pu-25-300ml`, `vedalage-plus`) |

**Produto que merece prioridade:** `instant-pav` diverge em marca *e*
embalagem ao mesmo tempo (planilha aponta pra um fabricante diferente — "FH"
— e uma quantidade diferente — 25kg vs 40kg). Os outros achados são lacunas
de preenchimento (categoria/tags dos 63 novos) ou decisões de nome/categoria
que dependem do seu critério, não erros óbvios.

Nada foi alterado nos arquivos do site nesta auditoria — é só o relatório.
