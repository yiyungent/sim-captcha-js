/*
 * @Author: yiyun
 * @Description:
 */
/**
 * 发送http GET
 * @param {String} url 请求url
 * @param {Function} callback 请求成功回调函数
 */

function httpGet(url, callback) {
  // XMLHttpRequest对象用于在后台与服务器交换数据
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    // readyState == 4说明请求已完成
    if ((xhr.readyState == 4 && xhr.status == 200) || xhr.status == 304) {
      // 从服务器获得数据
      callback.call(this, JSON.parse(xhr.responseText));
    }
  };
  xhr.send();
}

/**
 * 发送http POST
 * @param {String} url 请求url
 * @param {Ojbect} data 将要发送的数据包装为对象
 * @param {Function} callback 请求成功回调函数
 */
function httpPost(url, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  // 添加http头，发送信息至服务器时内容编码类型
  // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
      callback.call(this, JSON.parse(xhr.responseText));
    }
  };
  xhr.send(JSON.stringify(data));
}

/**
 * 获取目标html元素相对于整个html文档的位置(y轴)(px)
 * @param {HTMLElement} obj
 */
function getOffsetTop(obj) {
  var tmp = obj.offsetTop;
  var val = obj.offsetParent;
  while (val != null) {
    tmp += val.offsetTop;
    val = val.offsetParent;
  }
  return tmp;
}

/**
 * 获取目标html元素相对于整个html文档的位置(x轴)(px)
 * @param {HTMLElement} obj
 */
function getOffsetLeft(obj) {
  var tmp = obj.offsetLeft;
  var val = obj.offsetParent;
  while (val != null) {
    tmp += val.offsetLeft;
    val = val.offsetParent;
  }
  return tmp;
}

/**
 * 移除目标元素
 * @param {HTMLElement} _element 目标元素
 */
function removeElement(_element) {
  var _parentElement = _element.parentNode;
  if (_parentElement) {
    _parentElement.removeChild(_element);
  }
}

/**
 * 更新验证码图片src
 * @param {String} imgSrc 验证码图片的src值
 */
function updateImgSrc(imgSrc) {
  // TODO: DOM: 更新图片src
  document.getElementById("simCaptcha-img").src = imgSrc;
}

/**
 * DOM: 更新验证码提示
 * @param {String} vCodeTip 验证码提示
 */
function updateVCodeTip(vCodeTip) {
  // TODO: DOM: 更新验证码提示
  document.getElementById("simCaptcha-vCodeTip").innerText = vCodeTip;
}

/**
 * DOM: 更新错误提示
 * @param {String} errorTip 错误提示
 */
function updateErrorTip(errorTip) {
  // TODO: DOM: 更新错误提示
  document.getElementById("simCaptcha-errorTip").innerText = errorTip;
  if (errorTip == "验证通过") {
    document.getElementById("simCaptcha-errorTip").className =
      "simCaptcha-errorTip-success simCaptcha-errorTip-up";
  } else {
    document.getElementById("simCaptcha-errorTip").className =
      "simCaptcha-errorTip-fail simCaptcha-errorTip-up";
    // 验证码层震动
    document.getElementById("simCaptcha-layer").className = "simCaptcha-shake";
  }
  // 1.8秒后向下动画隐藏
  setTimeout(function () {
    // 注意: 为了使 错误提示上下css动画, 背景颜色 down时不掉色，所以需要这样做
    if (errorTip == "验证通过") {
      document.getElementById("simCaptcha-errorTip").className =
        "simCaptcha-errorTip-success";
    } else {
      document.getElementById("simCaptcha-errorTip").className =
        "simCaptcha-errorTip-fail";
      // 验证码层停止震动
      document.getElementById("simCaptcha-layer").className = "simCaptcha-show";
    }
  }, 1800);
}

/***
 * 隐藏当前验证码弹出层，下次show 将使用当前验证码图片base64
 * 用于用户手动点击关闭按钮
 */
function hidden() {
  // TODO: DOM操作 隐藏
  document.getElementById("simCaptcha-mask").className = "simCaptcha-hidden";
  document.getElementById("simCaptcha-layer").className = "simCaptcha-hidden";
}

/**
 * 像素相对位置 -> 百分比相对位置
 * @param {Object} pxPos 相对于验证码图片的相对位置(px)
 * @return {Object} { x: 20, y:40 } (表示x轴20%, y轴40%)
 */
function pxToPercentPos(pxPos) {
  // 即时获取当前验证码图片宽高(像素)
  var imgSize = getImgSize();
  var imgWidthPx = imgSize.width;
  var imgHeightPx = imgSize.height;

  var xPercent = parseInt((pxPos.x / imgWidthPx) * 100);
  var yPercent = parseInt((pxPos.y / imgHeightPx) * 100);

  return { x: xPercent, y: yPercent };
}

/**
 * 即时获取当前验证码图片宽高(像素)
 * @return {Object} eg:{width: 200, height:200} (px)
 */
function getImgSize() {
  var width = document.getElementById("simCaptcha-img").offsetWidth;
  var height = document.getElementById("simCaptcha-img").offsetHeight;

  return { width, height };
}

export {
  httpGet,
  httpPost,
  removeElement,
  getOffsetLeft,
  getOffsetTop,
  updateImgSrc,
  updateVCodeTip,
  updateErrorTip,
  hidden,
  getImgSize,
  pxToPercentPos
};
