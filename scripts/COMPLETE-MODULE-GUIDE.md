# 🚀 完整功能模块生成器使用指南

## 概述

`generate-complete-module.js` 是一个强大的代码生成器，能从 MySQL 表结构生成**生产就绪**的完整 CRUD 功能模块。

## ✨ 生成内容

### 📁 完整文件列表（16个文件）

```
src/
├── features/{table_name}/
│   ├── data/
│   │   ├── schema.ts                  ✅ Zod 验证模式 + TypeScript 类型
│   │   ├── data.ts                    ✅ 常量数据
│   │   └── {table}-data.ts            ✅ 模拟数据（使用 Faker.js）
│   │
│   ├── components/
│   │   ├── {table}-provider.tsx       ✅ React Context Provider
│   │   ├── {table}-primary-buttons.tsx✅ 主操作按钮
│   │   ├── {table}-dialogs.tsx        ✅ 对话框集合
│   │   ├── {table}-action-dialog.tsx  ✅ 添加/编辑表单对话框
│   │   ├── {table}-delete-dialog.tsx  ✅ 删除确认对话框
│   │   ├── {table}-multi-delete-dialog.tsx ✅ 批量删除对话框
│   │   ├── {table}-columns.tsx        ✅ 表格列定义
│   │   ├── {table}-table.tsx          ✅ 数据表格组件
│   │   ├── data-table-row-actions.tsx ✅ 行操作（编辑/删除）
│   │   └── data-table-bulk-actions.tsx✅ 批量操作
│   │
│   └── index.tsx                      ✅ 主页面组件
│
└── routes/_authenticated/{table_name}/
    └── index.tsx                      ✅ TanStack Router 路由
```

## 🎯 快速开始

### 1. 安装依赖

```bash
cd scripts
npm install
```

### 2. 配置数据库

编辑 `generate-complete-module.js`：

```javascript
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',    // 你的密码
  database: 'your_database',    // 数据库名
  port: 3306,
}

const TABLE_NAME = 'products'   // 要生成的表名
const FEATURE_NAME = TABLE_NAME // 功能模块名
```

### 3. 运行生成器

```bash
node generate-complete-module.js
```

### 4. 查看生成结果

```
🚀 开始生成完整功能模块...

📡 连接数据库...
✅ 数据库连接成功

📊 读取表 products 的结构...
✅ 找到 8 个字段

📁 创建目录结构...
📝 生成代码文件...

  ✅ Schema
  ✅ Data Constants
  ✅ Mock Data
  ✅ Provider
  ✅ Primary Buttons
  ✅ Dialogs
  ✅ Action Dialog
  ✅ Delete Dialog
  ✅ Multi Delete Dialog
  ✅ Bulk Actions
  ✅ Row Actions
  ✅ Table Columns
  ✅ Table Component
  ✅ Main Component
  ✅ Route File

🎉 完整功能模块生成完成！

📋 生成的文件统计:
   - Data: 3 个文件
   - Components: 11 个文件
   - Main: 1 个文件
   - Route: 1 个文件
   总计: 16 个文件
```

## 📖 完整示例

### 假设你有这个数据库表：

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  category VARCHAR(50),
  status ENUM('active', 'inactive', 'draft') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 运行生成器后，你将获得：

## 🎨 生成的功能特性

### 1️⃣ Context Provider

自动生成的 Provider 管理组件状态：

```typescript
export function ProductsProvider({ children }) {
  const [open, setOpen] = useState<DialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)
  // ...
}

export const useProducts = () => {
  // Hook 供子组件使用
}
```

**功能**：
- ✅ 对话框状态管理
- ✅ 当前选中行管理
- ✅ 全局状态共享

### 2️⃣ 添加/编辑表单对话框

完整的表单对话框，包含验证：

```typescript
export function ProductsActionDialog({ currentRow, open, onOpenChange }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    // ...
  })
  
  return (
    <Dialog>
      <Form>
        {/* 自动生成所有字段的表单项 */}
      </Form>
    </Dialog>
  )
}
```

**功能**：
- ✅ React Hook Form 集成
- ✅ Zod 验证
- ✅ 自动填充（编辑模式）
- ✅ 错误提示

### 3️⃣ 删除确认对话框

安全的删除确认流程：

```typescript
export function ProductsDeleteDialog({ currentRow, open, onOpenChange }) {
  const [value, setValue] = useState('')
  
  // 需要输入 ID 确认删除
  const handleDelete = () => {
    if (value !== currentRow.id) return
    // 执行删除
  }
}
```

**功能**：
- ✅ 二次确认机制
- ✅ 输入验证
- ✅ 警告提示

### 4️⃣ 批量操作

选择多行进行批量操作：

```typescript
export function DataTableBulkActions({ table }) {
  return (
    <BulkActionsToolbar table={table}>
      <Button onClick={handleBulkDelete}>
        <Trash2 /> 批量删除
      </Button>
      {/* 更多批量操作 */}
    </BulkActionsToolbar>
  )
}
```

**功能**：
- ✅ 多选支持
- ✅ 批量删除
- ✅ 批量修改状态
- ✅ 选中计数

### 5️⃣ 行操作菜单

每行的快捷操作：

```typescript
export function DataTableRowActions({ row }) {
  const { setOpen, setCurrentRow } = useProducts()
  
  return (
    <DropdownMenu>
      <DropdownMenuItem onClick={() => { /* 编辑 */ }}>
        编辑
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => { /* 删除 */ }}>
        删除
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
```

**功能**：
- ✅ 编辑
- ✅ 删除
- ✅ 更多自定义操作

