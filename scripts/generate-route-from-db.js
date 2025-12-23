/**
 * MySQL 表结构到路由代码生成器
 * 用法: node scripts/generate-route-from-db.js
 */

import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==================== 配置 ====================
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'catmap',
  port: 3306,
}

// 要生成代码的表名
const TABLE_NAME = ['cats', 'cat_badges', 'cat_likes'] // 修改为你的表名

// 生成的功能模块名称（复数形式，如 users, products, orders）
const FEATURE_NAME = TABLE_NAME

// ==================== 工具函数 ====================

/**
 * MySQL 类型到 Zod 类型的映射
 */
function mysqlToZodType(columnType, isNullable) {
  const type = columnType.toLowerCase()
  let zodType = 'z.unknown()'

  if (type.includes('int') || type.includes('bigint')) {
    zodType = 'z.number()'
  } else if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
    zodType = 'z.string()'
  } else if (type.includes('decimal') || type.includes('float') || type.includes('double')) {
    zodType = 'z.number()'
  } else if (type.includes('date') || type.includes('timestamp') || type.includes('datetime')) {
    zodType = 'z.coerce.date()'
  } else if (type.includes('boolean') || type.includes('tinyint(1)')) {
    zodType = 'z.boolean()'
  } else if (type.includes('json')) {
    zodType = 'z.any()'
  } else if (type.includes('enum')) {
    // 提取 enum 值
    const enumMatch = columnType.match(/enum\((.*)\)/i)
    if (enumMatch) {
      const values = enumMatch[1]
        .split(',')
        .map(v => v.trim().replace(/'/g, ''))
      zodType = `z.enum([${values.map(v => `'${v}'`).join(', ')}])`
    }
  }

  // 如果字段可为空
  if (isNullable === 'YES') {
    zodType += '.nullable().optional()'
  }

  return zodType
}

/**
 * MySQL 类型到 TypeScript 类型的映射
 */
function mysqlToTsType(columnType) {
  const type = columnType.toLowerCase()
  if (type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double')) {
    return 'number'
  } else if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
    return 'string'
  } else if (type.includes('date') || type.includes('timestamp') || type.includes('datetime')) {
    return 'Date'
  } else if (type.includes('boolean') || type.includes('tinyint(1)')) {
    return 'boolean'
  }
  return 'any'
}

/**
 * 转换为 PascalCase
 */
function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * 转换为 camelCase
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * 转换为 kebab-case
 */
function toKebabCase(str) {
  return str.replace(/_/g, '-').toLowerCase()
}

// ==================== 数据库查询 ====================

/**
 * 获取表结构信息
 */
async function getTableStructure(connection, tableName) {
  const [columns] = await connection.query(
    `SELECT 
      COLUMN_NAME as columnName,
      COLUMN_TYPE as columnType,
      IS_NULLABLE as isNullable,
      COLUMN_KEY as columnKey,
      COLUMN_DEFAULT as columnDefault,
      EXTRA as extra,
      COLUMN_COMMENT as columnComment
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION`,
    [DB_CONFIG.database, tableName]
  )
  return columns
}

// ==================== 代码生成器 ====================

/**
 * 生成 Schema 文件
 */
function generateSchema(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  
  const schemaFields = columns
    .map(col => {
      const fieldName = toCamelCase(col.columnName)
      const zodType = mysqlToZodType(col.columnType, col.isNullable)
      return `  ${fieldName}: ${zodType},`
    })
    .join('\n')

  return `import { z } from 'zod'

// 基于数据库表 ${TABLE_NAME} 自动生成

const ${toCamelCase(typeName)}Schema = z.object({
${schemaFields}
})

export type ${typeName} = z.infer<typeof ${toCamelCase(typeName)}Schema>

export const ${toCamelCase(typeName)}ListSchema = z.array(${toCamelCase(typeName)}Schema)
`
}

/**
 * 生成路由文件
 */
function generateRoute(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)

  return `import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ${componentName} } from '@/features/${featureName}'

const ${toCamelCase(featureName)}SearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // 添加你的过滤器字段
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/${featureName}/')({
  validateSearch: ${toCamelCase(featureName)}SearchSchema,
  component: ${componentName},
})
`
}

/**
 * 生成列定义文件
 */
function generateColumns(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  
  // 生成列定义
  const columnDefs = columns
    .filter(col => !['created_at', 'updated_at'].includes(col.columnName))
    .slice(0, 5) // 只生成前5个字段作为示例
    .map(col => {
      const fieldName = toCamelCase(col.columnName)
      return `  {
    accessorKey: '${fieldName}',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='${col.columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}' />
    ),
    cell: ({ row }) => <div>{row.getValue('${fieldName}')}</div>,
  },`
    })
    .join('\n')

  return `import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type ${typeName} } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const ${toCamelCase(featureName)}Columns: ColumnDef<${typeName}>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
${columnDefs}
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
`
}

/**
 * 生成主组件文件
 */
