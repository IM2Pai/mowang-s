# 魔王S流浪用户版

魔王S流浪用户版是一个本地运行的魔王S鼠标配置工具。页面通过 WebHID 和设备通信，配置数据默认来自本地 `mowang_data.json`，不依赖云端接口即可使用。

## 功能

- 本地加载压枪配置数据
- 通过 WebHID 连接鼠标
- 设置开镜模式、关闭按键、启动按键
- 保存压枪参数到第一把到第六把配置槽
- 页面保留第 4/5 段实验输入，但当前设备回写验证只确认前 3 段会被固件保存并执行
- 保存后自动启用当前配置槽
- 连接设备后自动读取硬件配置，读取不到时恢复浏览器中上次保存的配置

## 运行方式

需要安装 Node.js，并使用支持 WebHID 的 Chrome 或 Edge 浏览器。

```powershell
git clone https://github.com/IM2Pai/mowang-s.git
cd mowang-s
node server.js
```

然后打开：

```text
http://localhost:8080
```

如果你把项目放到其他目录，也可以在该目录中运行 `node server.js`。

## 更新配置数据

仓库中保留了一份数据更新脚本：[update_data.js](./update_data.js)。它会请求原始接口，把成功获取到的 ID 数据合并进本地 `mowang_data.json`。

默认从当前数据最大 ID 的下一个 ID 开始，向后扫描 500 个 ID：

```powershell
node update_data.js
```

也可以手动指定范围：

```powershell
node update_data.js --start=1 --end=7000
```

如果以后接口参数变化，可以通过参数覆盖：

```powershell
node update_data.js --api=https://hub.mowangs.com/client/sjzgetdata/?id= --mcu=cb3c84ee
```

可选参数：

- `--start=数字`：开始 ID
- `--end=数字`：结束 ID
- `--delay=毫秒`：每次请求之间的等待时间，默认 `30`
- `--stop-empty=数字`：连续多少个 ID 没有数据后停止，默认 `100`
- `--save-every=数字`：每检查多少个 ID 自动保存一次，默认 `100`
- `--api=地址`：接口地址前缀，脚本会在末尾拼接 ID
- `--mcu=值`：请求头里的 `mcu` 参数

## 文件说明

- `index.html`：主界面和 WebHID 通信逻辑
- `server.js`：本地静态文件服务器
- `mowang_data.json`：本地配置数据
- `update_data.js`：配置数据更新脚本
- `logo.png`：本地图标

## 协议说明

- 每段压枪数据占 11B：时间 2B、最大时间 2B、延迟最小/最大 2B、主 XY 2B、备用 XY 2B、间隔 1B。
- 当前页面可以实验性按 5 段打包，配置负载为 58B。前 36B 保持原 3 段格式不变：开头 1B 是启动按键，`0x22-0x23` 是数据 ID。
- 第 4 段从 `0x24` 开始，第 5 段从 `0x2F` 开始。但实测设备回写会把第 4/5 段清零，说明当前 `[weaponSlot, 0x00, ...config]` 写入命令大概率只保存并执行前三段。
- 写入设备时还会在负载前加上槽位和写入标记 `[weaponSlot, 0x00]`，所以一次写入报告长度为 60B。

## 注意事项

- WebHID 需要在浏览器中手动授权设备。
- 保存配置后，如果重启电脑或重新连接设备，建议重新打开页面并确认当前配置槽已启用。
- 数据更新脚本会访问原始接口，请合理控制请求范围和请求频率。
- 本项目仅用于本地设备配置和学习交流。

## License

本项目使用 MIT License，详见 `LICENSE`。
