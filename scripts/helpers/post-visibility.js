"use strict";

const {
  filterVisibleTaxonomies,
  getVisibleCollectionLength
} = require("../lib/post-visibility");

hexo.extend.helper.register("cloudTags", function (options = {}) {
  const env = this;
  const source = options.source;
  const minfontsize = options.minfontsize;
  const maxfontsize = options.maxfontsize;
  const limit = options.limit;
  const unit = options.unit || "px";
  const colorful = options.color || false;
  const highlightTags = options.highlightTags || [];

  if (!source || typeof source.forEach !== "function") return "";

  let result = "";
  const tags = [];

  source.forEach(tag => {
    const visibleLength = getVisibleCollectionLength(tag);
    if (visibleLength > 0) {
      tags.push({ tag, visibleLength });
    }
  });

  if (limit > 0) {
    tags.splice(limit);
  }

  const sizes = [];
  tags
    .map(item => item.visibleLength)
    .sort((a, b) => a - b)
    .forEach(length => {
      if (!sizes.includes(length)) sizes.push(length);
    });

  const length = sizes.length - 1;
  tags
    .sort((a, b) => a.tag.name.localeCompare(b.tag.name))
    .forEach(({ tag, visibleLength }) => {
      const ratio = length ? sizes.indexOf(visibleLength) / length : 0;
      const size = minfontsize + (maxfontsize - minfontsize) * ratio;
      let style = `font-size: ${parseFloat(size.toFixed(2))}${unit};`;

      if (colorful) {
        const color =
          "rgb(" +
          Math.floor(Math.random() * 201) +
          ", " +
          Math.floor(Math.random() * 201) +
          ", " +
          Math.floor(Math.random() * 201) +
          ")";
        style += ` color: ${color};`;
      }

      if (highlightTags.includes(tag.name)) {
        style += " font-weight: 500; color: var(--anzhiyu-lighttext)";
      }

      result += `<a href="${env.url_for(tag.path)}" style="${style}">${tag.name}<sup>${visibleLength}</sup></a>`;
    });

  return result;
});

hexo.extend.helper.register("tags_page_list", function (type) {
  const tags = filterVisibleTaxonomies(hexo.locals.get(type));

  const sortedTags = tags.toArray().reduce((acc, tag) => {
    const visibleLength = getVisibleCollectionLength(tag);
    const index = acc.findIndex(item => item.visibleLength < visibleLength);
    const entry = { tag, visibleLength };

    if (index === -1) {
      acc.push(entry);
    } else {
      acc.splice(index, 0, entry);
    }

    return acc;
  }, []);

  let html = "";
  sortedTags.forEach(({ tag, visibleLength }) => {
    html += `
      <a href="/${tag.path}" id="/${tag.path}">
        <span class="tags-punctuation">#</span>${tag.name}
        <span class="tagsPageCount">${visibleLength}</span>
      </a>
    `;
  });

  return html;
});

hexo.extend.helper.register("aside_categories", function (categories, options) {
  if (!options && (!categories || !Object.prototype.hasOwnProperty.call(categories, "length"))) {
    options = categories;
    categories = this.site.categories;
  }

  categories = filterVisibleTaxonomies(categories);

  if (!categories || !categories.length) return "";
  options = options || {};

  const { config } = this;
  const showCount = Object.prototype.hasOwnProperty.call(options, "show_count")
    ? options.show_count
    : true;
  const depth = options.depth ? parseInt(options.depth, 10) : 0;
  const orderby = options.orderby || "name";
  const order = options.order || 1;
  const categoryDir = this.url_for(config.category_dir);
  const limit = options.limit === 0 ? categories.length : options.limit;
  const isExpand = options.expand !== "none";
  const expandClass = isExpand && options.expand === true ? "expand" : "";
  const buttonLabel = this._p("aside.more_button");

  const prepareQuery = parent => {
    const query = {};
    if (parent) query.parent = parent;
    else query.parent = { $exists: false };

    return categories
      .find(query)
      .sort(orderby, order)
      .filter(cat => getVisibleCollectionLength(cat) > 0);
  };

  let expandBtn = "";

  const hierarchicalList = (t, level, parent, topparent = true) => {
    let result = "";
    const isTopParent = topparent;

    if (t > 0) {
      prepareQuery(parent).forEach(cat => {
        if (t > 0) {
          t -= 1;
          let child;
          if (!depth || level + 1 < depth) {
            const childList = hierarchicalList(t, level + 1, cat._id, false);
            child = childList[0];
            t = childList[1];
          }

          const parentClass = isExpand && isTopParent && child ? "parent" : "";
          result += `<li class="card-category-list-item ${parentClass}">`;
          result += `<a class="card-category-list-link" href="${this.url_for(cat.path)}">`;
          result += `<span class="card-category-list-name">${cat.name}</span>`;

          if (showCount) {
            result += `<span class="card-category-list-count">${getVisibleCollectionLength(cat)}</span>`;
          }

          if (isExpand && isTopParent && child) {
            expandBtn = " expandBtn";
            result += `<i class="anzhiyufont anzhiyu-icon-caret-left ${expandClass}"></i>`;
          }

          result += "</a>";

          if (child) {
            result += `<ul class="card-category-list child">${child}</ul>`;
          }

          result += "</li>";
        }
      });
    }

    return [result, t];
  };

  const list = hierarchicalList(limit, 0);

  const moreButton = function () {
    if (categories.length <= limit) return "";
    return `<a class="card-more-btn" href="${categoryDir}/" title="${buttonLabel}">
    <i class="anzhiyufont anzhiyu-icon-angle-right"></i></a>`;
  };

  return `<div class="item-headline">
            <i class="anzhiyufont anzhiyu-icon-folder-open"></i>
            <span>${this._p("aside.card_categories")}</span>
            ${moreButton()}
            </div>
            <ul class="card-category-list${expandBtn}" id="aside-cat-list">
            ${list[0]}
            </ul>`;
});
