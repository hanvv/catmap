# 🔧 代码生成器故障排除指南

## 常见 SQL 错误及解决方案

### ❌ 错误 1: SQL 语法错误（表名格式）

**错误信息**：
```
You have an error in your SQL syntax; check the manual that corresponds to your MySQL 
server version for the right syntax to use near ', 'cat_badges', 'cat_likes'
```

**原因**：表名配置格式不正确

**❌ 错误的配置**：
```javascript
// 错误 1: 把多个表名放在一个字符串中
const TABLE_NAMES = ['products, categories, orders']

// 错误 2: 使用了对象或其他格式
const TABLE_NAMES = [{ name: 'products' }]

// 错误 3: 表名包含空格
const TABLE_NAMES = ['products ', ' categories']
```

**✅ 正确的配置**：
```javascript
const TABLE_NAMES = [
  'products',      // ✅ 每个表名单独一个字符串
  'categories',    // ✅ 用逗号分隔
  'orders',
]
```

---

### ❌ 错误 2: 数据库连接失败

**错误信息**：
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**原因**：无法连接到 MySQL 服务器

**解决方案**：

1. **检查 MySQL 是否运行**
```bash
# Windows
net start MySQL80

# macOS/Linux
sudo systemctl start mysql
# 或
sudo service mysql start
```

2. **检查端口是否正确**
```javascript
const DB_CONFIG = {
  host: 'localhost',
  port: 3306,  // MySQL 默认端口
  // ...
}
```

3. **检查防火墙设置**

---

### ❌ 错误 3: 访问被拒绝

**错误信息**：
```
Error: Access denied for user 'root'@'localhost' (using password: YES)
```

**原因**：用户名或密码错误

**解决方案**：

1. **检查用户名和密码**
```javascript
const DB_CONFIG = {
  user: 'root',              // 确认用户名
  password: 'your_password', // 确认密码
  // ...
}
```

2. **测试数据库连接**
```bash
mysql -u root -p
# 输入密码后应该能登录
```

3. **重置 MySQL 密码**（如果忘记密码）

---

### ❌ 错误 4: 数据库不存在

**错误信息**：
```
Error: Unknown database 'your_database'
```

**原因**：指定的数据库不存在

**解决方案**：

1. **检查数据库名称**
```bash
# 登录 MySQL
mysql -u root -p

# 查看所有数据库
SHOW DATABASES;
```

2. **创建数据库**（如果不存在）
```sql
CREATE DATABASE your_database DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **更新配置**
```javascript
const DB_CONFIG = {
  database: 'your_database',  // 使用正确的数据库名
  // ...
}
```

---

### ❌ 错误 5: 表不存在

**错误信息**：
```
⚠️ 表 products 不存在或没有列，跳过
```

**原因**：指定的表在数据库中不存在

**解决方案**：

1. **查看数据库中的所有表**
```sql
USE your_database;
SHOW TABLES;
```

2. **检查表名拼写**
```javascript
// 表名区分大小写（在某些系统上）
const TABLE_NAMES = [
  'Products',  // ❌ 如果实际表名是 products
  'products',  // ✅ 正确
]
```

3. **查看表结构**
```sql
DESC products;
```

---

### ❌ 错误 6: 字符编码问题

**错误信息**：
生成的代码中中文显示为乱码

**解决方案**：

1. **设置数据库连接编码**
```javascript
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database',
  port: 3306,
  charset: 'utf8mb4',  // ✅ 添加这行
}
```

2. **检查数据库编码**
```sql
SHOW VARIABLES LIKE 'character_set%';
```

3. **修改表编码**
```sql
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### ❌ 错误 7: 文件写入权限错误

**错误信息**：
```
Error: EACCES: permission denied
```

**原因**：没有写入文件的权限

**解决方案**：

1. **检查目录权限**
```bash
# macOS/Linux
chmod -R 755 src/

# Windows - 以管理员身份运行
```

2. **检查文件是否被占用**
- 关闭可能打开文件的编辑器或进程

---

## 🔍 调试技巧

### 1. 启用详细日志

修改生成器，添加更多日志：

```javascript
// 在 getTableStructure 函数中添加
console.log('执行 SQL:', query)
console.log('参数:', [DB_CONFIG.database, tableName])
```

### 2. 测试单个表

先测试一个表，确认配置正确：

```javascript
const TABLE_NAMES = ['products']  // 只测试一个
```

### 3. 手动测试 SQL

在 MySQL 命令行中测试 SQL：

```sql
USE your_database;

SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'your_database' 
  AND TABLE_NAME = 'products'
ORDER BY ORDINAL_POSITION;
```

---

## ⚡ 快速检查清单

在运行生成器之前，确认：

- [ ] MySQL 服务正在运行
- [ ] 数据库存在且可访问
- [ ] 表名拼写正确
- [ ] 用户名和密码正确
- [ ] 端口号正确（默认 3306）
- [ ] 有写入 src/ 目录的权限
- [ ] TABLE_NAMES 格式正确（字符串数组）

---

## 💡 配置验证脚本

创建 `scripts/test-connection.js` 测试数据库连接：

```javascript
import mysql from 'mysql2/promise'

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database',
  port: 3306,
}

async function testConnection() {
  try {
    console.log('🔍 测试数据库连接...')
    const connection = await mysql.createConnection(DB_CONFIG)
    console.log('✅ 连接成功!')
    
    const [databases] = await connection.query('SHOW DATABASES')
    console.log('📊 可用数据库:', databases.map(db => db.Database).join(', '))
    
    await connection.query(`USE ${DB_CONFIG.database}`)
    const [tables] = await connection.query('SHOW TABLES')
    console.log(`📋 ${DB_CONFIG.database} 中的表:`, 
      tables.map(t => Object.values(t)[0]).join(', '))
    
    await connection.end()
  } catch (error) {
    console.error('❌ 连接失败:', error.message)
  }
}

testConnection()
```

运行测试：
```bash
node scripts/test-connection.js
```

---

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **检查完整的错误信息**
   - 复制完整的错误堆栈
   - 包括错误代码（如 `ER_BAD_DB_ERROR`）

2. **检查 MySQL 版本**
```bash
mysql --version
```

3. **检查 Node.js 版本**
```bash
node --version
```

4. **查看生成器日志**
   - 运行生成器时的完整输出

---

## ✅ 成功运行的示例

正确的配置和输出：

```javascript
// generate-fixed.js
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'mypassword',
  database: 'mystore',
  port: 3306,
}

const TABLE_NAMES = [
  'products',
  'categories',
]
```

```bash
$ node generate-fixed.js

🚀 修复和增强版代码生成器启动

✨ 新特性:
  - ✅ 修复 DataTable 导入错误
  - ✅ 支持批量生成多表
  - ✅ 使用字段注释作为标签
  - ✅ 生成正确的 Table 实现

📋 准备生成以下表的代码:
   1. products
   2. categories

📡 连接数据库...
✅ 数据库连接成功

📊 处理表: products
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 找到 8 个字段
📝 发现 5 个字段有注释，将用作表单标签
  ✅ Schema
  ✅ Constants
  ✅ Columns
  ✅ Table
  ✅ Row Actions
  ✅ Main
  ✅ Route

📊 处理表: categories
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 找到 5 个字段
  ✅ Schema
  ...

✅ 成功: 2 个表
   - products (7 个文件)
   - categories (7 个文件)
```

---

祝你使用愉快！🚀

