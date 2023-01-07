<p align="center">
<img src="docs/_images/logo.png" alt="sim-captcha-js">
</p>
<h1 align="center">sim-captcha-js</h1>

> :cake: 一个简单易用的点触验证码, SimCaptcha 前端的 JavaScript 实现

[![repo size](https://img.shields.io/github/repo-size/yiyungent/sim-captcha-js.svg?style=flat)]()
[![LICENSE](https://img.shields.io/github/license/yiyungent/sim-captcha-js.svg?style=flat)](https://github.com/yiyungent/sim-captcha-js/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/sim-captcha.svg)](https://www.npmjs.com/package/sim-captcha)
[![](https://data.jsdelivr.com/v1/package/npm/sim-captcha/badge)](https://www.jsdelivr.com/package/npm/sim-captcha)


<!-- [English](README_en.md) -->

## 介绍

轻松将点触验证码带入你的Web应用
 + **简单** - 简单易用.
 + **免费** - MIT协议 发布

## 在线演示

- http://captcha-client.yiyungent.eu.org:10002/index.html
  - 仅供演示, 不稳定, 且非最新版
  - 用户名，密码 均为 admin

## 安装

#### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/sim-captcha/dist/sim-captcha.min.js"></script>
```

#### npm
```bash
npm install sim-captcha --save
```

## 使用

### 使用模块管理器
```js
import SimCaptcha from 'sim-captcha';

const cap = new SimCaptcha(options);
```
### 在页面中使用
```html
    <body>
        <div id="app">
            <div>
                <input id="js-userName" type="text" placeholder="请输入用户名" />
                <input id="js-password" type="password" placeholder="请输入密码" />
            </div>
            <div>
                <input id="js-ticket" type="hidden">
				<input id="js-userId" type="hidden">
            </div>
            <div>
                <button id="js-verify">点击验证</button>
                <button id="js-login">登陆</button>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/sim-captcha/dist/sim-captcha.min.js"></script>
        <script>
            function successCallback(res) {
                if (res.code === 0) {
                    // 验证码服务端-验证通过
                    console.log("第一次验证通过");
                    // 第一次验证通过
                    $("#js-verify").text("验证通过");
                    $("#js-verify")[0].className = "btn btn-success btn-block";
                    // 准备 业务后台 第二次验证
                    $("#js-ticket").val(res.ticket);
                    $("#js-userId").val(res.userId);
                    console.log("第一次验证 结束");
                }
            }

            window.onload = function () {
                // 以下仅适用于 sim-captcha-js v0.1.0及以上版本
                window.simCaptcha = new SimCaptcha({
                    element: document.getElementById("js-verify"),
                    appId: "132132",
                    callback: successCallback,
                    baseUrl: "https://captcha.moeci.com", // 改为你自己的
                    imgUrl: "/api/vCode/VCodeImg",
                    checkUrl: "/api/vCode/VCodeCheck",
                });

                $("#js-login").click(function () {
                    // 获取用户名(手机号/邮箱), 密码, 票据
                    var userName = $("#js-userName").val().trim();
                    var password = $("#js-password").val();
                    var ticket = $("#js-ticket").val();
                    var userId = $("#js-userId").val();
                    if (!userName || !password) {
                        alert("请输入账号密码");
                        return false;
                    } else if (!ticket || !userId) {
                        alert("请点击验证");
                        return false;
                    }
                    // ajax将 userName, password, ticket, userId 发送到业务后台进行效验
                    // ...
                });

            }
        </script>
    </body>
```

## 相关项目

- [SimCaptcha](https://github.com/yiyungent/SimCaptcha)
- [vue-sim-captcha](https://github.com/yiyungent/vue-sim-captcha)
 
## 鸣谢

- 点触验证码设计参考自 <a href="https://github.com/wangchengqun/NetCoreVerificationCode" target="_blank">NetCoreVerificationCode</a>，感谢作者 wangchengqun 的贡献

## Donate

sim-captcha-js is an MIT licensed open source project and completely free to use. However, the amount of effort needed to maintain and develop new features for the project is not sustainable without proper financial backing.

We accept donations through these channels:
- <a href="https://afdian.net/@yiyun" target="_blank">爱发电</a>

## Author

**sim-captcha-js** © [yiyun](https://github.com/yiyungent), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by yiyun with help from contributors ([list](https://github.com/yiyungent/sim-captcha-js/contributors)).

> GitHub [@yiyungent](https://github.com/yiyungent)

