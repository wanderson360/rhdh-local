# Plugin de traduções pt-BR para RHDH

Este workspace fornece traduções parciais para português do Brasil (`pt-BR`)
dos seguintes recursos:

- Backstage Catalog (`catalog`);
- componentes React do Catalog (`catalog-react`);
- componentes compartilhados (`core-components`).

O RHDH continua usando e renderizando os plugins originais. Este pacote
acrescenta mensagens traduzidas às referências de tradução desses plugins,
sem exigir alterações no código-fonte do RHDH nem dos plugins traduzidos.
Mensagens não incluídas aqui continuam usando as traduções padrão da
plataforma.

> **Compatibilidade:** as dependências e o comando de exportação deste exemplo
> estão alinhados ao ambiente RHDH 1.10.x deste repositório. Antes de usar em
> outra versão, alinhe as versões Backstage/RHDH e a CLI de exportação às
> dependências e aos padrões do monorepo de destino. A instalação local foi
> validada aqui; a pipeline do monorepo de destino ainda deve ser validada.

## 1. Adicionar o plugin a um monorepo Yarn

Copie a pasta `plugins/translations-pt` para o monorepo da empresa. Não é
necessário publicar o pacote nem instalá-lo de um registry: ele será um
workspace local.

Confira o `package.json` raiz. A lista de workspaces precisa incluir a pasta do
plugin, por exemplo:

```json
{
  "workspaces": [
    "packages/*",
    "plugins/*"
  ]
}
```

Se o monorepo já usa outro padrão para plugins, mantenha o padrão existente e
confirme que `plugins/translations-pt` está incluído. O nome do workspace é
`@empresa/translations-pt`.

### Alinhar dependências

As versões Backstage declaradas em
`plugins/translations-pt/package.json` devem ser compatíveis com a versão do
RHDH e com as versões já usadas pelo portal. Confira especialmente
`@backstage/core-plugin-api`, `@backstage/core-components`,
`@backstage/plugin-catalog`, `@backstage/plugin-catalog-react` e a CLI usada
para exportar plugins dinâmicos. Use as versões aprovadas pelo monorepo; não
copie automaticamente os números deste exemplo para outra versão do RHDH.

Instale ou atualize dependências segundo o processo normal da empresa, usando
o registry Yarn corporativo configurado pelo monorepo. Atualize e versione o
`yarn.lock` do monorepo conforme a política da equipe. Não é necessário
adicionar registry, token ou `.yarnrc.yml` deste repositório.

## 2. Compilar e gerar o artefato

Da raiz do monorepo:

```sh
yarn workspace @empresa/translations-pt tsc
yarn workspace @empresa/translations-pt export-dynamic:check
```

O script `export-dynamic:check` executa a exportação e valida
`plugins/translations-pt/dist-scalprum/`. A validação falha se não encontrar o
manifesto Scalprum, os scripts referenciados pelo manifesto, os módulos
expostos `PluginRoot` e `Alpha`, os três recursos de tradução do Catalog ou
uma mensagem pt-BR do Catalog no bundle. Esse diretório é gerado e ignorado
pelo Git. A pipeline deve executar a exportação validada e disponibilizar
`dist-scalprum/` junto do pacote no estágio/imagem usado pelo instalador de
plugins dinâmicos. Não basta copiar somente os arquivos TypeScript para a
imagem que executa o RHDH.

O script atual usa `@janus-idp/cli` e o comando
`janus-cli package export-dynamic-plugin --in-place`, compatível com o teste
local deste repositório. Se a versão de RHDH da empresa usa outra CLI ou outro
comando de exportação, ajuste o script aos padrões dessa versão e valide o
bundle gerado antes de publicar o artefato.

## 3. Habilitar no RHDH

Na configuração de plugins dinâmicos consumida pela aplicação, habilite o
pacote e associe cada recurso exportado à sua referência de tradução:

```yaml
plugins:
  - package: ./plugins/translations-pt
    disabled: false
    pluginConfig:
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

O caminho de `package` precisa apontar para o local onde o pacote e seu
`dist-scalprum/` estarão disponíveis no ambiente de execução. Se a empresa
mantém um arquivo de override de plugins dinâmicos, inclua a entrada nele.
Um override pode substituir a lista padrão, então confirme que não está
removendo a configuração do plugin.

Habilite também o idioma na configuração da aplicação:

```yaml
i18n:
  defaultLocale: pt-BR
  locales:
    - pt-BR
