﻿import handleOption from "./options.js";
import {
  httpGet,
  httpPost,
  getOffsetTop,
  getOffsetLeft,
  removeElement,
} from "./utils.js";

// 私有字段
// 点击此 _element 元素则弹出验证码层，为此元素绑定点击事件
var _element = null;
var _appId = "";
// 前端验证成功后，会调用业务传入的回调函数，并在第一个参数中传入回调结果
var _callback = null;

// 用户点击验证码图片的位置数据 {Array} eg:  [{ x: 12, y: 35 }, { x: 52, y: 35 }, { x: 32, y: 75 }]
var _vCodePos = [];

// 验证码服务端 效验url
var _reqVCodeCheckUrl = "";
// 验证码服务端 获取验证码图片url
var _reqVCodeImgUrl = "";

// 从后端响应得到的appId
var _resAppId = "";
// 验证是否通过效验票据
var _resTicket = "";
// 用户会话唯一标识
var _resUserId = "";
// 验证码图片 base64
var _resVCodeImg = "";
// 验证码提示 eg: 请依序点击 走 炮 跳
var _resVCodeTip = "";

// 错误提示 eg: 1.点错啦，请重试 2.这题有点难，为你换一个试试吧
var _errorTip = "";

/***
 * 隐藏当前验证码弹出层，下次show 将使用当前验证码图片base64
 * 用于用户手动点击关闭按钮
 */
function hidden() {
  // TODO: DOM操作 隐藏
  document.getElementById("simCaptcha-mask").className = "simCaptcha-hidden";
  document.getElementById("simCaptcha-layer").className = "simCaptcha-hidden";
}

/***
 * 摧毁当前验证码（隐藏验证码弹出层，清除验证码图片base64），下次show 将请求新验证码图片base64
 */
function destroy() {
  // 隐藏当前验证码弹出层
  hidden();
  // 清除全部点触标记
  clearPointMark();
  // 清空点触位置数据
  _vCodePos = [];
  // 清除验证码相关数据
  _resVCodeImg = "";
  _resVCodeTip = "";

  // 注意: 不清除 _resAppId, _resTicket, 因为通过验证后可能会通过 getTicket() 获取票据, 
  // 直到下一次通过验证获得票据, _resAppId, _resTicket 才得到更新
  //_resAppId = "";
  //_resTicket = "";

  _errorTip = "";
}

/**
 * 在验证码弹出层展示 成功通过验证
 * @param {Number} ts 本次点击验证码花费时间（js 13位时间戳）// 保留，暂时不用，随便传一个，或不传
 */
function showSuccessTip(ts) {
  // 在验证码弹出层展示 验证通过
  // 更新错误提示为 "验证通过"
  updateErrorTip("验证通过");
  // 0.5s后 destroy 验证码层
  setTimeout(destroy, 500);
}

/**
 * DOM: 更新错误提示
 * @param {String} errorTip 错误提示
 */
