/*
 * @Author: yiyun
 * @Description:
 */
export default (options) => {
  // default options
  const defaultOption = {
    element: options.element || document.getElementById("simCaptcha"),
    appId: options.appId || "",
    imgUrl: options.imgUrl || "/api/SimCaptcha/Img",
    checkUrl: options.checkUrl || "/api/SimCaptcha/Check",
  };
  // 附上默认值
  for (const defaultKey in defaultOption) {
    if (
      defaultOption.hasOwnProperty(defaultKey) &&
      !options.hasOwnProperty(defaultKey)
    ) {
      options[defaultKey] = defaultOption[defaultKey];
    }
  }

  // callback
  if (
    !options.hasOwnProperty("callback") ||
    Object.prototype.toString.call(options.callback) !== "[object Function]"
  ) {
    // console.warn("sim-captcha-js: 你未有效设置回调函数callback");
    options.callback = new Function();
  }

  // baseUrl
  if (!options.hasOwnProperty("baseUrl") || options.baseUrl == "") {
    console.error("sim-captcha-js: 你必须设置baseUrl");
  }
  // 去掉末尾 "/"
  if (options.baseUrl[options.baseUrl.length - 1] == "/") {
    options.baseUrl = options.baseUrl.substr(0, options.baseUrl.length - 1);
  }

  // imgUrl 拼接成绝对url
  if (options.imgUrl.indexOf("http") != 0) {
    // 相对路径
    if (options.imgUrl.indexOf("/") != 0) {
      options.imgUrl = options.baseUrl + "/" + options.imgUrl;
    } else {
      options.imgUrl = options.baseUrl + options.imgUrl;
    }
  }
  // checkUrl 拼接成绝对url
  if (options.checkUrl.indexOf("http") != 0) {
    // 相对路径
    if (options.checkUrl.indexOf("/") != 0) {
      options.checkUrl = options.baseUrl + "/" + options.checkUrl;
    } else {
      options.checkUrl = options.baseUrl + options.checkUrl;
    }
  }

  return options;
};
