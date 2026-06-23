# 魔王S流浪用户版

魔王S流浪用户版是一个本地运行的魔王S鼠标配置工具。页面通过 WebHID 和设备通信，配置数据来自本地 `mowang_data.json`，不依赖云端接口。

## 功能

- 本地加载压枪配置数据
- 通过 WebHID 连接鼠标
- 设置开镜模式、关闭按键、启动按键
- 保存压枪参数到第一把到第六把配置槽
- 保存后自动启用当前配置槽

## 运行方式

需要安装 Node.js，并使用支持 WebHID 的 Chrome 或 Edge 浏览器。

```powershell
cd D:\mowang
node server.js
```

然后打开：

```text
http://localhost:8080
```

如果你把项目放到其他目录，也可以在该目录中运行 `node server.js`。

## 文件说明

- `index.html`：主界面和 WebHID 通信逻辑
- `server.js`：本地静态文件服务器
- `mowang_data.json`：本地配置数据
- `local.html`：旧版/简化版页面

## 注意事项

- WebHID 需要在浏览器中手动授权设备。
- 保存配置后，如果重启电脑或重新连接设备，建议重新打开页面并确认当前配置槽已启用。
- 本项目仅用于本地设备配置和学习交流。

## License

本项目使用 MIT License，详见 `LICENSE`。
