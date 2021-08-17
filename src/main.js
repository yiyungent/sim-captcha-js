/*
 * @Author: yiyun
 * @Description:
 */
import "./css/sim-captcha.css";

import SimCaptcha from "./js/sim-captcha.js";

const VERSION = "0.1.1";
const GIT_HASH = "";
console.log(
  `${"\n"} %c sim-captcha-js v${VERSION} ${GIT_HASH} %c https://github.com/yiyungent/sim-captcha-js ${"\n"}${"\n"}`,
  "color: #fff; background: #030307; padding:5px 0;",
  "background: #ff80ab; padding:5px 0;"
);

export default SimCaptcha;

