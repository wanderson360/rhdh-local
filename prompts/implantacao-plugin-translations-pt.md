# Prompt para implantar o plugin de traduções pt-BR

Copie o prompt abaixo para o agente de IA que vai executar a implantação. Ele
foi escrito para este repositório, mas orienta o agente a validar as diferenças
caso o destino seja outro monorepo RHDH/Backstage.

```text
Você é um agente de engenharia responsável por integrar e implantar neste
repositório o plugin local de traduções pt-BR para o Red Hat Developer Hub
(RHDH).

## Objetivo

Entregar o plugin `translations-pt` funcional no RHDH: suas traduções parciais
devem ser exportadas, instaladas e carregadas no frontend, mantendo as mensagens
originais como fallback para chaves que não tenham tradução.

O código-fonte de referência está em `plugins/translations-pt/`. Ele fornece
traduções para:
- `@backstage/plugin-catalog`;
- `@backstage/plugin-catalog-react`;
- `@backstage/core-components`.

Os recursos são registrados no módulo dinâmico `Alpha`, com o ID
`internal.plugin-translations-pt`, e o locale é `pt-BR`.

## Antes de alterar arquivos

1. Leia `plugins/translations-pt/README.md`, o `package.json` do plugin e os
   arquivos de configuração relevantes do destino.
2. Confira a versão do RHDH/Backstage, as versões dos pacotes `@backstage/*`,
   a CLI de exportação de plugins dinâmicos e o gerenciador de pacotes do
   destino. A configuração atual deste repositório não prova compatibilidade
   com outro monorepo ou outra versão.
3. Inspecione o estado do Git e preserve todas as alterações existentes,
   inclusive alterações staged, unstaged e arquivos não rastreados. Não reverta,
   substitua nem reescreva mudanças do usuário.
4. Identifique o mecanismo real usado pelo destino para empacotar e instalar
   plugins dinâmicos locais. Não presuma que copiar apenas os arquivos TypeScript
   ou adicionar uma entrada YAML seja suficiente.

Se o destino for este repositório, considere especialmente:
- `package.json` na raiz e o workspace Yarn `@empresa/translations-pt`;
- `plugins/translations-pt/package.json` e seu script
  `export-dynamic:check`;
- `configs/dynamic-plugins/dynamic-plugins.yaml` e
  `configs/dynamic-plugins/dynamic-plugins.override.example.yaml`;
- `configs/app-config/app-config.local.example.yaml`;
- `compose.yaml`, `prepare-and-install-dynamic-plugins.sh` e
  `docs/rhdh-local-guide/dynamic-plugins-management.md`.

Use as configurações e scripts existentes como referência, mas confirme que
eles entregam o artefato exportado ao instalador e ao runtime. O README do
plugin registra que a exportação gera `dist-scalprum/` e que a pipeline ou
imagem de destino precisa disponibilizar esse diretório junto do pacote.

## Trabalho esperado

1. Complete somente a integração que estiver faltando no destino. Reutilize os
   arquivos e padrões existentes; evite duplicar configuração ou alterar
   componentes do RHDH/Backstage para traduzir mensagens.
2. Alinhe dependências e CLI às versões compatíveis com o RHDH do destino.
   Preserve as regras de workspace, lockfile e registry já adotadas pelo
   projeto. Não copie versões de dependências de exemplo sem validá-las.
3. Garanta que a exportação dinâmica exponha `PluginRoot` e `Alpha`, gere os
   três recursos de tradução registrados e inclua as mensagens pt-BR no
   bundle.
4. Configure o plugin no mecanismo de plugins dinâmicos do projeto com:
   - pacote apontando para o local real do pacote exportado;
   - `disabled: false`;
   - ID `internal.plugin-translations-pt`;
   - `translationResources` correspondentes a
     `catalogTranslationsPT`, `catalogReactTranslationsPT` e
     `coreComponentsTranslationsPT`, no módulo `Alpha`, usando as referências
     corretas do Catalog, Catalog React e core components.
5. Habilite `pt-BR` na configuração de internacionalização da aplicação,
   respeitando o padrão de configuração local/override do destino. Não substitua
   configurações do usuário nem remova idiomas já suportados.
6. Atualize documentação diretamente relacionada somente se o fluxo de
   implantação ou configuração exigir uma instrução nova.
7. Não adicione credenciais, tokens ou segredos. Não altere registry corporativo
   ou faça publicação de pacote sem necessidade e autorização explícitas.

## Validação

Execute os menores comandos existentes que validem a integração. Neste
repositório, use como referência:

    yarn workspace @empresa/translations-pt tsc
    yarn workspace @empresa/translations-pt export-dynamic:check

Se alguma validação depender de dependências ainda não instaladas, explique o
bloqueio antes de instalar ou modificar manifests. Quando o ambiente permitir,
valide também a configuração YAML e confirme que o processo de instalação
carrega o plugin exportado. Não afirme que o plugin foi executado no RHDH se
somente compilação/exportação tiver sido testada.

## Critérios de aceite

- O bundle exportado contém manifesto válido, scripts referenciados, módulos
  `PluginRoot` e `Alpha`, os três recursos de tradução e mensagens pt-BR.
- A configuração do runtime habilita o plugin e associa cada recurso à
  referência correta.
- `pt-BR` está configurado sem eliminar opções de idioma existentes.
- Dependências e exportação são compatíveis com a versão RHDH efetivamente
  usada pelo destino.
- Testes/validações executados e resultados (inclusive bloqueios) são
  relatados.
- O diff contém apenas mudanças necessárias à implantação.

Ao concluir, resuma os arquivos alterados, como a instalação funciona, os
comandos de validação executados e qualquer etapa operacional que ainda dependa
de acesso ao registry, imagem ou ambiente RHDH.
```
