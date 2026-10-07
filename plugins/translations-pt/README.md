# Portuguese translations plugin

This Yarn workspace provides Brazilian Portuguese (`pt-BR`) resources for the
Backstage Catalog, Catalog React components, and core components. The dynamic
plugin exports its translation resources separately from `PluginRoot` so
RHDH 1.10.x can load them through Scalprum.

## Local workspace setup

This plugin can be copied into an existing Yarn monorepo under `plugins/`.
The monorepo must include `plugins/*` in its Yarn workspaces; add that pattern
to the root `package.json` if it is not already present. No root manifest or
registry configuration from this local test repository is required.

```sh
yarn workspace @empresa/translations-pt tsc
yarn workspace @empresa/translations-pt export-dynamic
```

Run the export after dependency installation in CI. It creates the
`dist-scalprum/` bundle that the RHDH dynamic plugin loader consumes. The
generated bundle is intentionally ignored by Git; publish/package it as a
build artifact or include it in the deployment image produced by the pipeline.
The plugin does not need to be published to a package registry.

## Configure the consuming RHDH app

Enable the plugin and register its three translation resources in the
consuming app's dynamic plugin configuration:

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

Set Brazilian Portuguese as an available and default locale in the app config:

```yaml
i18n:
  defaultLocale: pt-BR
  locales:
    - pt-BR
```

The three resource declarations bind partial translations to the Catalog,
Catalog React, and core-components translation references. Existing English
messages not included in the partial resources continue to use their defaults.

## Enable in this RHDH local app

In this repository, `configs/dynamic-plugins/dynamic-plugins.yaml` contains
the plugin registration and `configs/app-config/app-config.local.example.yaml`
shows the locale configuration. The Compose install service mounts the local
workspace for testing; that mount is specific to this repository and is not
required when another monorepo builds the plugin into its deployment artifact.
