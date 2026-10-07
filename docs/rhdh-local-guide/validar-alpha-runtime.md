# Validar os exports do módulo `Alpha` no navegador

Este guia verifica se o módulo `Alpha` do plugin
`internal.plugin-translations-pt` efetivamente carregado no navegador expõe os
símbolos que a configuração de plugins dinâmicos referencia e se os recursos
contêm dados pt-BR utilizáveis.

> Use este procedimento no ambiente e na versão que deseja validar. A
> existência do código no workspace, de um pacote instalado ou de um arquivo
> listado em *Sources* não prova, isoladamente, que o módulo esteja registrado
> e funcional.

## Exports esperados

O módulo `Alpha` deve expor estes seis nomes:

| Export | Tipo/uso esperado |
| --- | --- |
| `catalogTranslationsPT` | Recurso de tradução do Catalog |
| `catalogTranslationRef` | Referência de tradução do Catalog |
| `catalogReactTranslationsPT` | Recurso de tradução do Catalog React |
| `catalogReactTranslationRef` | Referência de tradução do Catalog React |
| `coreComponentsTranslationsPT` | Recurso de tradução dos componentes compartilhados |
| `coreComponentsTranslationRef` | Referência de tradução dos componentes compartilhados |

A associação no YAML precisa corresponder aos exports e referências:

```yaml
dynamicPlugins:
  frontend:
    internal.plugin-translations-pt:
      translationResources:
        - importName: catalogTranslationsPT
          module: Alpha
          ref: catalogTranslationRef
        - importName: catalogReactTranslationsPT
          module: Alpha
          ref: catalogReactTranslationRef
        - importName: coreComponentsTranslationsPT
          module: Alpha
          ref: coreComponentsTranslationRef
```

Confirme também que `internal.plugin-translations-pt` é exatamente o
`scalprum.name` do pacote/manifesto instalado.

## Preparação

1. Abra a aplicação RHDH no navegador e autentique-se, se necessário.
2. Selecione `pt-BR` na aplicação quando houver seletor de idioma.
3. Abra as DevTools do navegador (`F12`) e selecione **Network**.
4. Ative **Disable cache** e recarregue a página.
5. Filtre as requisições por `internal.plugin-translations-pt` ou
   `exposed-Alpha`.
6. Confirme que o script do plugin e o bundle `exposed-Alpha` foram solicitados
   com sucesso (HTTP 200). A URL costuma seguir o padrão:

   ```text
   /api/scalprum/internal.plugin-translations-pt/<script-do-manifesto>
   /api/scalprum/internal.plugin-translations-pt/static/exposed-Alpha.<hash>.chunk.js
   ```

   Use o `plugin-manifest.json` do ambiente para obter os nomes exatos dos
   arquivos. O hash muda entre builds. Se as requisições não ocorrerem ou
   retornarem erro, resolva primeiro o carregamento do pacote/manifesto.

## Inspecionar o módulo carregado

O bundle servido ao navegador contém a implementação compilada do módulo.
Para inspecionar os exports reais do módulo carregado — e não somente os nomes
encontrados por busca textual — use um breakpoint durante a inicialização do
módulo:

1. Em **Network**, abra a requisição bem-sucedida de
   `exposed-Alpha.<hash>.chunk.js` e escolha **Open in Sources** (ou localize o
   mesmo arquivo na árvore **Sources**).
2. Selecione **Pretty print** (`{}`) para formatar o bundle compilado. Se houver
   source map, abra também o fonte original associado a `src/alpha.ts`.
3. Localize a função de módulo que declara o namespace de exports. No bundle
   observado neste projeto, ela contém uma chamada compilada semelhante a
   `o.d(t, { ... })`, com os nomes dos exports. Os nomes locais (`o`, `t`, etc.)
   podem mudar em outro build.
4. Coloque um breakpoint na chamada que registra os exports. Recarregue a
   página com o breakpoint ativo. Quando o debugger pausar, avance uma
   instrução para executar a definição dos exports.
5. No painel **Scope**, identifique o objeto de exports do módulo (no bundle
   observado, o parâmetro local `t`). No Console, enquanto a execução continua
   pausada, substitua `t` pelo objeto identificado se o nome for diferente e
   execute:

   ```js
   const expectedExports = [
     'catalogTranslationsPT',
     'catalogTranslationRef',
     'catalogReactTranslationsPT',
     'catalogReactTranslationRef',
     'coreComponentsTranslationsPT',
     'coreComponentsTranslationRef',
   ];

   Object.fromEntries(
     expectedExports.map(name => [
       name,
       Object.prototype.hasOwnProperty.call(t, name),
     ]),
   );
   ```

   O resultado esperado é `true` para todos os seis nomes. Se o Console não
   conseguir acessar o escopo pausado, selecione o frame correto na seção
   **Call Stack** e execute a expressão novamente.

