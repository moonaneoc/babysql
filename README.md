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
const BabySQL = require('babysql');

const q = BabySQL
  .select('users')
  .columns(['id', 'name'])
  .where('status', '=', 'active')
  .orderBy('id', 'DESC')
  .limit(20)
  .build();

console.log(q.sql);
console.log(q.params);
```

---

## 模糊查询（LIKE）

```js
const BabySQL = require('babysql');

BabySQL
  .select('users')
  .whereLike('name', 'alice')   // name LIKE '%alice%'
  .build();
```

---

## 分页查询

```js
const BabySQL = require('babysql');

BabySQL
  .select('posts')
  .paginate(3, 10)   // 第3页，每页10条
  .build();
```

---

## INSERT

```js
const BabySQL = require('babysql');

BabySQL
  .insert('users')
  .data({ name: 'bob', age: 20 })
  .build();
```

---

## UPDATE

```js
const BabySQL = require('babysql');

BabySQL
  .update('users')
  .data({ name: 'newname' })
  .where('id', '=', 1)
  .build();
```

---

## DELETE

```js
const BabySQL = require('babysql');

BabySQL
  .delete('users')
  .where('id', '=', 5)
  .build();
```

---

## whereIn

```js
const BabySQL = require('babysql');

BabySQL
  .select('products')
  .whereIn('id', [1, 2, 3])
  .build();
```

---

## whereRaw

```js
const BabySQL = require('babysql');

BabySQL
  .select('logs')
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
