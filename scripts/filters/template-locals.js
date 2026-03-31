"use strict";

const {
  filterVisiblePosts,
  filterVisibleTaxonomies
} = require("../lib/post-visibility");

hexo.extend.filter.register("template_locals", function (locals) {
  locals.site = Object.assign({}, locals.site, {
    posts: filterVisiblePosts(locals.site.posts),
    tags: filterVisibleTaxonomies(locals.site.tags),
    categories: filterVisibleTaxonomies(locals.site.categories)
  });

  return locals;
});
