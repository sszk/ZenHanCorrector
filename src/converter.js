(function (root) {
  "use strict";

  var hankakuKanaMap = {
    "ｱ": "ア",
    "ｲ": "イ",
    "ｳ": "ウ",
    "ｴ": "エ",
    "ｵ": "オ",
    "ｶ": "カ",
    "ｷ": "キ",
    "ｸ": "ク",
    "ｹ": "ケ",
    "ｺ": "コ",
    "ｻ": "サ",
    "ｼ": "シ",
    "ｽ": "ス",
    "ｾ": "セ",
    "ｿ": "ソ",
    "ﾀ": "タ",
    "ﾁ": "チ",
    "ﾂ": "ツ",
    "ﾃ": "テ",
    "ﾄ": "ト",
    "ﾅ": "ナ",
    "ﾆ": "ニ",
    "ﾇ": "ヌ",
    "ﾈ": "ネ",
    "ﾉ": "ノ",
    "ﾊ": "ハ",
    "ﾋ": "ヒ",
    "ﾌ": "フ",
    "ﾍ": "ヘ",
    "ﾎ": "ホ",
    "ﾏ": "マ",
    "ﾐ": "ミ",
    "ﾑ": "ム",
    "ﾒ": "メ",
    "ﾓ": "モ",
    "ﾔ": "ヤ",
    "ﾕ": "ユ",
    "ﾖ": "ヨ",
    "ﾗ": "ラ",
    "ﾘ": "リ",
    "ﾙ": "ル",
    "ﾚ": "レ",
    "ﾛ": "ロ",
    "ﾜ": "ワ",
    "ｦ": "ヲ",
    "ﾝ": "ン",
    "ｧ": "ァ",
    "ｨ": "ィ",
    "ｩ": "ゥ",
    "ｪ": "ェ",
    "ｫ": "ォ",
    "ｯ": "ッ",
    "ｬ": "ャ",
    "ｭ": "ュ",
    "ｮ": "ョ",
    "ｰ": "ー",
    "｡": "。",
    "｢": "「",
    "｣": "」",
    "､": "、",
    "･": "・"
  };

  var dakutenMap = {
    "カ": "ガ",
    "キ": "ギ",
    "ク": "グ",
    "ケ": "ゲ",
    "コ": "ゴ",
    "サ": "ザ",
    "シ": "ジ",
    "ス": "ズ",
    "セ": "ゼ",
    "ソ": "ゾ",
    "タ": "ダ",
    "チ": "ヂ",
    "ツ": "ヅ",
    "テ": "デ",
    "ト": "ド",
    "ハ": "バ",
    "ヒ": "ビ",
    "フ": "ブ",
    "ヘ": "ベ",
    "ホ": "ボ",
    "ウ": "ヴ",
    "ワ": "ヷ",
    "ヰ": "ヸ",
    "ヱ": "ヹ",
    "ヲ": "ヺ"
  };

  var handakutenMap = {
    "ハ": "パ",
    "ヒ": "ピ",
    "フ": "プ",
    "ヘ": "ペ",
    "ホ": "ポ"
  };

  var fullWidthDashPattern = /[‐‑‒–—―−－]/;
  var fullWidthAlphaNumericPattern = /[Ａ-Ｚａ-ｚ０-９]/;
  var halfWidthKanaPattern = /[ｦ-ﾟ]/;
  var halfWidthKanaMarkPattern = /[ﾞﾟ]/;

  function isFullWidthAlphaNumeric(char) {
    return fullWidthAlphaNumericPattern.test(char);
  }

  function isHalfWidthKana(char) {
    return halfWidthKanaPattern.test(char);
  }

  function hasHalfWidthKanaBefore(value, index) {
    var previous = value.charAt(index - 1);

    if (halfWidthKanaMarkPattern.test(previous)) {
      previous = value.charAt(index - 2);
    }

    return isHalfWidthKana(previous);
  }

  function hasHalfWidthKanaAfter(value, index) {
    return isHalfWidthKana(value.charAt(index + 1));
  }

  function normalizeContextualPunctuation(value) {
    var output = "";

    for (var i = 0; i < value.length; i += 1) {
      var char = value.charAt(i);
      var previous = value.charAt(i - 1);
      var next = value.charAt(i + 1);

      if (fullWidthDashPattern.test(char) && isFullWidthAlphaNumeric(previous) && isFullWidthAlphaNumeric(next)) {
        output += "-";
      } else if (char === "-" && hasHalfWidthKanaBefore(value, i) && hasHalfWidthKanaAfter(value, i)) {
        output += "ー";
      } else {
        output += char;
      }
    }

    return output;
  }

  function normalizeAscii(value) {
    return value.replace(/[！-～]/g, function (char) {
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    }).replace(/　/g, " ");
  }

  function normalizeKana(value) {
    var output = "";

    for (var i = 0; i < value.length; i += 1) {
      var char = value.charAt(i);
      var converted = hankakuKanaMap[char] || char;
      var next = value.charAt(i + 1);

      if (next === "ﾞ" && dakutenMap[converted]) {
        output += dakutenMap[converted];
        i += 1;
      } else if (next === "ﾟ" && handakutenMap[converted]) {
        output += handakutenMap[converted];
        i += 1;
      } else {
        output += converted;
      }
    }

    return output;
  }

  function convertText(value) {
    return normalizeKana(normalizeAscii(normalizeContextualPunctuation(value)));
  }

  var api = {
    convertText: convertText
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.ZenHanCorrector = api;
}(typeof globalThis !== "undefined" ? globalThis : window));