### 6️⃣ 数据表格

完整的数据表格功能：

```typescript
export function ProductsTable({ data, search, navigate }) {
  const table = useReactTable({
    data,
    columns: productsColumns,
    // 分页、排序、筛选...
  })
  
  return <DataTable table={table} bulkActions={<BulkActions />} />
}
```

**功能**：
- ✅ 分页
- ✅ 排序
- ✅ 筛选
- ✅ 列显示/隐藏
- ✅ URL 状态同步

### 7️⃣ 模拟数据

使用 Faker.js 生成测试数据：

```typescript
export const products = Array.from({ length: 100 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: faker.commerce.price(),
  stock: faker.number.int({ min: 0, max: 1000 }),
  category: faker.commerce.department(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'draft']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))
```

**功能**：
- ✅ 自动匹配字段类型
- ✅ 智能数据生成
- ✅ 可配置数量
- ✅ 固定种子（一致性）

## 🔄 完整工作流

```
┌─────────────────────┐
│   MySQL 数据库表    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  运行生成器脚本     │
│  (读取表结构)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  生成 16 个文件      │
│  - Schema           │
│  - Components       │
│  - Provider         │
│  - Dialogs          │
│  - Table            │
│  - Routes           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  可用的功能模块     │
│  - 列表页面         │
│  - 添加/编辑        │
│  - 删除             │
│  - 批量操作         │
└─────────────────────┘
```

## 🎨 自定义和扩展

### 1. 修改表单字段

编辑 `{table}-action-dialog.tsx`：

```typescript
// 添加自定义验证
const formSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  price: z.number().min(0, '价格不能为负数'),
  // ...
})

// 添加自定义输入组件
<FormField
  name='category'
  render={({ field }) => (
    <SelectDropdown
      items={categories}
      {...field}
    />
  )}
/>
```

### 2. 添加自定义列

编辑 `{table}-columns.tsx`：

```typescript
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => (
    <Badge variant={row.original.status === 'active' ? 'success' : 'default'}>
      {row.original.status}
    </Badge>
  ),
}
```

### 3. 集成真实 API

编辑 `{table}-table.tsx`：

```typescript
import { useQuery } from '@tanstack/react-query'

export function ProductsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  })

  if (isLoading) return <Skeleton />
  
  // ...
}
```

### 4. 添加更多批量操作

编辑 `data-table-bulk-actions.tsx`：

```typescript
<Button onClick={handleBulkExport}>
  <Download /> 导出选中
</Button>

<Button onClick={handleBulkUpdateStatus}>
  <Check /> 批量激活
</Button>
```

## 🆚 与基础版对比

| 功能 | 基础版 | 完整版 |
|------|-------|-------|
| Schema 生成 | ✅ | ✅ |
| 路由生成 | ✅ | ✅ |
| 表格组件 | ✅ | ✅ |
| 列定义 | ✅ | ✅ |
| Provider | ❌ | ✅ |
| 添加/编辑表单 | ❌ | ✅ |
| 删除确认 | ❌ | ✅ |
| 批量操作 | ❌ | ✅ |
| 行操作菜单 | 基础 | 完整 |
| 对话框管理 | ❌ | ✅ |
| 模拟数据 | ❌ | ✅ |
| 生产就绪 | ❌ | ✅ |

## 📚 技术栈

生成的代码使用以下技术：

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **TanStack Router** - 路由管理
- **TanStack Table** - 数据表格
- **React Hook Form** - 表单处理
- **Zod** - 数据验证
- **Shadcn UI** - UI 组件
- **Faker.js** - 模拟数据

## 🎯 使用场景

### ✅ 适合使用完整版的场景：

1. **企业级管理后台** - 需要完整的 CRUD 功能
2. **数据管理系统** - 需要批量操作
3. **内容管理系统** - 需要复杂的表单验证
4. **快速原型开发** - 需要快速验证想法
5. **学习示例** - 学习最佳实践

### ⚠️ 不适合的场景：

1. 表结构极其复杂（>20个字段）
2. 需要高度定制的 UI
3. 非标准的 CRUD 操作
4. 实时数据更新需求

对于不适合的场景，可以生成后再手动调整。

## 🔧 故障排除

### 问题1：生成的表单字段太多

**解决**：编辑生成器中的 `editableFields` 过滤逻辑，或手动删除不需要的字段。

### 问题2：枚举类型未正确识别

**解决**：确保 MySQL 的 ENUM 类型格式正确，如 `ENUM('a', 'b', 'c')`。

### 问题3：日期字段显示不正确

**解决**：在列定义中添加日期格式化：

```typescript
cell: ({ row }) => (
  <div>{format(row.getValue('createdAt'), 'yyyy-MM-dd')}</div>
)
```

## 💡 最佳实践

1. ✅ **先生成后调整** - 生成基础代码，然后根据需求调整
2. ✅ **版本控制** - 生成前提交当前代码
3. ✅ **逐表生成** - 一次生成一个表，逐步测试
4. ✅ **代码审查** - 检查生成的代码质量
5. ✅ **文档记录** - 记录自定义修改

## 🎉 下一步

生成完成后：

1. ✅ 添加到侧边栏导航
2. ✅ 集成真实 API
3. ✅ 自定义样式和布局
4. ✅ 添加数据验证规则
5. ✅ 编写单元测试
6. ✅ 优化用户体验

## 📞 支持

遇到问题？

1. 查看 `scripts/README.md` 基础文档
2. 查看 `scripts/USAGE.md` 使用指南
3. 检查 MySQL 连接和权限

祝你使用愉快！🚀

