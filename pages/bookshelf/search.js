function dp_function(dp, i, j, target, word) {
  if (i < 0 || j < 0) {
    return 0;
  }
  if (dp[i][j] >= 0)
    return dp[i][j];
  if (target[i] == word[j])
    dp[i][j] = dp_function(dp, i - 1, j - 1, target, word) + 1;
  else
    dp[i][j] = Math.max(dp_function(dp, i - 1, j, target, word), dp_function(dp, i, j - 1, target, word));
  return dp[i][j];
}

function gen_confidence(target, search_words) {
  var sum = 0
  for (var k = 0; k < search_words.length; k++) {
    var dp = new Array(target.length);
    for (var i = 0; i < dp.length; i++) {
      dp[i] = new Array(search_words[k].length);
      for (var j = 0; j < dp[i].length; j++) {
        dp[i][j] = -1;
      }
    }
    sum += dp_function(dp, target.length - 1, search_words[k].length - 1, target, search_words[k]);
  }
  return sum;
}

function bookDicConstructor(it1, it2, it3, search_string, search_words) {
  var dic = {};
  for (var i=0;i<search_words.length;i++)
    search_words[i] = search_words[i].toLowerCase()
  var confidence = 2 * gen_confidence(it1[2].toLowerCase(), search_words) + gen_confidence(it2[1].replace('/', '').toLowerCase(), search_words)

  if (confidence == 0)
    return null;
  else
    dic.confidence = confidence
  dic.search_string = search_string;
  if (it2[2])
    dic.intro = it2[2]
  else
    dic.intro = "暂无简介"
  dic.webUrl = it1[1]
  dic.title = it1[2]
  dic.imgUrl = it1[3]
  dic.shortIntro = it2[1]
  if (it3[1])
    dic.rating = it3[1]
  else
    dic.rating = "暂无评分"
  return dic;
}


function matchFunction(res, search_string, search_words,limit) {
  var detail_pattern = /<a class=\"nbg\" href=\"(?:\S*)\"[^\n]*sid: (\d*),.*title=\"(.*)\" ><img src=\"(.*)\"><\/a>/g;
  var wtpy_pattern = /<span class=\"subject-cast\">([^\n]*)<\/span>\s*<\/div>\s*<\/div>\s*(?:<p>(.*)<\/p>)*/g;
  var rating_pattern = /<span class=\"rating_nums\">(\d.\d)<\/span>|<span>\(目前无人评价\)<\/span>|<span>\(评价人数不足\)<\/span>/g;

  var list = []; //匹配图书存储
  var it1 = detail_pattern.exec(res.data);
  var it3 = rating_pattern.exec(res.data);
  var it2 = wtpy_pattern.exec(res.data);
  var i = 0;
  while (it1 != null && it2 != null && it3 != null && i < 10) {
    var temp = bookDicConstructor(it1, it2, it3, search_string, search_words)
    if (temp != null)
      list.push(temp)
    it1 = detail_pattern.exec(res.data);
    it2 = wtpy_pattern.exec(res.data);
    it3 = rating_pattern.exec(res.data);
    i++;
  }
  list.sort(function (a, b) {
    return b.confidence - a.confidence;
  });
  list = list.slice(0, limit)

  for (var i = 0; i < list.length; i++) {
    list[i].type = i == 0 ? 'search_recommend':'search_candidate';
    list[i].isFirst = i == 0 ? true : false;
    list[i].isAdded = false;
    list[i].stringInfoDic = encodeURIComponent(JSON.stringify(list[i]))
  }
  return list
}

function search(search_string, search_words, parent,idx,limit=4) {
  var searchListReady = function(search_string, search_words) {
    return new Promise(function(resolve, reject) {
      // console.log("this is promise")
      //doubanQuery
      wx.request({
        url: "https://www.douban.com/search",
        method: "GET",
        data: {
          'cat': 1001,
          'q': search_string
        },
        header: {
          "Content-Type": "application/json; charset=UTF-8"
        },
        success: res => {
          var temp = {
            books: matchFunction(res, search_string, search_words,limit),
            index: idx
          };
          resolve(temp);
        },
        fail: res => {
          console.log("doubanQuery failed")
          reject("doubanQuery failed");
        }
      }); //end of doubanQuery
    })
  }
  searchListReady(search_string, search_words).then(result => {
    if (result.books.length > 0) {
      parent.data.query_complete[result.index] = true
      parent.setData({
        'query_complete': parent.data.query_complete
      })
      parent.data.recommend[result.index] = result.books[0];
      //parent.data.recommend.push(result[0])
      parent.data.candidate[result.index] = [];
      for (var i = 1; i < result.books.length; i++)
        parent.data.candidate[result.index].push(result.books[i])
      parent.data.flush = !parent.data.flush
    } else {
      console.log(search_words.pop()," is cutted");
      if ((search_words.length == 1 && search_words[0].length < 2) || search_words.length == 0){
        parent.data.query_complete[result.index] = true
        parent.setData({
          'query_complete': parent.data.query_complete
        })
        return [];
      }
      else {
        search_string = search_words.join('+')
        search(search_string, search_words,parent,idx)
      }
    }
  })
}


module.exports = {
  search: search,
}