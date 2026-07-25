# Sessão 2026-07-25 — auditoria do catálogo contra `completa.xlsx`

Revisão pedida depois que o sistema virou 100% banco de dados (sessão anterior):
conferir se sobrou algum rastro de teste no site, e comparar os 117 produtos
contra a planilha `completa.xlsx` para achar divergências. Marca e embalagem
errada foram corrigidas direto; o resto está listado aqui para decisão manual.

---

## 1. Rastros de teste — nenhum encontrado

Conferi `git status` (nada estranho fora do que esta sessão mudou de propósito),
a raiz do projeto (sem arquivo temporário esquecido) e o banco de dev local
(sempre limpo entre uma rodada de teste e outra, nunca chega a valer nada real
já que é só local). Os produtos de teste que criei durante os testes do admin
("SELANTE UI TESTE", "PRODUTO TESTE CAO", "KIT BASICO"×3, "SO NOME MESMO")
foram todos excluídos antes do fim de cada sessão de teste — nenhum sobrou no
`seed.json` nem em lugar nenhum versionado.

---

## 2. Marca — 4 produtos corrigidos automaticamente

Comparei a marca de cada um dos 117 produtos com a coluna `Marca` da planilha.
Achei 4 casos onde o banco tinha uma marca **diferente** da planilha (não
vazia — uma marca errada mesmo, provavelmente copiada de outro produto por
engano numa carga anterior). Corrigi os 4 no `seed.json` e criei uma migração
que aplica a mesma correção no banco de produção na próxima visita ao site
(só se o valor lá ainda for exatamente o valor errado abaixo — se você já
tiver mudado manualmente no admin, ela não mexe).

| id | antes | depois | observação |
|---|---|---|---|
| `camisa-solodren-4-polegadas` | Maccaferri | **Acqua** | a linha da planilha é "CAMISA GEOTEXTIL 4\" ACQUA" |
| `monopol-pu-25-300ml` | Branyl | **Monopol** | o próprio nome do produto já dizia Monopol |
| `telhafria` | VedBem | **(sem marca)** | a planilha não atribui marca a esse item |
| `vedalage-plus` | Viapol | **Vedacit** | todas as 4 linhas de SKU na planilha são Vedacit |

Duas marcas novas entraram no sistema por causa disso — **Acqua** e **Monopol**
— adicionadas em `CSP_MARCA_LABELS` (seed-data.js) e nos `<select>` de
`produtos.html`/`admin.html`, mesmo processo das marcas novas da sessão
anterior.

---

## 3. Embalagem vazia — 60 produtos preenchidos automaticamente

Todos os produtos abaixo estavam com o campo `embalagem` vazio e a planilha
tinha o dado — preenchi com uma linha por SKU da planilha (mesma convenção já
usada no site). A lista completa:

```
acquella-block, argamassa-acaba-trinca, argamassa-bautech-rodape, bautech-7000,
bautech-bloqueio-de-umidade, bautech-borracha-liquida, bautech-chapisco,
bautech-fita-trinca, bautech-fita-veda-tudo, bautech-manta-liquida-incolor,
bautech-silicone-veda-e-cola, biancola-ciplak, desforma-plus, duralfoil-extra,
espatula-plastica, espuma-expansiva-quartzolit, eucorepair-vi-60, fast-set,
fibra-de-polipropileno-fibromac-12, fita-adesiva-aluminizada-astrofita,
fita-crepe, fita-multiuso-mactra, fixtudo-branco, fuseprotec-eco-super-brilhante,
granulos-de-ardosia-cinza-clara, igol-s, igolflex-preto,
jogo-de-acessorios-p-sache, manta-coberturas-aluminio-ciplak,
manta-geotextil-2-15-m-130-grs-fibratex, manta-geotextil-branca-60-g-m2-scavone,
manta-vedacit-pro-tipo-ii, repele-agua, resina-bautech-protege-parede-e-muros,
rolo-anti-resp-c-cabo-23-cm, sika-eco-primer, sikaflex-101-sela-plus,
super-manta-liquida, supergraute-quartzolit, tela-de-poliester-resinada,
ultraflex-pu-40, vedacit-aditivo-acelerador-ultra, vedalage-preto,
vedax-10-aditivo-super-impermeabilizante, vedax-chapisco-pva, vedax-flex-5000,
vedax-flex-fibras-7000, vedax-lastic-fibras-10-000, vedax-max-manta-liquida,
vedax-plast-aditivo-plastificante, vedax-pu-flex, vedax-sela-trinca,
vedax-top-1000, viabit-antirraiz, vialastic-branco, viaplus-reparo,
viapol-torodin-el-4-pp-tipo-iii, viapolseca-rapidissimo, viapolsela-pu-30,
viapolsela-trincas
```

