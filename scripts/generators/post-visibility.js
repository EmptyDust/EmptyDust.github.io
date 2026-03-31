"use strict";

const pagination = require("hexo-pagination");
const {
  filterVisiblePosts,
  filterVisibleTaxonomies
} = require("../lib/post-visibility");

const fmtNum = num => num.toString().padStart(2, "0");

hexo.extend.generator.register("index", function (locals) {
  const config = this.config;
  const posts = filterVisiblePosts(locals.posts).sort(config.index_generator.order_by);

  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  const paginationDir = config.index_generator.pagination_dir || config.pagination_dir || "page";
  const path = config.index_generator.path || "";

  return pagination(path, posts, {
    perPage: config.index_generator.per_page,
    layout: config.index_generator.layout || ["index", "archive"],
    format: paginationDir + "/%d/",
    data: {
      __index: true
    }
  });
});

hexo.extend.generator.register("archive", function (locals) {
  const { config } = this;

  let archiveDir = config.archive_dir;
  const paginationDir = config.pagination_dir || "page";
  const allPosts = filterVisiblePosts(locals.posts).sort(config.archive_generator.order_by || "-date");
  const perPage = config.archive_generator.per_page;
  const result = [];

  if (!allPosts.length) return;

  if (archiveDir[archiveDir.length - 1] !== "/") archiveDir += "/";

  function generate(path, posts, options = {}) {
    options.archive = true;

    result.push(...pagination(path, posts, {
      perPage,
      layout: ["archive", "index"],
      format: paginationDir + "/%d/",
      data: options
    }));
  }

  generate(archiveDir, allPosts);

  if (!config.archive_generator.yearly) return result;

  const posts = {};

  allPosts.forEach(post => {
    const date = post.date;
    const year = date.year();
    const month = date.month() + 1;

    if (!Object.prototype.hasOwnProperty.call(posts, year)) {
      posts[year] = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
      ];
    }

    posts[year][0].push(post);
    posts[year][month].push(post);

    if (config.archive_generator.daily) {
      const day = date.date();
      if (!Object.prototype.hasOwnProperty.call(posts[year][month], "day")) {
        posts[year][month].day = {};
      }

      (posts[year][month].day[day] || (posts[year][month].day[day] = [])).push(post);
    }
  });

  const { Query } = this.model("Post");
  const years = Object.keys(posts);
  let year, data, month, monthData, url;

  for (let i = 0, len = years.length; i < len; i++) {
    year = +years[i];
    data = posts[year];
    url = archiveDir + year + "/";
    if (!data[0].length) continue;

    generate(url, new Query(data[0]), { year });

    if (!config.archive_generator.monthly && !config.archive_generator.daily) continue;

    for (month = 1; month <= 12; month++) {
      monthData = data[month];
      if (!monthData.length) continue;
      if (config.archive_generator.monthly) {
        generate(url + fmtNum(month) + "/", new Query(monthData), {
          year,
          month
        });
      }

      if (!config.archive_generator.daily) continue;

      for (let day = 1; day <= 31; day++) {
        const dayData = monthData.day[day];
        if (!dayData || !dayData.length) continue;
        generate(url + fmtNum(month) + "/" + fmtNum(day) + "/", new Query(dayData), {
          year,
          month,
          day
        });
      }
    }
  }

  return result;
});

hexo.extend.generator.register("category", function (locals) {
  const config = this.config;
  const perPage = config.category_generator.per_page;
  const paginationDir = config.pagination_dir || "page";
  const orderBy = config.category_generator.order_by || "-date";

  return locals.categories.reduce((result, category) => {
    const posts = filterVisiblePosts(category.posts).sort(orderBy);
    if (!posts.length) return result;

    const data = pagination(category.path, posts, {
      perPage,
      layout: ["category", "archive", "index"],
      format: paginationDir + "/%d/",
      data: {
        category: category.name
      }
    });

    return result.concat(data);
  }, []);
});

