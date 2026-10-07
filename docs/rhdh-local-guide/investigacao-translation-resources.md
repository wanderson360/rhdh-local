# Investigação: `translationResources` em plugins dinâmicos

## Resumo

`translationResources` é uma configuração de integração do frontend do RHDH.
Ela associa recursos de tradução exportados por um plugin dinâmico ao
aplicativo. A exportação Scalprum do plugin disponibiliza módulos e bundles,
mas não torna essa configuração efetiva por si só: o RHDH precisa carregar a
configuração de frontend no runtime.

Um plugin distribuído por OCI pode usar `translationResources`, desde que a
imagem contenha um export Scalprum válido e a configuração de runtime associe
os recursos às referências corretas. Instalar ou ver o plugin na lista de
plugins carregados não prova, sozinho, que os recursos de tradução foram
registrados.

Esta investigação foi feita no checkout `rhdh-local` e na instância RHDH Local
disponível em **7 de outubro de 2026**. Não foram inspecionados os scripts,
workflows ou manifests proprietários do ambiente FusionX/OCI; conclusões sobre
essa pipeline devem ser verificadas nela.

## Respostas às perguntas

### 1. `app-config.janus-idp.yaml` é consumido automaticamente?

O nome do arquivo, isoladamente, não comprova que qualquer empacotador ou
runtime vá consumi-lo. Um arquivo só participa do processo se o script de
build, o entrypoint, o chart/operator ou o comando do Backstage o incluir
explicitamente.

Neste repositório, `app-config.janus-idp.yaml` não existe. O entrypoint da
aplicação passa explicitamente ao processo Backstage:

- `app-config.yaml`;
- `app-config.example.yaml`;
- `app-config.example.production.yaml`;
- o `app-config.dynamic-plugins.yaml` gerado pelo instalador;
- `app-config.patched.yaml`;
- e, se existir, `configs/app-config/app-config.local.yaml`.

Referência: [`wait-for-plugins-and-start.sh`](../../wait-for-plugins-and-start.sh).

O instalador seleciona `configs/dynamic-plugins/dynamic-plugins.override.yaml`,
o arquivo legado `configs/dynamic-plugins.yaml`, ou o arquivo padrão
`configs/dynamic-plugins/dynamic-plugins.yaml`. Ele então executa
`install-dynamic-plugins.sh /dynamic-plugins-root`.

Referência: [`prepare-and-install-dynamic-plugins.sh`](../../prepare-and-install-dynamic-plugins.sh).