3 produtos continuam sem embalagem porque a **própria planilha** também está
em branco nesse campo para eles: `pu-40-multiuso-quartzolit`,
`sikaflex-universal`, `viapol-sela-espuma-expansiva`. Não é uma lacuna minha —
não há dado nenhum para puxar.

Igual à correção de marca, isso também roda sozinho no banco de produção na
primeira visita depois do deploy (só preenche o que estiver vazio, nunca troca
valor que já existe).

---

## 4. Embalagem diferente da planilha, mas **não mexi** — 48 produtos

Estes são todos produtos antigos (dos 54 mantidos do site anterior). O texto
que já existia no banco vem do site antigo e quase sempre é **mais detalhado**
que a planilha (múltiplos tamanhos, especificações extras) — substituir pelo
texto terso da planilha seria perder informação, não corrigir um erro. Por
isso só listei, não toquei em nada:

| id | banco (atual) | planilha |
|---|---|---|
| `aplicador-de-sache-600ml` | Un | Unidade |
| `aplicador-de-silicone` | Un | Unidade |
| `bianco` | Balde de 18 kg / Galão de 3,6 kg / Pote de 1 kg / Tambor de 200 kg | 18 kg, 3,6 kg |
| `camada-separadora-viapol` | Rolos com 300m² | Rolo 1,25 m |
| `camisa-solodren-4-polegadas` | ML | 4" |
| `cimento-asfaltico-nbr-9910-tipo-ii` | SC 15 kg | Bloco 15 kg |
| `classic-aluminio` | Bobina 1x10m / paletes de 25-30 bobinas | Rolo 4 mm |
| `compound-adesivo` | Lata de 1 kg (A+B) (6 un) | 1 kg |
| `compound-adesivo-tix` | Lata de 1 kg (A+B) | 1 kg |
| `ecol-2` | Frasco 1L / Galão 3,6L / Balde 18L / Tambor 200L | Balde 18 L |
| `ecoprimer` | Frasco 1L / Galão 3,6L / Balde 18L / Barrica 18L e 50L / Tambor 200L | Balde 18 L, Galão 3,6 L |
| `eucon-rapid-10` | Balde 18L / Tambor 200L / Container 100L | Balde 18 L (20,88 kg) |
| `expansor` | 3 kg / 1 kg / 25 kg | 3 kg |
| `fita-vedatrinca-5x5-m` | Rolo 5 x 5 | 5 cm x 5 m |
| `fundo-de-junta-tarucel` | esp. 6/10/15/20/25/30/40/50 mm ML | 6/8/10/15/20/25/30 mm |
| `fuseprotec-brilhante` | Lata 900ml / Galão 3,6L / Balde 18L | 18 kg, 3,6 L |
| `heyd-cryl-mastique` | Galão 5kg / Barrica 18kg | 5 kg, Balde 18 kg |
| `imperall-premium` | 18Kg / 200 kg | 18 kg |
| `instant-pav` | SC 40kg | Saco 25 kg |
| `kiesey` | Bombona de 4,3 kg | 4,3 kg |
| `ligmassa` | Frasco 1L / Galão 5L / Bd 18L | 5 L, 18 L, 900 ml |
| `macdrain-2l` | Rolo 2x30 M² | Rolo 2 x 30 m |
| `macdrain-2l-fp` | Rolo (2x30) M² | Rolo 2 x 30 m |
| `mactra-2000` | 1L / 5L / 18L | Caixa 18 L, 2 L |
| `mactracol` | 1L / 4L / 5L / 18L | Caixa 18 L, 2 L |
| `mactraset` | 9 kg / 18 kg | 18 kg, 9 kg |
| `monopol-pu-25-300ml` | **Cart. 300ml BCO / Cart. 300ml CINZA** | **600 ml / 942 g** ⚠ |
| `premium-poliester` | Bobina 1x10m / paletes 25-30 bobinas | Rolo 3 mm, Rolo 4 mm |
| `po-2` | Caixa 4kg / Caixa 15kg | Balde 15 kg, Galão 4 kg |
| `sika-1` | Saco 1L / Bombona 3,6L / Lata 18L / Tambor 190L | Balde 18 L, 3,6 L |
| `sika-manta-ps` | Tipo II 4mm / Tipo III 4mm | Rolo 3mm ×2, Rolo 4mm ×3 |
| `sika-multiseal` | Rolo 10/15/20/30/45/90 x10 | 10/30/20/15/45/5/50 cm x 10 m |
| `sikafill-rapido` | branco Bd15kg / GL3,6L, concreto Bd15kg / GL3,6L | 15 kg ×2, 3,6 L ×2 |
| `sikaflex-construcao` | Branco CT 300ml / Cinza CT 300ml | 300 ml ×2 |
| `tela-plastica-pvc` | M² | Rolo |
| `tela-vedatrinca-0-10-x-3m` | UN | 0,10 m x 3 m |
| `telhafria` | LT 18kg | 18 kg |
| `tubo-dreno-4-polegadas` | ML | 4" |
| `vedalage-plus` | **Bd 18kg BRANCO / Bd 18kg CONCRETO** | **12 kg, 4 L, 4 kg, 12 kg** ⚠ |
| `vedbem-trinca` | 1,2 Kg | 1,2 L, 280 g |
| `viabit` | Galão 3,6L / Lata 0,9L / Lata 18L / Tambor | 18 L ×2, 900 ml, 3,6 L |
| `viafix-chapisco` | GL 3,6kg / BD 18kg / BC 18kg / Tambor 200L | 200 kg, Balde 18 L |
| `viaflex-fita-aluminizada` | Rolo 0,05 a 0,94 x 10m (7 medidas) | mesmas 7 medidas, unidade cm |
| `viafloor-silicato` | BD 18L / TB 200L | Balde 18 L |
| `viaplus-1000` | CX 18kg | 18 kg |
| `viaplus-5000` | CX. 18kg | 18 kg |
| `viaplus-7000` | CX 18kg | 18 kg |
| `viaplus-dique` | CX 18kg | 18 kg |