hexo.extend.generator.register("tag", function (locals) {
  const config = this.config;
  const perPage = config.tag_generator.per_page;
  const paginationDir = config.pagination_dir || "page";
  const orderBy = config.tag_generator.order_by || "-date";
  const tags = filterVisibleTaxonomies(locals.tags);
  let tagDir;

  const pages = tags.reduce((result, tag) => {
    const posts = filterVisiblePosts(tag.posts).sort(orderBy);
    if (!posts.length) return result;

    const data = pagination(tag.path, posts, {
      perPage,
      layout: ["tag", "archive", "index"],
      format: paginationDir + "/%d/",
      data: {
        tag: tag.name
      }
    });

    return result.concat(data);
  }, []);

  if (config.tag_generator.enable_index_page) {
    const posts = filterVisiblePosts(locals.posts);
    tagDir = config.tag_dir;
    if (tagDir[tagDir.length - 1] !== "/") {
      tagDir += "/";
    }

    pages.push({
      path: tagDir,
      layout: ["tag-index", "tag", "archive", "index"],
      posts,
      data: {
        base: tagDir,
        total: 1,
        current: 1,
        current_url: tagDir,
        posts,
        prev: 0,
        prev_link: "",
        next: 0,
        next_link: "",
        tags
      }
    });
  }

  return pages;
});

hexo.extend.generator.register("random", function (locals) {
  const config = hexo.config.random || {};
  const themeConfig = hexo.theme.config;
  const pjaxEn = themeConfig.pjax.enable;
  const randomNumberFriend = themeConfig.footer.list.randomFriends || 0;
  const posts = [];
  const link = locals.data.link || [];

  for (const post of filterVisiblePosts(locals.posts).data) {
    if (post.random !== false) posts.push(post.path);
  }

  const link_list = [];

  link.forEach(element => {
    element.link_list.forEach(link_list_item => {
      link_list.push(link_list_item);
    });
  });

  let result = `var posts=${JSON.stringify(
    posts
  )};function toRandomPost(){
    ${pjaxEn ? "pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);" : "window.location.href='/'+posts[Math.floor(Math.random() * posts.length)];"}
  };`;

  if (themeConfig.footer.list.enable && randomNumberFriend > 0) {
    result += `var friend_link_list=${JSON.stringify(link_list)};
    var refreshNum = 1;
    function friendChainRandomTransmission() {
      const randomIndex = Math.floor(Math.random() * friend_link_list.length);
      const { name, link } = friend_link_list.splice(randomIndex, 1)[0];
      Snackbar.show({
        text:
          "点击前往按钮进入随机一个友链，不保证跳转网站的安全性和可用性。本次随机到的是本站友链：「" + name + "」",
        duration: 8000,
        pos: "top-center",
        actionText: "前往",
        onActionClick: function (element) {
          element.style.opacity = 0;
          window.open(link, "_blank");
        },
      });
    }
    function addFriendLinksInFooter() {
      var footerRandomFriendsBtn = document.getElementById("footer-random-friends-btn");
      if(!footerRandomFriendsBtn) return;
      footerRandomFriendsBtn.style.opacity = "0.2";
      footerRandomFriendsBtn.style.transitionDuration = "0.3s";
      footerRandomFriendsBtn.style.transform = "rotate(" + 360 * refreshNum++ + "deg)";
      const finalLinkList = [];
  
      let count = 0;

      while (friend_link_list.length && count < ${randomNumberFriend}) {
        const randomIndex = Math.floor(Math.random() * friend_link_list.length);
        const { name, link, avatar } = friend_link_list.splice(randomIndex, 1)[0];
  
        finalLinkList.push({
          name,
          link,
          avatar,
        });
        count++;
      }
  
      let html = finalLinkList
        .map(({ name, link }) => {
          const returnInfo = "<a class='footer-item' href='" + link + "' target='_blank' rel='noopener nofollow'>" + name + "</a>";
          return returnInfo;
        })
        .join("");
  
      html += "<a class='footer-item' href='/link/'>更多</a>";

      document.getElementById("friend-links-in-footer").innerHTML = html;

      setTimeout(()=>{
        footerRandomFriendsBtn.style.opacity = "1";
      }, 300);
    };`;
  }

  return {
    path: config.path || "anzhiyu/random.js",
    data: result,
  };
});
