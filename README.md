# babysql

一个轻量、简单的 SQL 生成器

---

## 安装

```bash
npm install babysql
```

---

## 基本 SELECT 查询

```js
const { BabySQL } = require("babysql");

const q = BabySQL.select('users')
    .columns(['id', 'name'])
    .where('status', '=', 'active')
    .orderBy('id', 'DESC')
    .limit(20)
    .debug()
    .build();
```

---

## 模糊查询（LIKE）

```js
const { BabySQL } = require("babysql");

const q = BabySQL.select('users')
    .whereLike('name', 'alice')   // name LIKE '%alice%'
    .build();
```

## COUNT 查询

```js
const { BabySQL } = require("babysql");

const q = BabySQL.count('users')
    .countColumn('id', 'userCount')
    .build();
```

---

## 分页查询

```js
const { BabySQL } = require("babysql");

const q = BabySQL.select('posts')
    .paginate(3, 10)   // 第3页，每页10条
    .build();
```

---

## INSERT

```js
const { BabySQL } = require("babysql");

const q = BabySQL.insert('users')
    .data({ name: 'Alice', age: 25, created_at: new Date() })
    .build();
```

---

## UPDATE

```js
const { BabySQL } = require("babysql");

// 安全更新（必须带 WHERE）
const q = BabySQL.update('users')
    .data({ age: 26 })
    .where('id', '=', 1)
    .build();

// 全表更新（危险操作，需显式允许）
const q = BabySQL.update('users')
    .data({ status: 'inactive' })
    .allowUnsafe()
    .build();
```

---

## DELETE

```js
const { BabySQL } = require("babysql");

// 安全删除
const q = BabySQL.delete('users')
    .where('id', '=', 1)
    .build();

// 全表删除（危险操作）
const q = BabySQL.delete('users')
    .allowUnsafe()
    .build();
```

---

## 模糊查询 & IN 条件

```js
const { BabySQL } = require("babysql");

const q = BabySQL.select('products')
    .whereLike('name', 'book')        // 模糊查询 %book%
    .whereIn('category_id', [1, 2, 3])
    .build();
```

---

## whereRaw

```js
const { BabySQL } = require("babysql");

const q = BabySQL.select('logs')
  .whereRaw('created_at > ?', ['2024-01-01'])
  .build();
```

---

## 返回结构

```js
{
  sql: string,     // 最终 SQL
  params: any[]    // 参数数组
}
```