⚠ **Dois destes merecem sua atenção**, porque a diferença não parece só de
formatação — parece uma embalagem realmente diferente:
- **`monopol-pu-25-300ml`**: banco diz 300 ml, planilha diz 600 ml/942 g. O
  nome do produto ("...300ML") sugere que o banco está certo e a planilha
  talvez se refira a uma embalagem maior do mesmo produto — mas não tenho
  como confirmar sem checar com você.
- **`vedalage-plus`**: banco diz 18 kg, planilha diz 12 kg / 4 kg / 4 L. Vale
  conferir qual dos dois reflete o produto real, principalmente porque a
  marca desse item também mudou nesta sessão (Viapol → Vedacit).

---

## 5. Descrição diferente da planilha — não é erro, é esperado

**50 produtos** (todos da leva antiga de 54 mantidos do site anterior) têm
descrição que não bate literalmente com a planilha. Isso é esperado e não
mexi em nada: a descrição desses produtos vem do **site antigo**, nunca foi
escrita a partir dessa planilha — só a marca e a embalagem deles é que eu
cruzei com a planilha nesta e na sessão passada. Lista completa em caso de
precisar conferir algum:

```
aplicador-de-sache-600ml, aplicador-de-silicone, bianco, camada-separadora-viapol,
camisa-solodren-4-polegadas, cimento-asfaltico-nbr-9910-tipo-ii, classic-aluminio,
compound-adesivo, compound-adesivo-tix, ecol-2, ecoprimer, eucon-rapid-10,
expansor, fita-vedatrinca-5x5-m, fundo-de-junta-tarucel, fuseprotec-brilhante,
heyd-cryl-mastique, imperall-premium, instant-pav, kiesey, ligmassa, macdrain-2l,
macdrain-2l-fp, mactra-2000, mactracol, mactraset, monopol-pu-25-300ml,
premium-poliester, po-2, selante-pu-30-quartzolit, sika-1, sika-manta-ps,
sika-multiseal, sikafill-rapido, sikaflex-construcao, tela-plastica-pvc,
tela-vedatrinca-0-10-x-3m, telhafria, tubo-dreno-4-polegadas, vedalage-plus,
vedbem-trinca, viabit, viafix-chapisco, viaflex-fita-aluminizada,
viafloor-silicato, viaplus-1000, viaplus-5000, viaplus-7000, viaplus-dique,
viaplus-st-acelerado
```

