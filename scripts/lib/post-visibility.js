"use strict";

function isEssayPost(post) {
  return Boolean(post && post.essay);
}

function isVisiblePost(post) {
  return Boolean(post && post.published !== false && !isEssayPost(post));
}

function filterVisiblePosts(posts) {
  if (!posts || typeof posts.filter !== "function") return posts;
  return posts.filter(post => isVisiblePost(post));
}

function getVisibleCollectionLength(collection) {
  if (!collection) return 0;
  if (collection.posts) return filterVisiblePosts(collection.posts).length;
  return typeof collection.length === "number" ? collection.length : 0;
}

function filterVisibleTaxonomies(collections) {
  if (!collections || typeof collections.filter !== "function") return collections;
  return collections.filter(item => getVisibleCollectionLength(item) > 0);
}

module.exports = {
  filterVisiblePosts,
  filterVisibleTaxonomies,
  getVisibleCollectionLength,
  isEssayPost,
  isVisiblePost
};
