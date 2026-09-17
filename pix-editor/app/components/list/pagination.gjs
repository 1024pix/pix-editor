import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import Component from '@glimmer/component';

function elementCount(total) {
  if (total <= 1) return `${total} élément`;
  return `${total} éléments`;
}

export default class Pagination extends Component {
  get first() {
    if (!this.args.pagination) return 0;
    const { page, pageSize } = this.args.pagination;
    return (page - 1) * pageSize + 1;
  }

  get last() {
    if (!this.args.pagination) return 0;
    const { rowCount, pageSize } = this.args.pagination;
    return Math.min(rowCount, this.first + pageSize - 1);
  }

  get texts() {
    if (!this.args.pagination) return {};
    const { rowCount, page, pageCount } = this.args.pagination;
    return {
      title: 'Voir',
      pageSize: "Nombre d'élément à afficher par page",
      pageElementCount:
        pageCount === 1 ? elementCount(rowCount) : `${this.first}-${this.last} sur ${elementCount(rowCount)}`,
      pageNumber: `Page ${page} / ${pageCount}`,
      previousPage: 'Aller à la page précédente',
      nextPage: 'Aller à la page suivante',
    };
  }

  <template><PixPagination @pagination={{@pagination}} @texts={{this.texts}} /></template>
}
