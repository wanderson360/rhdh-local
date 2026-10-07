import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { catalogReactTranslationRef } from '@backstage/plugin-catalog-react/alpha';

const catalogReactMessagesPT = createTranslationMessages({
  ref: catalogReactTranslationRef,
  full: false,
  messages: {
  'catalogFilter.title': 'Filtros',
  'catalogFilter.buttonTitle': 'Filtros',
  'entityKindPicker.title': 'Tipo',
  'entityKindPicker.errorMessage': 'Falha ao carregar os tipos de entidade',
  'entityLifecyclePicker.title': 'Ciclo de vida',
  'entityNamespacePicker.title': 'Namespace',
  'entityOwnerPicker.title': 'Responsável',
  'entityProcessingStatusPicker.title': 'Status de processamento',
  'entityTagPicker.title': 'Tags',
  'entitySearchBar.placeholder': 'Pesquisar',
  'entityTypePicker.title': 'Categoria',
  'entityTypePicker.errorMessage': 'Falha ao carregar as categorias de entidade',
  'entityTypePicker.optionAllTitle': 'todas',
  'favoriteEntity.addToFavorites': 'Adicionar aos favoritos',
  'favoriteEntity.removeFromFavorites': 'Remover dos favoritos',
  'userListPicker.defaultOrgName': 'Organização',
  'userListPicker.personalFilter.title': 'Pessoal',
  'userListPicker.personalFilter.ownedLabel': 'De minha responsabilidade',
  'userListPicker.personalFilter.starredLabel': 'Favoritos',
  'userListPicker.orgFilterAllLabel': 'Todos',
  'entityTableColumnTitle.name': 'Nome',
  'entityTableColumnTitle.system': 'Sistema',
  'entityTableColumnTitle.owner': 'Responsável',
  'entityTableColumnTitle.type': 'Categoria',
  'entityTableColumnTitle.lifecycle': 'Ciclo de vida',
  'entityTableColumnTitle.namespace': 'Namespace',
  'entityTableColumnTitle.description': 'Descrição',
  'entityTableColumnTitle.tags': 'Tags',
  'entityTableColumnTitle.targets': 'Destinos',
  'entityTableColumnTitle.title': 'Título',
  'entityTableColumnTitle.label': 'Rótulo',
  'entityTableColumnTitle.domain': 'Domínio',
  },
});

export default catalogReactMessagesPT;
