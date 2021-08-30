import {
  httpGet,
  httpPost,
  getOffsetTop,
  getOffsetLeft,
  removeElement,
  updateImgSrc,
  updateVCodeTip,
} from "../../js/utils";

var _imgResponseData = {
  captchaType: "click",
  userId: "",
  vCodeTip: "",
  vCodeImg: "",
};

var _checkRequestData = {
  appId: "",
  userId: "",
  // 用户点击验证码图片的位置数据 {Array} eg:  [{ x: 12, y: 35 }, { x: 52, y: 35 }, { x: 32, y: 75 }]
  vCodePos: [],
};

var _errorTip = "";

/**
 * 清空图片上的全部点触标记
 */
function clearPointMark() {
  // #simCaptcha-marks 内元素全部移除
  // TODO: 需DOM操作
  document.getElementById("simCaptcha-marks").innerHTML = "";
}

/**
 * 创建点标记
 * @param pos {Object} 相对于图片的位置( { x: 12, y: 56 } ) (单位px)
 */
function createPointMark(pos) {
  //   var num = _vCodePos.length + 1;
  var num = _checkRequestData.vCodePos.length + 1;
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
 * 标记被点击: eg:当前标记序号(1)(2)(3)(4)(5), 点击(3), 移除(3)(4)(5)
 */
function markClick() {
  // console.log(this); // 当前被点击标记元素
  var clickedNum = parseInt(this.innerText);
  //   var length = _vCodePos.length;
  var length = _checkRequestData.vCodePos.length;
  for (var i = clickedNum - 1; i < length; i++) {
    // 将(clickedNum)及之后的标记html移除
    var temp = document.getElementById("simCaptcha-mark-" + (i + 1));
    removeElement(temp);

    // 将vCodePos中 clickedNum及之后的位置数据移除
    // var removePos = _vCodePos.pop();
    var removePos = _checkRequestData.vCodePos.pop();

    // console.log(removePos);
  }
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

function clear() {
  // 清空点触位置数据
  // _vCodePos = [];
  _checkRequestData.vCodePos = [];
  // 清除图片上的全部点触标记
  clearPointMark();
}

function refresh(response) {
  if (response.code == 0) {
    _imgResponseData.vCodeImg = response.data.vCodeImg;
    // 更新验证码提示
    _imgResponseData.vCodeTip = response.data.vCodeTip;
    // 保存/更新 用户此次会话唯一标识
    _imgResponseData.userId = response.data.userId;
  } else {
    // 获取验证码失败
    _errorTip = response.message;
  }

  updateImgSrc(_imgResponseData.vCodeImg);
  updateVCodeTip(_imgResponseData.vCodeTip);
}

function destroy() {
  // 清除全部点触标记
  clearPointMark();
  // 清空点触位置数据
  _vCodePos = [];
  // 清除验证码相关数据
  _resVCodeImg = "";
  _resVCodeTip = "";
}

function getCheck() {
  var ts = Date.now(); // js 13位 毫秒时间戳

  return {
    ua: navigator.userAgent,
    ts: ts,
    appId: _checkRequestData.appId,
    vCodePos: _checkRequestData.vCodePos,
    userId: _checkRequestData.userId,
  };
}

/**
 * 显示: 不一定是新创建, 有可能之前隐藏(还存在验证数据)
 * @param {*} isNew 
 */
function show(isNew) {
  if (isNew) {
    document.getElementById("simCaptcha-img").onclick = imgClick;
    document.getElementById("simCaptcha-img-plugin").innerHTML =
      '<div id="simCaptcha-marks"></div>';
  } else {
  }
}

export default {
  captchaType: "click",

  show: show,

  clear: clear,

  refresh: refresh,

  destroy: destroy,

  getCheck: getCheck,
};