No projeto público `redhat-developer/rhdh-plugins`, a ferramenta de migração
renomeia `app-config.janus-idp.yaml` para `app-config.yaml`; essa operação não
demonstra que o runtime trate o nome antigo como ponto de entrada automático:
[código da migração Janus](https://github.com/redhat-developer/rhdh-plugins/blob/1ceabb441304fad69e1fd7c3a6fcf5a789753e0c/workspaces/repo-tools/packages/cli/src/commands/plugin/janus-migration.ts).

**Conclusão:** só a pipeline e o comando de inicialização do FusionX podem
confirmar se aquele arquivo é incorporado. Verifique os argumentos `--config`,
as cópias de arquivos nas imagens e os manifests/chart usados na implantação.

### 2. O arquivo é atualizado durante build/export?

Não há no checkout local evidência de que a exportação do plugin atualize
`app-config.janus-idp.yaml`.

O workspace declara:

- `export-dynamic`: `janus-cli package export-dynamic-plugin --in-place`;
- `files`: `dist` e `dist-scalprum`;
- `scalprum.name`: `internal.plugin-translations-pt`;
- módulos Scalprum `PluginRoot` e `Alpha`.

Referência: [`plugins/translations-pt/package.json`](../../plugins/translations-pt/package.json).

O validador verifica o manifesto Scalprum, os scripts declarados, os bundles
expostos e as mensagens pt-BR, mas não modifica nem valida arquivos
`app-config*.yaml`.

Referência: [`validate-export.mjs`](../../plugins/translations-pt/tools/validate-export.mjs).

**Conclusão:** nesta implementação, exportar gera e valida o artefato do
plugin. O wiring de `translationResources` precisa vir de configuração
carregada separadamente, salvo se uma etapa específica da pipeline FusionX
implementar explicitamente essa integração.

### 3. Existe código no repositório local que interpreta `translationResources`?

O checkout `rhdh-local` contém configuração YAML e scripts para escolher arquivos,
instalar plugins e passar a configuração gerada ao processo Backstage. Não
contém o código-fonte interno do Dynamic Plugin Manager nem uma implementação
própria do parser de `translationResources`.

A configuração padrão associa três recursos ao módulo `Alpha`:

- `catalogTranslationsPT` → `catalogTranslationRef`;
- `catalogReactTranslationsPT` → `catalogReactTranslationRef`;
- `coreComponentsTranslationsPT` → `coreComponentsTranslationRef`.

Referência: [`configs/dynamic-plugins/dynamic-plugins.yaml`](../../configs/dynamic-plugins/dynamic-plugins.yaml).

Na documentação oficial do RHDH, a chave em
`dynamicPlugins.frontend.<nome>` deve corresponder a `scalprum.name` do pacote.
A documentação também mostra `translationResources` como parte da configuração
de plugins frontend:
[Frontend Plugin Wiring (RHDH)](https://github.com/redhat-developer/rhdh/blob/main/docs/dynamic-plugins/frontend-plugin-wiring.md).

### 4. O runtime suporta `translationResources` em plugins OCI?

A documentação de frontend wiring do RHDH descreve `translationResources` como
configuração de frontend dinâmico, sem limitá-la a pacotes locais. Em termos de
runtime, OCI é um meio de distribuir o pacote; o pacote instalado ainda precisa
expor os módulos que a configuração referencia.

No RHDH Local usado nesta investigação, a instância era
`quay.io/rhdh-community/rhdh:1.10.3`. A configuração gerada continha
`internal.plugin-translations-pt` e os três recursos. O pacote instalado
continha `dist-scalprum/plugin-manifest.json`, bundle `exposed-Alpha` e bundle
`exposed-PluginRoot`. Depois de reiniciar o serviço RHDH, os endpoints dos
bundles Scalprum responderam HTTP 200 e o Catalog mostrou traduções como
“Catálogo de Minha Organização”, “Criar” e “Filtros”.

Esse teste confirma o fluxo local. Não comprova que a imagem, o manifest de
instalação OCI ou o `app-config.janus-idp.yaml` específico do FusionX estejam
corretos; esses itens precisam ser validados no ambiente correspondente.

### 5. Como evidenciar o registro do módulo `Alpha` e dos recursos?

Valide a cadeia em camadas. Cada evidência responde uma pergunta diferente:

1. **Pacote construído:** confirme no `package.json` incluído na imagem os
   campos `scalprum.name` e `scalprum.exposedModules.Alpha`.
2. **Export gerado:** confira `dist-scalprum/plugin-manifest.json`, os scripts
   listados em `loadScripts`, e `static/exposed-Alpha*.js`. Procure também os
   nomes `catalogTranslationsPT`, `catalogReactTranslationsPT` e
   `coreComponentsTranslationsPT` no bundle `Alpha`.
3. **Pacote instalado:** confirme que os mesmos arquivos estão na pasta real
   do plugin instalado no volume do RHDH.
4. **Configuração efetiva:** leia o `app-config.dynamic-plugins.yaml` produzido
   pelo instalador e confirme:
   - a chave da entrada frontend corresponde exatamente a `scalprum.name`;
   - `importName`, `module: Alpha` e `ref` existem e são compatíveis;
   - a configuração resultante foi passada ao processo do backend.
5. **Disponibilidade HTTP:** solicite os assets do manifesto e os módulos
   expostos pelos endpoints Scalprum e verifique HTTP 200. Um 200 comprova que
   o asset está sendo servido, mas não prova que o recurso foi registrado ou
   selecionado pelo i18n.
6. **Comportamento:** selecione `pt-BR`, carregue uma tela que use as
   referências traduzidas e confirme mensagens traduzidas. Teste também uma
   chave não traduzida: como os recursos são parciais, ela deve usar o fallback
   original.
7. **Console do navegador:** procure avisos de plugin mal configurado, módulo
   não encontrado, `importName` inexistente, ou referência de tradução
   inválida. A ausência de erros é útil, mas o teste visual continua necessário.

O validador local automatiza parte das etapas 1 e 2 por meio de:

```sh
yarn workspace @empresa/translations-pt export-dynamic:check
```

Ele não prova que o arquivo YAML foi carregado pelo runtime, nem que a UI
selecionou o locale esperado.

### 6. Como fazer uma validação funcional no ambiente final?

Execute a verificação no mesmo ambiente, imagem e release em que o defeito foi
observado:

1. Registre a tag/digest da imagem OCI e da imagem RHDH.
2. Inspecione o `package.json` e `plugin-manifest.json` do pacote OCI já
   instalado, não somente o workspace usado para produzir a imagem.
3. Determine qual arquivo de plugins dinâmicos o instalador realmente leu.
   Inspecione a configuração gerada após includes, overrides e substituições.
4. Confirme que `internal.plugin-translations-pt` é exatamente o
   `scalprum.name` e que está sob `dynamicPlugins.frontend`.
5. Confirme que a versão instalada expõe `Alpha` e seus três `importName`s; não
   deduza isso apenas da presença do plugin na tela *Sources*.
6. Verifique que o runtime serve com HTTP 200 o script do manifesto e os
   bundles do módulo `Alpha`.
7. Carregue a aplicação com `pt-BR` selecionado, teste textos cobertos pelos
   recursos e compare uma chave não traduzida para observar o fallback.
8. Capture os logs de inicialização, o console do navegador, a configuração
   efetiva e os resultados HTTP junto ao digest dos artefatos. Isso torna o
   resultado reproduzível.

Se todos os assets estiverem disponíveis, mas a UI mantiver as chaves originais
ou o texto padrão, investigue primeiro se a configuração foi carregada e se os
nomes `scalprum.name`, módulo, `importName` e `ref` correspondem exatamente.
Não trate a simples presença do plugin no gerenciador como prova de registro de
suas traduções.

## Evidências do checkout e limites

| Verificação | Resultado |
| --- | --- |
| `app-config.janus-idp.yaml` presente no checkout | Não |
| Entry point passa o app-config dinâmico gerado ao backend | Sim |
| Configuração local define os três `translationResources` | Sim |
| Export define `scalprum.name` e módulo `Alpha` | Sim |
| Manifesto e bundle `Alpha` presentes no volume instalado local | Sim |
| Assets Scalprum retornaram HTTP 200 após reiniciar o serviço | Sim |
| Traduções pt-BR visíveis no Catalog local | Sim |
| Scripts/manifests específicos da pipeline FusionX examinados | Não |

O estado do runtime local pode mudar depois desta investigação. Repita as
verificações antes de usar os resultados como evidência de uma implantação
posterior.

## Referências

- [RHDH: Frontend Plugin Wiring](https://github.com/redhat-developer/rhdh/blob/main/docs/dynamic-plugins/frontend-plugin-wiring.md)
- [RHDH: Installing Plugins](https://github.com/redhat-developer/rhdh/blob/main/docs/dynamic-plugins/installing-plugins.md)
- [Backstage: Internationalization](https://github.com/backstage/backstage/blob/master/docs/plugins/internationalization.md)
- [Migração de `app-config.janus-idp.yaml` no repositório de plugins](https://github.com/redhat-developer/rhdh-plugins/blob/1ceabb441304fad69e1fd7c3a6fcf5a789753e0c/workspaces/repo-tools/packages/cli/src/commands/plugin/janus-migration.ts)