6. Ainda pausado, confira os valores e suas propriedades:

   ```js
   const resourceNames = [
     'catalogTranslationsPT',
     'catalogReactTranslationsPT',
     'coreComponentsTranslationsPT',
   ];

   Object.fromEntries(
     resourceNames.map(name => {
       const resource = t[name];
       return [
         name,
         {
           exists: resource !== undefined && resource !== null,
           type: typeof resource,
           keys:
             resource && typeof resource === 'object'
               ? Object.keys(resource)
               : [],
           refId: resource?.ref?.id,
           locales: Object.keys(resource?.translations ?? {}),
           ptBRLoader:
             typeof resource?.translations?.['pt-BR'] === 'function',
         },
       ];
     }),
   );
   ```

   Para cada recurso, espera-se um objeto não nulo, uma referência (`ref`), um
   locale `pt-BR` e um loader de tradução do tipo função. Se a versão da API
   alterar a forma pública do recurso, compare com os tipos/implementação da
   mesma versão Backstage usada para construir o plugin, em vez de presumir
   campos internos.

7. Verifique as referências separadamente:

   ```js
   const refNames = [
     'catalogTranslationRef',
     'catalogReactTranslationRef',
     'coreComponentsTranslationRef',
   ];

   Object.fromEntries(
     refNames.map(name => {
       const ref = t[name];
       return [
         name,
         {
           exists: ref !== undefined && ref !== null,
           type: typeof ref,
           id: ref?.id,
           keys: ref && typeof ref === 'object' ? Object.keys(ref) : [],
         },
       ];
     }),
   );
   ```

   Confirme que cada referência existe e que o `id` corresponde ao recurso
   associado no YAML. Não compare somente os nomes das variáveis: `ref` é uma
   identidade de API e precisa ser a mesma referência usada pelo recurso.

## Verificar os dados traduzidos carregados

Os recursos carregam os arquivos de mensagens de forma assíncrona. Enquanto o
debugger continua pausado no escopo em que `t` representa os exports de `Alpha`,
guarde temporariamente os três recursos no `globalThis`:

```js
globalThis.__fusionxTranslationsAlphaDebug = {
  catalogTranslationsPT: t.catalogTranslationsPT,
  catalogReactTranslationsPT: t.catalogReactTranslationsPT,
  coreComponentsTranslationsPT: t.coreComponentsTranslationsPT,
};
```

Retome a execução (Resume) e então, no Console, carregue os arquivos
pt-BR e inspecione os valores:

```js
const samples = [
  ['catalogTranslationsPT', 'indexPage.title'],
  ['catalogReactTranslationsPT', 'catalogFilter.buttonTitle'],
  ['coreComponentsTranslationsPT', 'table.body.emptyDataSourceMessage'],
];

const loadedMessages = await Promise.all(
  samples.map(async ([resourceName, sampleKey]) => {
    const resource = globalThis.__fusionxTranslationsAlphaDebug[resourceName];
    const module = await resource.translations['pt-BR']();
    const messages = module.default?.messages ?? module.default;

    return {
      resourceName,
      sampleKey,
      hasMessages:
        messages !== null &&
        typeof messages === 'object' &&
        Object.keys(messages).length > 0,
      sampleValue: messages?.[sampleKey],
      messageKeys: Object.keys(messages ?? {}).length,
    };
  }),
);

console.table(loadedMessages);
```

O formato exato dos objetos de mensagens pode variar com a versão das
dependências. Se `messages` estiver aninhado em outra propriedade, inspecione o
objeto retornado por `await` e confirme a chave de acordo com
`createTranslationMessages` da versão usada pelo pacote.

Valores esperados para as chaves de amostra neste plugin:

- Catalog `indexPage.title`: `Catálogo de {{orgName}}`;
- Catalog React `catalogFilter.buttonTitle`: `Filtros`;
- core components `table.body.emptyDataSourceMessage`:
  `Nenhum registro para exibir`.

Uma chave que não seja traduzida por este plugin não invalida o recurso: as
traduções são parciais e chaves ausentes devem usar o fallback da plataforma.
Após a verificação, remova a referência temporária da página:

```js
delete globalThis.__fusionxTranslationsAlphaDebug;
```

## Critérios de aprovação

Marque cada etapa separadamente; não use uma única evidência para representar
todas as camadas:

| Evidência | Resultado que confirma |
| --- | --- |
| Script do plugin e bundle `exposed-Alpha` retornam HTTP 200 | Os assets estão disponíveis ao navegador |
| Breakpoint mostra os seis nomes no objeto de exports | O módulo carregado expõe os nomes referenciados |
| Recursos são objetos e suas referências/locales correspondem ao esperado | Os valores exportados têm estrutura compatível |
| Loader `pt-BR` resolve e retorna as mensagens esperadas | O conteúdo do recurso está carregável |
| A UI mostra as mensagens traduzidas | O registro e o uso das traduções funcionam de ponta a ponta |

Se os exports e loaders estiverem corretos, mas a interface não traduzir, confira
o locale efetivamente selecionado, o `scalprum.name` usado na configuração, o
`module: Alpha`, cada `importName`/`ref` e os avisos do Console do navegador.

## Limites e segurança

- Os nomes/hashes dos bundles e os identificadores minificados variam por build.
- Source maps podem estar desabilitados no deploy; nesse caso, use o bundle
  formatado e os breakpoints nos módulos compilados.
- Avalie expressões somente para inspeção. Não altere propriedades ou chame
  funções que modifiquem estado da aplicação.
- Não exponha tokens, cookies, credenciais ou conteúdo sensível ao copiar
  resultados de DevTools para tickets ou relatórios.
