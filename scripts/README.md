# 路由代码生成器

根据 MySQL 数据库表结构自动生成完整的路由代码和相关组件。

## 📦 三个版本

### 1. `generate-fixed.js` - 修复增强版 🌟 **最新推荐**
- ✅ 修复了 DataTable 导入错误
- ✅ 支持批量生成多表
- ✅ 使用数据库字段注释作为标签
- ✅ 生成正确的 Table 实现
- 适合：所有场景，特别是多表批量生成

### 2. `generate-complete-module.js` - 完整版
- 生成完整的 CRUD 功能模块
- 包括表单、对话框、批量操作等
- ⚠️ 有 DataTable 导入错误，建议使用修复版

### 3. `generate-route-from-db.js` - 基础版
- 生成基本的路由和表格组件
- ⚠️ 有 DataTable 导入错误，建议使用修复版

## 🚀 快速开始

### 1. 安装依赖

```bash
cd scripts
npm install
```

### 2. 配置数据库

编辑 `generate-route-from-db.js` 文件，修改数据库配置：

```javascript
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database',
  port: 3306,
}

// 要生成代码的表名
const TABLE_NAME = 'users'
```

### 3. 运行生成器

```bash
node generate-route-from-db.js
```

## 📦 生成的文件

运行后会生成以下文件结构：

```
src/
├── features/
│   └── {table_name}/
│       ├── data/
│       │   ├── schema.ts          # Zod 验证模式
│       │   └── data.ts            # 常量数据
│       ├── components/
│       │   ├── {table}-columns.tsx       # 表格列定义
│       │   ├── {table}-table.tsx         # 表格组件
│       │   └── data-table-row-actions.tsx # 行操作
│       └── index.tsx              # 主组件
└── routes/
    └── _authenticated/
        └── {table_name}/
            └── index.tsx          # 路由文件
```

## ✨ 功能特性

- ✅ 自动从 MySQL 读取表结构
- ✅ 生成 Zod 验证 Schema
- ✅ 生成 TypeScript 类型定义
- ✅ 生成 TanStack Table 列定义
- ✅ 生成 TanStack Router 路由配置
- ✅ 生成完整的 CRUD 组件框架
- ✅ 支持所有常见 MySQL 数据类型
- ✅ 自动处理枚举类型
- ✅ 智能命名转换（snake_case → camelCase）

## 🔧 MySQL 类型映射

| MySQL 类型 | Zod 类型 | TypeScript 类型 |
|-----------|---------|----------------|
| INT, BIGINT | z.number() | number |
| VARCHAR, TEXT | z.string() | string |
| DECIMAL, FLOAT | z.number() | number |
| DATE, DATETIME | z.coerce.date() | Date |
| BOOLEAN, TINYINT(1) | z.boolean() | boolean |
| ENUM | z.enum([...]) | string literal |
| JSON | z.any() | any |

## 📝 使用示例

### 示例 1: 生成产品管理模块

```javascript
// 修改配置
const TABLE_NAME = 'products'
const FEATURE_NAME = 'products'

// 运行生成器
node generate-route-from-db.js
```

这会生成：
- `/products` 路由
- 产品列表页面
- 产品数据表格
- CRUD 操作框架

### 示例 2: 生成订单管理模块

```javascript
const TABLE_NAME = 'orders'
const FEATURE_NAME = 'orders'
```

## 🎯 后续步骤

生成代码后，你需要：

1. **添加 API 调用**
   - 在 `{table}-table.tsx` 中替换模拟数据
   - 使用 TanStack Query 进行数据获取

2. **自定义表单**
   - 创建添加/编辑表单组件
   - 使用 React Hook Form + Zod

3. **完善业务逻辑**
   - 添加删除确认对话框
   - 实现批量操作
   - 添加过滤和搜索

4. **更新导航**
   - 在 `src/components/layout/data/sidebar-data.ts` 添加菜单项

## 🔥 高级功能

### 自定义字段映射

如果需要自定义字段类型映射，修改 `mysqlToZodType` 函数：

```javascript
function mysqlToZodType(columnType, isNullable) {
  // 添加你的自定义逻辑
  if (columnType === 'custom_type') {
    return 'z.string().email()'
  }
  // ...
}
```

### 添加关系数据

生成的 Schema 支持扩展关系：

```typescript
// 在 schema.ts 中添加
const productSchema = z.object({
  // ... 自动生成的字段
  category: categorySchema, // 添加关系
  tags: z.array(tagSchema), // 添加关系
})
```

## ⚠️ 注意事项

1. **备份数据**: 生成前建议备份现有代码
2. **数据库权限**: 确保有读取表结构的权限
3. **表命名**: 建议使用复数形式的表名（users, products）
4. **手动调整**: 生成的代码是基础框架，需要根据业务调整

## 🐛 故障排除

### 连接失败

```bash
Error: ER_ACCESS_DENIED_ERROR
```

检查数据库配置和权限。

### 找不到表

```bash
Error: 表 xxx 不存在或没有列
```

确认表名正确且存在于指定数据库中。

## 📚 相关文档

- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [Zod](https://zod.dev/)
- [Shadcn UI](https://ui.shadcn.com/)

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT

