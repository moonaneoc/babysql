# babysql 发布指南

## 步骤

1. **安装依赖**

```bash
npm install
```

2. **构建**

运行：

```bash
npm run build
```

生成 `dist/` 目录。

3. **登录 npm 并发布**

```bash
npm login
npm version patch / npm version minor / npm version major
npm publish
```