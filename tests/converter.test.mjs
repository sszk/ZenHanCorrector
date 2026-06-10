import assert from "node:assert/strict";
import converter from "../src/converter.js";

const cases = [
  ["ＡＢＣ１２３", "ABC123"],
  ["Ｈｅｌｌｏ，　Ｗｏｒｌｄ！", "Hello, World!"],
  ["ﾊﾝｶｸｶﾅ", "ハンカクカナ"],
  ["ｶﾞｷﾞｸﾞｹﾞｺﾞ", "ガギグゲゴ"],
  ["ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ", "パピプペポ"],
  ["ｳﾞｧｲｵﾘﾝ", "ヴァイオリン"],
  ["｢ﾃｽﾄ｣､｡･ｰ", "「テスト」、。・ー"]
];

for (const [input, expected] of cases) {
  assert.equal(converter.convertText(input), expected);
}

console.log("converter tests passed");
