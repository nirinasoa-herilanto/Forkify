import View from './View.js';

import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      e.preventDefault();

      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = Number(btn.dataset.goto);

      handler(goToPage);
    });
  }

  _generateMarkup() {
    const currentPage = this._data.page;

    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // page 1, and others pages
    if (currentPage === 1 && numPages > 1) {
      return this._generateMarkupButtonNext(currentPage);
    }

    // last page
    if (currentPage === numPages && numPages > 1) {
      return this._generateMarkupButtonPrev(currentPage);
    }

    // others page
    if (currentPage < numPages) {
      return `
        ${this._generateMarkupButtonPrev(currentPage)}
        ${this._generateMarkupButtonNext(currentPage)}
      `;
    }

    // page 1, and no other page
    return '';
  }

  _generateMarkupButtonPrev(i) {
    return `
      <button data-goto="${i - 1}" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${i - 1}</span>
      </button>
    `;
  }

  _generateMarkupButtonNext(i) {
    return `
        <button data-goto="${i + 1}" class="btn--inline pagination__btn--next">
          <span>Page ${i + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
  }
}

export default new PaginationView();