function updateErrorTip(errorTip) {
  // TODO: DOM: 更新错误提示
  if (!errorTip) {
    errorTip = _errorTip;
  }
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

/**
 * DOM: 更新验证码提示
 * @param {String} vCodeTip 验证码提示
 */
function updateVCodeTip(vCodeTip) {
  // TODO: DOM: 更新验证码提示
  if (!vCodeTip) {
    vCodeTip = _resVCodeTip;
  }
  document.getElementById("simCaptcha-vCodeTip").innerText = vCodeTip;
}

/**
 * 更新验证码图片src
 * @param {String} imgSrc 验证码图片的src值
 */
function updateImgSrc(imgSrc) {
  // TODO: DOM: 更新图片src
  if (!imgSrc) {
    imgSrc = _resVCodeImg;
  }
  document.getElementById("simCaptcha-img").src = imgSrc;
}

/**
 * 清空图片上的全部点触标记
 */
function clearPointMark() {
  // #simCaptcha-marks 内元素全部移除
  // TODO: 需DOM操作
  document.getElementById("simCaptcha-marks").innerHTML = "";
}

/***
 * 将用户点击验证码的位置数据发送到验证码服务端   (每个位置(x轴, y轴))
 */
function sendVCodePos() {
  var ts = Date.now(); // js 13位 毫秒时间戳
  var verifyInfo = {
    appId: _appId,
    vCodePos: _vCodePos,
    userId: _resUserId,
    ua: navigator.userAgent,
    ts: ts,
  }; // ua, ts 服务端暂时未用，保留。用户花费在此验证码的时间 = 验证码服务端 接收到点击位置数据时间 - 验证码服务端 产生验证码图片时间
  // 发送ajax到验证码服务端 -> 得到response结果，封装为 res
  httpPost(_reqVCodeCheckUrl, verifyInfo, function (response) {
    // code: 0: 通过验证
    if (response.code == 0) {
      // 通过验证 -> 1.回调callback（成功回调） 2.销毁验证码弹出层destroy
      var res = {
        code: 0,
        userId: _resUserId,
        ticket: response.data.ticket,
        appId: response.data.appId,
        bizState: null,
      }; // bizState自定义透传参数，暂未实现，保留
      // 将 从验证码服务端得到的 appId, ticket存起来
      _resAppId = res.appId; // TODO: 暂时无用，可以将这个验证码服务端返回的_resAppId与 当前客户端浏览器存的_appId做比较
      _resTicket = res.ticket;
      _callback(res);
      // 在摧毁验证码层之前，先在验证码层展示成功通过验证提示
      showSuccessTip();
    } else {
      // 未通过验证 -> 1.提示用户 2.if(错误次数未达上限)：清空用户点击验证码的位置数据，重置，让用户重新点击 3.else(错误次数达到上限)：刷新验证码弹出层（请求新验证码图片，更新验证码提示）
      // code: -1: 验证码错误 且 错误次数未达上限
      if (response.code == -1) {
        _errorTip = "点错啦, 请重试";
        // 清空点触位置数据
        _vCodePos = [];
        // 清除图片上的全部点触标记
        clearPointMark();
      } else if (response.code == -2) {
        // code: -2: 验证码错误 且 错误次数已达上限
        _errorTip = "这题有点难, 为你换一个试试吧";
        refreshVCode();
      } else if (response.code == -3) {
        // 验证码无效（被篡改）
        _errorTip = "验证码无效, 为你换一个试试吧";
        refreshVCode();
      } else if (response.code == -4) {
        // 验证码过期
        _errorTip = "验证码过期, 为你换一个试试吧";
        refreshVCode();
      } else if (response.code == -5) {
        // 验证码无效
        _errorTip = "验证码过期, 为你换一个试试吧";
        refreshVCode();
      }
      // 更新错误提示
      updateErrorTip(_errorTip);
    }
  });
}

/***
 * 刷新验证码弹出层：1.刷新验证码图片，2.更新验证码提示 3. 清空点触位置数据 4.清空图片上的全部点触标记
 */
function refreshVCode() {
  // 清空点触位置数据
  _vCodePos = [];
  // 清除图片上的全部点触标记
  clearPointMark();
  // ajax请求新的验证码图片base64
  httpGet(_reqVCodeImgUrl, function (response) {
    if (response.code == 0) {
      // 成功获取新验证码
      // 保存并更新 验证码图片
      _resVCodeImg = response.data.vCodeImg;
      // 更新验证码提示
      _resVCodeTip = response.data.vCodeTip;
      // 保存/更新 用户此次会话唯一标识
      _resUserId = response.data.userId;
    } else {
      // 获取验证码失败
      _errorTip = response.message;
    }

    updateImgSrc();
    updateVCodeTip();
    // fixed: 首次弹出验证码层时,震动
    // fixed: 刷新时显示错误提示
    // if(_errorTip) {
    // 	updateErrorTip();
    // }
  });
}

/***
 * 显示验证码弹出层
 */
function show() {
  // if(没有验证码数据) 先请求新验证码数据
  if (_resVCodeImg == "") {
    // 请求新验证码数据
    refreshVCode();
  }

  // TODO: 需DOM操作
  // 显示遮罩阴影
  document.getElementById("simCaptcha-mask").className = "simCaptcha-show";
  // 显示验证码弹出层
  document.getElementById("simCaptcha-layer").className = "simCaptcha-show";
}

/**
 * 验证码图片被点击时
 */
function imgClick(event) {
  // console.log(this); // 拿到的是这个 <img />元素
  var e = event || window.event;
  // console.log(e); // 图片被点击的事件

  var pxPos = getImgClickPos(this, e);
  // 在点击处创建点标记
  createPointMark(pxPos);

  // 记录点击位置数据(转换为 相对于图片的百分比 位置), 放入 _vCodePos
  var percentPos = pxToPercentPos(pxPos);
  _vCodePos.push(percentPos);
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

/**
 * 获取点击位置(相对于图片的相对位置)(px)
 * @param obj 事实上始终为验证码图片元素
 * @param event 验证码图被点击的事件
 * @return {Object} { x: 123, y:123 } (px)
 */
function getImgClickPos(obj, event) {
  // https://www.cnblogs.com/jiangxiaobo/p/6593584.html
  // (1)原生js
  // var clickX = event.clientX + document.body.scrollLeft;// 点击x 相对于整个html文档
  // var clickY = event.clientY + document.body.scrollTop;// 点击y 相对于整个html文档

  // var objX = getOffsetLeft(obj);// 对象x 相对于整个html文档
  // var objY = getOffsetTop(obj);// 对象y 相对于整个html文档

  // var xOffset = clickX - objX;
  // var yOffset = clickY - objY;
  // // 临时修复位置不正确
  // xOffset = xOffset + 200 - 10 - 10;
  // yOffset = yOffset + 200 - 10 - 10;

  // (2)不考虑Firefox
  var xOffset = event.offsetX;
  var yOffset = event.offsetY;

  // (3)依赖 jQuery
  // var xOffset = event.clientX - ($(obj).offset().left - $(window).scrollLeft());;
  // var yOffset = event.clientY - ($(obj).offset().top - $(window).scrollTop());;

  return { x: xOffset, y: yOffset };
}

/**
 * 创建点标记
 * @param pos {Object} 相对于图片的位置( { x: 12, y: 56 } ) (单位px)
 */
function createPointMark(pos) {
  var num = _vCodePos.length + 1;
  pos.x = parseInt(pos.x);
  pos.y = parseInt(pos.y);
  // TODO: DOM操作 创建点标记
  var markHtml = '<div id="simCaptcha-mark-{2}" class="simCaptcha-mark" style="left:{0}px;top:{1}px;">{2}</div>'.format(
    pos.x - 10,
    pos.y - 10,
    num
  );

  var marksElement = document.getElementById("simCaptcha-marks");

  // 方案1
  // 这样做, 会更新 marks 内的所有 node, 所以导致除最新node，其他mark注册的事件均失效(不是原node了)
  // marksElement.innerHTML = marksElement.innerHTML + markHtml;
  // // 遍历下面的所有子节点, 重写注册
  // marksElement.childNodes.forEach(element => {
  // 	element.onclick = markClick;
  // });

  // 方案2
  // 只是在之后插入新node, 不更新之前已有node
  marksElement.insertAdjacentHTML("beforeend", markHtml);
  document.getElementById("simCaptcha-mark-" + num).onclick = markClick;
}

/**
 * 标记被点击: eg:当前标记序号(1)(2)(3)(4)(5), 点击(3), 移除(3)(4)(5)
 */
function markClick() {
  // console.log(this); // 当前被点击标记元素
  var clickedNum = parseInt(this.innerText);
  var length = _vCodePos.length;
  for (var i = clickedNum - 1; i < length; i++) {
    // 将(clickedNum)及之后的标记html移除
    var temp = document.getElementById("simCaptcha-mark-" + (i + 1));
    removeElement(temp);

    // 将vCodePos中 clickedNum及之后的位置数据移除
    var removePos = _vCodePos.pop();

    // console.log(removePos);
  }
}

/**
 * 初始化, new SimCaptcha() 中 执行
 */
function init() {
  var htmlLayer =
    '<div id="simCaptcha-mask" class="simCaptcha-hidden"></div>\
						<div id="simCaptcha-layer" class="simCaptcha-hidden" >\
							<div id="simCaptcha-vCodeTip"></div>\
							<div id="simCaptcha-img-box">\
                <img id="simCaptcha-img" />\
                <div id="simCaptcha-loading">加载中...</div>\
								<div id="simCaptcha-marks"></div>\
								<span id="simCaptcha-errorTip"></span>\
							</div>\
							<div class="simCaptcha-bottom">\
								<button id="simCaptcha-btn-close">&#xe60a;</button>\
								<button id="simCaptcha-btn-refresh">&#xe675;</button>\
								<button id="simCaptcha-btn-confirm">确认</button>\
							</div>\
						</div>';
  // body内(最底部) 插入验证码弹出层, 初始隐藏
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
  // https://segmentfault.com/q/1010000003697751
  document.body.insertAdjacentHTML("beforeend", htmlLayer);

  // 绑定点击事件
  _element.onclick = show;

  document.getElementById("simCaptcha-btn-close").onclick = hidden;

  document.getElementById("simCaptcha-btn-refresh").onclick = refreshVCode;

  document.getElementById("simCaptcha-btn-confirm").onclick = sendVCodePos;

  document.getElementById("simCaptcha-img").onclick = imgClick;
}

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (s, i) {
    return args[i];
  });
};

/**
 * 导出的 SimCaptcha
 * @param {*} options 
 */
function SimCaptcha(options) {
  this.options = handleOption(options);

  _element = this.options.element;
  _appId = this.options.appId;
  _callback = this.options.callback;

  _reqVCodeImgUrl = this.options.imgUrl;
  _reqVCodeCheckUrl = this.options.checkUrl;

  init();
}
SimCaptcha.prototype = {
  constructor: SimCaptcha,

  /***
   * 显示验证码
   */
  show: show,

  /***
   * 隐藏当前验证码弹出层，下次show 将使用当前验证码图片base64
   * 用于用户手动点击关闭按钮
   */
  hidden: hidden,

  /***
   * 摧毁当前验证码（隐藏验证码弹出层，清除验证码图片base64），下次show 将请求新验证码图片base64
   */
  destroy: destroy,

  /***
   * return: Object:{"appId":"","ticket":""}
   */
  getTicket: function () {
    return {
      appId: _resAppId,
      ticket: _resTicket
    };
  },
};


export default SimCaptcha;
