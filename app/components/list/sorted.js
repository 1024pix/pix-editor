import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SortedList extends Component {
  listType = 'sorted-list';
  columns = [100];

  @tracked ascending = true;
  @tracked sortField = null;
  @tracked sortType = null;

  sortElements(elements) {
    let field = this.sortField;
    let type = this.sortType;
    let sort1, sort2;
    if (this.ascending) {
      sort1 = -1;
      sort2 = 1;
    } else {
      sort1 = 1;
      sort2 = -1;
    }
    if (type === 'array') {
      elements.sort((a,b) => {
        let val1 = a.get(field);
        let val2 = b.get(field);
        if (val1 && val1.length>0) {
          val1 = val1[0];
        } else {
          val1 = '';
        }
        if (val2 && val2.length>0) {
          val2 = val2[0];
        } else {
          val2 = '';
        }
        if (val1>val2)
          return sort1;
        if (val1<val2)
          return sort2;
        return 0;
      })
    } else if (type === 'string') {
      elements.sort((a,b) => {
        let val1 = a.get(field), val2 = b.get(field);
        if (val1) {
          val1 = val1.toLowerCase();
        } else {
          val1 = '';
        }
        if (val2) {
          val2 = val2.toLowerCase();
        } else {
          val2 = '';
        }
        if (val1>val2) {
          return sort1;
        }
        if (val1<val2) {
          return sort2;
        }
        return 0;
      })
    } else {
      elements.sort((a,b) => {
        let val1 = a.get(field), val2 = b.get(field);
        if (val1) {
          val1 = parseInt(val1);
        } else {
          val1 = 0;
        }
        if (val2) {
          val2 = parseInt(val2);
        } else {
          val2 = 0;
        }
        if (val1>val2) {
          return sort1;
        }
        if (val1<val2) {
          return sort2;
        }
        return 0;
      });
    }
    return elements;
  }

  get sortedList() {
    if (this.sortField) {
      return this.sortElements(this.args.list);
    } else {
      return this.args.list;
    }
  }

  @action
  sortBy(field, type) {
    if (field === this.sortField) {
      this.ascending = !this.ascending;
    } else {
      this.sortField = field;
      this.ascending = true;
    }
    this.sortType = type;
    const className = this.get('listType');
    document.querySelectorAll(`.${className} .list-header .list-item`).forEach(el=>{
      el.classList.remove('sorting');
    });
    const sortElement =  document.querySelector(`.${className} .list-header .list-item.${field}`);
    sortElement.classList.add('sorting');
    if (this.ascending) {
      sortElement.classList.remove('descending');
      sortElement.classList.add('ascending');
    } else {
      sortElement.classList.remove('ascending');
      sortElement.classList.add('descending');
    }
  }
}