Separadamente, **7 produtos novos** desta leva de 63 têm descrição que não
bate *literalmente* com a planilha, mas por um motivo diferente e proposital:
a planilha tem uma linha por cor (cinza/branco/preto) e eu combinei numa frase
só, já que o site trata isso como um produto único com variação de cor —
decisão tomada e explicada na sessão anterior. Não é erro:
`pu-40-multiuso-quartzolit`, `sikaflex-101-sela-plus`, `sikaflex-universal`,
`super-manta-liquida`, `ultraflex-pu-40`, `vedax-max-manta-liquida`,
`vedax-pu-flex`.

---

## 6. Não deu para verificar — 4 produtos

A planilha traz marcas diferentes para SKUs que o site trata como um produto
só, então não dá pra atribuir uma marca sem chutar. Deixei como estão (mesma
decisão da sessão anterior):

| id | nome | o problema |
|---|---|---|
| `broxa-retangular` | BROXA RETANGULAR | planilha tem 3 fabricantes (Tigre, Compel, Roma) pro mesmo item no site |
| `pincel-2-polegadas` | PINCEL 2 polegadas | mesma coisa — Compel e Roma |
| `pincel-3-polegadas` | PINCEL 3 polegadas | mesma coisa — Compel e Roma |
| `tela-de-poliester` | TELA DE POLIESTER | uma linha sem marca, outra com marca "Acqua", não dá pra saber se é o mesmo item |

---

## Resumo

| | quantidade |
|---|---|
| Produtos sem nenhuma divergência | 1 |
| Marca corrigida automaticamente | 4 |
| Embalagem preenchida automaticamente (estava vazia) | 60 |
| Embalagem diferente da planilha, não mexi (dado antigo mais rico) | 48 |
| Descrição diferente da planilha — esperado (produto antigo ou cor combinada) | 57 |
| Não deu pra verificar (marca ambígua entre fabricantes) | 4 |
| **Total de produtos** | **117** |

## Arquivos alterados nesta sessão

- `public_html/api/seed.json` — 4 marcas corrigidas + 60 embalagens preenchidas.
- `public_html/js/seed-data.js` — regenerado a partir do seed.json; +2 marcas novas (Acqua, Monopol).
- `public_html/produtos.html`, `public_html/admin.html` — opções "Acqua" e "Monopol" nos filtros/formulário de marca.
- `public_html/api/db.php` — duas migrações novas, guardadas por chave em `settings`, cada uma roda uma vez só na primeira visita depois do deploy:
  - `seed_backfill_vazios()`: agora também preenche `embalagem` além de marca/descrição.
  - `seed_corrigir_conhecidos()`: corrige a marca dos 4 produtos da seção 2, só se o valor no banco ainda for exatamente o valor errado conhecido (não mexe se você já tiver corrigido manualmente).

Tudo testado localmente simulando o banco "desatualizado" (como deve estar a
produção hoje) antes e depois das migrações — as duas rodam certo e não
duplicam se rodar de novo.