```

`defaultLocale` seleciona pt-BR como idioma padrão e `locales` declara os
idiomas oferecidos. Reinicie ou reimplante a aplicação para que o instalador e
o frontend carreguem a nova configuração.

## 4. Traduzir outro plugin: exemplo com Argo CD

O mesmo padrão pode ser usado para acrescentar traduções a outro plugin sem
alterar seu código-fonte. O exemplo abaixo é para o plugin da comunidade
Backstage `@backstage-community/plugin-argocd`, que exporta
`argocdTranslationRef` pelo subpath `@backstage-community/plugin-argocd/translations`.
O ID do plugin na configuração dinâmica é
`backstage-community.plugin-argocd`.

Confirme primeiro qual pacote de Argo CD está instalado no monorepo e se ele
exporta uma referência de tradução. Distribuições RHDH podem empacotar uma
versão ou variante diferente. Nesse caso, use o pacote, o subpath, o ID do
plugin e as chaves disponíveis nessa versão, em vez de presumir que são iguais
aos do exemplo da comunidade.

### 4.1 Declarar a dependência

Adicione ao `plugins/translations-pt/package.json` a dependência do pacote
Argo CD e use a versão compatível já aprovada pelo monorepo:

```json
{
  "dependencies": {
    "@backstage-community/plugin-argocd": "<versão compatível usada pelo monorepo>"
  }
}
```

Preserve as outras dependências que já existem no arquivo. Depois atualize o
`yarn.lock` pelo fluxo corporativo.

### 4.2 Criar as mensagens parciais

Crie `plugins/translations-pt/src/translations/argocd-pt.ts`:

```ts
import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { argocdTranslationRef } from '@backstage-community/plugin-argocd/translations';

export default createTranslationMessages({
  ref: argocdTranslationRef,
  full: false,
  messages: {
    'appStatus.appHealthStatus.Healthy': 'Saudável',
    'appStatus.appSyncStatus.Synced': 'Sincronizado',
    'deploymentLifecycle.deploymentLifecycle.title':
      'Ciclo de vida da implantação',
  },
});
```

As chaves acima correspondem ao formato de mensagens do plugin da comunidade.
Consulte a referência e os arquivos de idioma da versão exata instalada para
copiar as chaves corretas:

- [Referência de mensagens Argo CD](https://github.com/backstage/community-plugins/blob/main/workspaces/argocd/plugins/argocd/src/translations/ref.ts)
- [Recursos de tradução Argo CD](https://github.com/backstage/community-plugins/tree/main/workspaces/argocd/plugins/argocd/src/translations)

`full: false` declara uma tradução parcial: chaves omitidas continuam com a
mensagem padrão. Preserve placeholders como `{{appName}}` exatamente como
aparecem no texto original.

### 4.3 Registrar e exportar o recurso

Em `plugins/translations-pt/src/translations/index.ts`, importe a referência:

```ts
import { argocdTranslationRef } from '@backstage-community/plugin-argocd/translations';
```

Crie o recurso, no mesmo padrão dos recursos existentes:

```ts
export const argocdTranslationsPT = createTranslationResource({
  ref: argocdTranslationRef,
  translations: {
    'pt-BR': () => import('./argocd-pt'),
  },
});
```

Exporte `argocdTranslationsPT` e `argocdTranslationRef` por
`src/translations/index.ts` e por `src/alpha.ts`, para que fiquem disponíveis
no módulo `Alpha` do pacote.

Adicione mais um recurso à lista `translationResources` do plugin
`internal.plugin-translations-pt`:

```yaml
              - importName: argocdTranslationsPT
                module: Alpha
                ref: argocdTranslationRef
```

Essa associação registra a referência `plugin.argocd` junto ao plugin de
traduções. O plugin Argo CD original continua instalado e configurado
normalmente. Não é necessário editar a configuração dele apenas para registrar
essas mensagens adicionais.

Depois, rode o typecheck e a exportação do plugin de traduções e execute a
pipeline. A configuração do plugin Argo CD deve permanecer habilitada para que
suas páginas e componentes sejam renderizados.

## 5. Validar o deploy

Após o deploy:

1. Confirme que o instalador de plugins encontrou e instalou
   `translations-pt`, sem erro de manifesto ou dependências.
2. No navegador, abra DevTools → **Network** e confirme que os assets do
   plugin de traduções foram carregados com sucesso.
3. Confira se a interface está usando `pt-BR` e teste pelo menos uma chave
   traduzida em cada plugin.
4. Confira também uma mensagem que não foi traduzida: por ser uma tradução
   parcial, ela deve continuar usando o fallback da plataforma.

Uma validação com `yarn start` não substitui esse teste. No deploy, é preciso
validar tanto a configuração de idioma e de plugins dinâmicos quanto a presença
do `dist-scalprum/` no artefato que chega ao ambiente de execução.
