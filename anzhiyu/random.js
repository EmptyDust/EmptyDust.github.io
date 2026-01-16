var posts=["2025/06/21/114514/","2025/01/06/20250106/","2025/01/11/20250113/","2025/01/20/20250120/","2025/02/19/20250219/","2025/03/05/20250305/","2025/03/20/20250319/","2025/03/10/20250312/","2025/04/02/20250402/","2025/04/09/20250409/","2025/04/16/20250416/","2025/04/23/20250423/","2025/05/07/20250507/","2025/05/21/20250521/","2025/06/05/20250605/","2025/06/19/20250619/","2025/09/17/20250917/","2025/03/27/20250326/","2025/09/25/20250925/","2025/12/10/20251210/","2025/12/15/20251217/","2025/04/02/2025GSoCProposal/","2026/01/07/20260107/","2026/01/14/20260114/","2025/10/23/BigData2/","2025/11/13/BigData3/","2025/09/21/BigData1/","2025/12/04/BigData5/","2025/12/11/BigData7/","2025/11/20/BigDataBigHomework/","2025/07/04/STL与库函数/","2025/05/28/architecture-report/","2024/01/10/Mandelbrot-Set/","2025/08/07/DeepSeek-R1-Incentivizing-Reasoning-Capability-in-LLMs-via-Reinforcement-Learning/","2025/05/21/bochs-debug-commend/","2023/12/25/cf1902E/","2025/12/24/20251224/","2023/12/19/cf1913D/","2025/05/21/cloud-database-security/","2025/05/25/computer-security-4/","2025/06/01/computer-security-5/","2026/01/13/csInternetHW/","2025/05/27/english-final/","2025/05/20/english-speech-draft/","2025/03/22/first-time-k-song/","2025/05/20/english-speech-homework/","2024/12/28/hello-world/","2024/12/28/ml-server-wp/","2025/04/23/minecraft_server/","2025/12/16/how-to-upload-pic-to-picbed-directly-in-vscode/","2025/05/21/os-7/","2025/05/22/os-8/","2025/04/23/os_0/","2025/05/30/sql-review/","2024/12/28/transformer-replication/","2025/07/04/三维几何及常见例题/","2025/07/04/串/","2025/07/04/二维几何/","2025/07/04/动态规划/","2025/07/04/博弈论/","2025/07/04/图论/","2025/07/04/图论常见结论及例题/","2025/07/04/多边形相关/","2025/07/04/多项式/","2025/07/04/常见例题/","2025/07/04/数据结构A/","2025/07/04/数据结构B/","2025/07/04/数论/","2025/07/04/杂项/","2025/07/04/树上问题/","2025/07/04/基础算法/","2025/07/04/线性代数/","2025/07/04/组合数学&数论常见结论及例题/","2025/07/04/组合数学/","2025/07/04/网络流/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };var friend_link_list=[{"name":"Hexo","link":"https://hexo.io/zh-tw/","avatar":"https://d33wubrfki0l68.cloudfront.net/6657ba50e702d84afb32fe846bed54fba1a77add/827ae/logo.svg","descr":"快速、简单且强大的网站框架"},{"name":"anzhiyu主题","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","siteshot":"https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg"},{"name":"安知鱼","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","siteshot":"https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg","color":"vip","tag":"技术"},{"name":"Rougamo","link":"https://rougamorika.github.io","avatar":"https://bu.dusays.com/2025/03/20/67dbd4bb807e5.jpg","descr":"一起开启新概念电信","recommend":true,"siteshot":"https://bu.dusays.com/2025/03/20/67dbd4bb807e5.jpg","color":"vip","tag":"数学"},{"name":"安知鱼","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","recommend":true},{"name":"Rougamo","link":"https://rougamorika.github.io","avatar":"https://bu.dusays.com/2025/03/20/67dbd4bb807e5.jpg","descr":"一起开启新概念电信","recommend":true}];
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

      while (friend_link_list.length && count < 3) {
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
          const returnInfo = "<a class='footer-item' href='" + link + "' target='_blank' rel='noopener nofollow'>" + name + "</a>"
          return returnInfo;
        })
        .join("");
  
      html += "<a class='footer-item' href='/link/'>更多</a>";

      document.getElementById("friend-links-in-footer").innerHTML = html;

      setTimeout(()=>{
        footerRandomFriendsBtn.style.opacity = "1";
      }, 300)
    };