function generateIndexComponent(featureName) {
  const componentName = toPascalCase(featureName)

  return `import { ${componentName}Table } from './components/${toKebabCase(featureName)}-table'

export function ${componentName}() {
  return (
    <div className='flex h-full flex-1 flex-col space-y-2 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>${featureName.charAt(0).toUpperCase() + featureName.slice(1)}</h2>
          <p className='text-muted-foreground'>
            管理你的${featureName}数据
          </p>
        </div>
      </div>
      <${componentName}Table />
    </div>
  )
}
`
}

/**
 * 生成表格组件文件
 */
function generateTableComponent(columns, featureName) {
  const componentName = toPascalCase(featureName)
  const typeName = toPascalCase(featureName.replace(/s$/, ''))

  return `'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { ${toCamelCase(featureName)}Columns } from './${toKebabCase(featureName)}-columns'
import { type ${typeName} } from '../data/schema'

// 模拟数据 - 替换为真实的 API 调用
const mockData: ${typeName}[] = []

export function ${componentName}Table() {
  const data = useMemo(() => mockData, [])

  const table = useReactTable({
    data,
    columns: ${toCamelCase(featureName)}Columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className='space-y-4'>
      <DataTable table={table} />
    </div>
  )
}
`
}

/**
 * 生成 Row Actions 组件
 */
function generateRowActions(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))

  return `import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Pen, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ${typeName} } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<${typeName}>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex size-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem>
          <Pen className='me-2 size-3.5 text-muted-foreground/70' />
          编辑
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Trash className='me-2 size-3.5 text-muted-foreground/70' />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
`
}

/**
 * 生成 data.ts 文件（常量数据）
 */
function generateDataConstants(featureName) {
  return `// ${featureName} 相关的常量数据

export const statuses = [
  { label: '激活', value: 'active' },
  { label: '未激活', value: 'inactive' },
]

// 根据实际需求添加更多常量
`
}

// ==================== 主函数 ====================

async function main() {
  console.log('🚀 开始生成路由代码...\n')

  let connection
  try {
    // 连接数据库
    console.log('📡 连接数据库...')
    connection = await mysql.createConnection(DB_CONFIG)
    console.log('✅ 数据库连接成功\n')

    // 获取表结构
    console.log(`📊 读取表 ${TABLE_NAME} 的结构...`)
    const columns = await getTableStructure(connection, TABLE_NAME)
    
    if (columns.length === 0) {
      throw new Error(`表 ${TABLE_NAME} 不存在或没有列`)
    }

    console.log(`✅ 找到 ${columns.length} 个字段\n`)
    console.log('字段列表:')
    columns.forEach(col => {
      console.log(`  - ${col.columnName} (${col.columnType})`)
    })
    console.log('')

    // 创建目录结构
    const featurePath = path.join(__dirname, '..', 'src', 'features', FEATURE_NAME)
    const routePath = path.join(__dirname, '..', 'src', 'routes', '_authenticated', FEATURE_NAME)
    
    console.log('📁 创建目录结构...')
    await fs.mkdir(path.join(featurePath, 'data'), { recursive: true })
    await fs.mkdir(path.join(featurePath, 'components'), { recursive: true })
    await fs.mkdir(routePath, { recursive: true })

    // 生成文件
    console.log('📝 生成代码文件...\n')

    const files = [
      {
        path: path.join(featurePath, 'data', 'schema.ts'),
        content: generateSchema(columns, FEATURE_NAME),
        name: 'Schema (Zod 验证)',
      },
      {
        path: path.join(featurePath, 'data', 'data.ts'),
        content: generateDataConstants(FEATURE_NAME),
        name: 'Data Constants',
      },
      {
        path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-columns.tsx`),
        content: generateColumns(columns, FEATURE_NAME),
        name: 'Table Columns',
      },
      {
        path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-table.tsx`),
        content: generateTableComponent(columns, FEATURE_NAME),
        name: 'Table Component',
      },
      {
        path: path.join(featurePath, 'components', 'data-table-row-actions.tsx'),
        content: generateRowActions(FEATURE_NAME),
        name: 'Row Actions',
      },
      {
        path: path.join(featurePath, 'index.tsx'),
        content: generateIndexComponent(FEATURE_NAME),
        name: 'Main Component',
      },
      {
        path: path.join(routePath, 'index.tsx'),
        content: generateRoute(FEATURE_NAME),
        name: 'Route File',
      },
    ]

    for (const file of files) {
      await fs.writeFile(file.path, file.content, 'utf-8')
      console.log(`✅ ${file.name}: ${path.relative(process.cwd(), file.path)}`)
    }

    console.log('\n🎉 代码生成完成！\n')
    console.log('📋 生成的文件:')
    console.log(`   Features: src/features/${FEATURE_NAME}/`)
    console.log(`   Route: src/routes/_authenticated/${FEATURE_NAME}/`)
    console.log('\n💡 后续步骤:')
    console.log('   1. 根据需要调整生成的代码')
    console.log('   2. 添加 API 调用逻辑')
    console.log('   3. 自定义表单和验证规则')
    console.log('   4. 在侧边栏中添加导航链接')
    console.log('')

  } catch (error) {
    console.error('❌ 错误:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('👋 数据库连接已关闭')
    }
  }
}

// 执行主函数
main()

