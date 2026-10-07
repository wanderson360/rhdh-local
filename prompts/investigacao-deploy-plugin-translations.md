# Prompt: investigar o plugin de traduções no ambiente de deploy

Copie o prompt abaixo para o agente de IA que fará a investigação. O objetivo
é obter uma análise baseada em evidências do artefato efetivamente implantado,
em vez de concluir somente pela ausência de uma pasta em `node_modules`.

```text
Você é um agente de engenharia responsável por investigar o comportamento do
plugin `internal.plugin-translations-pt` no ambiente de deploy FusionX/RHDH.
Compare-o com plugins dinâmicos que aparecem em `node_modules`, como
`backstage-community.plugin-tech-radar` e `backstage.plugin-techdocs`.

## Contexto informado

- Em desenvolvimento, o plugin aparece com pastas como `src`, `webpack` e
  arquivos como `plugin.ts`.
- Em produção/deploy, não se encontra a pasta `translations` nem
  `node_modules/@backstage/internal.plugin-translations-pt`.
- Outros plugins, por exemplo `backstage-community.plugin-tech-radar` e
  `backstage.plugin-techdocs`, aparecem em `node_modules`.
- O plugin de traduções exporta ou deve exportar os módulos Scalprum
  `PluginRoot` e `Alpha`.
- O módulo `Alpha` deve expor:
  - `catalogTranslationsPT` e `catalogTranslationRef`;
  - `catalogReactTranslationsPT` e `catalogReactTranslationRef`;
  - `coreComponentsTranslationsPT` e `coreComponentsTranslationRef`.
- A configuração esperada associa esses recursos ao plugin
  `internal.plugin-translations-pt` sob `dynamicPlugins.frontend`, usando
  `module: Alpha`.

Trate os itens acima como hipóteses/contexto fornecidos, não como evidência
confirmada. Valide-os contra o repositório, as imagens e a configuração
efetivamente implantadas.

## Objetivo da investigação

Determine por que o plugin de traduções não aparece no local esperado durante o
deploy e se isso indica falha real. Diferencie explicitamente:

1. código-fonte do workspace;
2. pacote NPM/workspace e sua instalação em `node_modules`;
3. pacote dinâmico exportado para Scalprum;
4. artefato OCI que contém/distribui o pacote;
5. diretório em que o Dynamic Plugin Manager instala o plugin;
6. registro do módulo e dos recursos de tradução pelo runtime;
7. uso efetivo das mensagens traduzidas na interface.

Não conclua que o plugin não foi implantado apenas porque não existe uma pasta
com o nome esperado em `node_modules`. Primeiro identifique o mecanismo real de
empacotamento e instalação utilizado pelo ambiente.

## Perguntas que devem ser respondidas

1. Por que `internal.plugin-translations-pt` não gera ou não deixa uma pasta
   visível em `node_modules` no deploy, enquanto alguns outros plugins deixam?
2. O build/export do Backstage/RHDH trata plugins internos, workspaces locais e
   pacotes NPM publicados de maneira diferente? Explique o comportamento
   observado neste caso com evidências, sem generalizar além do que foi
   verificado.
3. O arquivo `app-config.janus-idp.yaml` é realmente lido pelo empacotamento
   OCI, pelo Dynamic Plugin Manager ou pelo processo do RHDH? Identifique o
   script, entrypoint, comando, chart ou workflow que o incluiria.
4. Durante build/export, `app-config.janus-idp.yaml` é gerado/atualizado ou
   apenas incluído/referenciado? Mostre o ponto exato do pipeline que comprova
   a conclusão.
5. Existe código no repositório FusionX/RHDH que interpreta
   `translationResources`? Se não houver código-fonte do runtime no
   repositório, declare esse limite e use documentação oficial e evidências de
   execução, sem atribuir ao repositório código que não está presente.
6. O runtime da versão realmente implantada suporta `translationResources`
   para plugins distribuídos por OCI? Diferencie suporte documentado de
   suporte observado na imagem/versão em execução.
7. Como comprovar que o módulo `Alpha` e cada recurso foram carregados e
   registrados corretamente em runtime?
8. Quais verificações reproduzíveis confirmam que o plugin está funcional na
   interface de produção?

## Investigação exigida

Inspecione, conforme disponíveis e relevantes:

- código-fonte do plugin e seus `package.json`;
- `scalprum.name` e `scalprum.exposedModules`;
- configurações `dynamic-plugins.yaml`, overrides e `app-config*.yaml`;
- `plugin-manifest.json` e bundles exportados;
- pacote instalado e conteúdo real da imagem OCI;
- scripts de build, export, instalação e inicialização;
- workflows do GitHub Actions e comandos de publicação;
- logs do build, Dynamic Plugin Manager e backend RHDH;
- configuração efetiva carregada pelo runtime;
- documentação oficial do RHDH, Backstage e ferramentas de exportação usadas
  pelas versões observadas.

Compare o plugin de traduções com pelo menos um plugin dinâmico funcional no
mesmo ambiente. Compare metadados e caminhos de instalação, não apenas nomes
de diretórios. Registre as versões e digests das imagens quando disponíveis.

Para cada afirmação importante, informe a evidência concreta: arquivo e linha
ou caminho dentro da imagem, trecho de log, nome/caminho do manifest, resposta
HTTP, referência documental ou comportamento reproduzido. Separe:

- **Confirmado no código/repositório**;
- **Confirmado no artefato ou runtime**;
- **Documentado oficialmente, mas não reproduzido neste ambiente**;
- **Não verificável com os acessos disponíveis**.

Não exponha tokens, credenciais ou dados sensíveis nos logs ou no relatório.
Não altere configurações de produção nem reinicie serviços sem autorização.

## Checklist técnico de validação

Inclua no relatório um checklist em ordem de execução que cubra:

### A. Artefato construído

- Confirmar o workspace e o nome do pacote.
- Ler `scalprum.name` e validar que o valor coincide com a chave YAML do
  plugin.
- Confirmar que `scalprum.exposedModules` declara `Alpha`.
- Inspecionar `dist-scalprum/plugin-manifest.json`.
- Confirmar que os scripts listados em `loadScripts` existem.
- Confirmar o bundle `static/exposed-Alpha*.js` e os três nomes de recursos.
- Determinar se o `translations` observado em desenvolvimento deveria existir
  no artefato de produção ou se suas mensagens foram incorporadas aos bundles.

### B. Imagem e instalação

- Identificar a imagem OCI, tag/digest e imagem RHDH implantadas.
- Verificar o conteúdo do pacote dentro da imagem OCI.
- Localizar a pasta em que o Dynamic Plugin Manager realmente instalou o
  pacote.
- Comparar esse caminho e o `package.json` instalado com os de um plugin
  funcional.
- Não presumir que o caminho tenha de ser `node_modules/@backstage/...`.

### C. Configuração efetiva

- Identificar qual arquivo de configuração o instalador realmente leu.
- Inspecionar a configuração gerada após includes, merges e overrides.
- Confirmar que `dynamicPlugins.frontend` contém a chave igual a
  `scalprum.name`.
- Para cada recurso, conferir `importName`, `module: Alpha` e `ref` contra os
  exports TypeScript e o bundle da imagem instalada.
- Confirmar que o processo do RHDH recebe essa configuração em runtime.
- Verificar se `pt-BR` está habilitado e selecionado para a sessão testada.

### D. Runtime e interface

- Examinar logs do instalador e do RHDH buscando erro ou aviso sobre o plugin,
  módulo, `importName`, `ref` ou traduções.
- Obter a URL Scalprum a partir do manifest/configuração e confirmar respostas
  HTTP 200 para o script e o módulo `Alpha`.
- Usar o console do navegador para identificar falhas de carregamento ou
  avisos de registro.
- Abrir páginas que usem mensagens cobertas por cada recurso e confirmar
  traduções visíveis.
- Testar ao menos uma chave que não foi traduzida e confirmar o fallback
  esperado para traduções parciais.
- Distinguir explicitamente “plugin listado”, “assets servidos”,
  “Translation Resources registrados” e “tradução visível”; são níveis
  diferentes de evidência.

## Formato da resposta

Apresente:

1. um resumo executivo com a causa mais provável e o nível de confiança;
2. respostas numeradas às oito perguntas;
3. uma tabela de comparação entre `internal.plugin-translations-pt` e o plugin
   funcional, incluindo forma de empacotamento, `scalprum.name`, módulo,
   diretório de instalação e evidência de carregamento;
4. um checklist passo a passo com resultado (`PASS`, `FAIL` ou `NÃO
   VERIFICADO`) e evidência para cada item;
5. os limites da investigação e quais acessos/logs faltam;
6. ações corretivas recomendadas, vinculadas à causa comprovada, sem propor
   mudanças especulativas.

Inclua caminhos absolutos/relativos e linhas quando possível, URLs de
documentação oficial e comandos de verificação seguros. Não responda somente
“sim” ou “não”; explique a diferença entre plugins internos, workspaces locais,
pacotes NPM e plugins dinâmicos OCI no contexto específico encontrado.
```
