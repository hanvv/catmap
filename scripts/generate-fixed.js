/**
 * 修复和增强版代码生成器
 * 
 * 新特性：
 * 1. ✅ 修复了 DataTable 导入错误
 * 2. ✅ 支持批量生成多表
 * 3. ✅ 使用数据库字段注释作为表单标签
 * 4. ✅ 生成正确的 Table 组件实现
 * 
 * 用法: node scripts/generate-fixed.js
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

// 要生成代码的表名列表（支持多表）
// ⚠️ 注意：表名必须是字符串数组，每个表名单独一个字符串
// ✅ 正确：['products', 'categories', 'orders']
// ❌ 错误：['products, categories, orders']
const TABLE_NAMES = ['cats', 'cat_badges', 'cat_likes', 'discoveries', 'discovery_photos', 'user_badges', 'user_stats', 'user'] // 改为你的表名

// ==================== 工具函数 ====================

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
    const enumMatch = columnType.match(/enum\((.*)\)/i)
    if (enumMatch) {
      const values = enumMatch[1].split(',').map(v => v.trim().replace(/'/g, ''))
      zodType = `z.enum([${values.map(v => `'${v}'`).join(', ')}])`
    }
  }

  if (isNullable === 'YES') {
    zodType += '.nullable().optional()'
  }

  return zodType
}

function toPascalCase(str) {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function toKebabCase(str) {
  return str.replace(/_/g, '-').toLowerCase()
}

function toTitle(str) {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

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

// ==================== 代码生成函数 ====================

/**
 * 生成 Schema 文件
 */
function generateSchema(columns, featureName, tableName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const schemaFields = columns.map(col => {
    const fieldName = toCamelCase(col.columnName)
    const zodType = mysqlToZodType(col.columnType, col.isNullable)
    const comment = col.columnComment ? ` // ${col.columnComment}` : ''
    return `  ${fieldName}: ${zodType},${comment}`
  }).join('\n')

  return `import { z } from 'zod'

// 基于数据库表 ${tableName} 自动生成

const ${toCamelCase(typeName)}Schema = z.object({
${schemaFields}
})

export type ${typeName} = z.infer<typeof ${toCamelCase(typeName)}Schema>

export const ${toCamelCase(typeName)}ListSchema = z.array(${toCamelCase(typeName)}Schema)
`
}

/**
 * 生成列定义文件（使用字段注释）
 */
function generateColumns(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))

  const displayFields = columns
    .filter(col => !['created_at', 'updated_at', 'deleted'].includes(col.columnName.toLowerCase()))
    .slice(0, 5)

  const columnDefs = displayFields.map(col => {
    const fieldName = toCamelCase(col.columnName)
    // 优先使用字段注释，否则使用格式化的字段名
    const label = col.columnComment || toTitle(col.columnName)

    return `  {
    accessorKey: '${fieldName}',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='${label}' />
    ),
    cell: ({ row }) => <div>{row.getValue('${fieldName}')}</div>,
  },`
  }).join('\n')

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
        aria-label='全选'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
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
 * 生成正确的 Table 组件（修复 DataTable 错误）
 */
function generateTable(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)

  return `'use client'

import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { ${toCamelCase(featureName)}Columns } from './${toKebabCase(featureName)}-columns'
import { type ${typeName} } from '../data/schema'

// 模拟数据 - 替换为真实的 API 调用
const mockData: ${typeName}[] = []

export function ${componentName}Table() {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data: mockData,
    columns: ${toCamelCase(featureName)}Columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='搜索${featureName}...'
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={${toCamelCase(featureName)}Columns.length}
                  className='h-24 text-center'
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
`
}

/**
 * 生成 Row Actions
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
 * 生成主组件
 */
function generateMainComponent(featureName) {
  const componentName = toPascalCase(featureName)
  const entityTitle = toTitle(featureName)

  return `import { ${componentName}Table } from './components/${toKebabCase(featureName)}-table'

export function ${componentName}() {
  return (
    <div className='flex h-full flex-1 flex-col space-y-2 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>${entityTitle}</h2>
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
 * 生成数据常量
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

/**
 * 生成路由文件
 */
function generateRoute(featureName) {
  const componentName = toPascalCase(featureName)

  return `import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ${componentName} } from '@/features/${featureName}'

const ${toCamelCase(featureName)}SearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/${featureName}/')({
  validateSearch: ${toCamelCase(featureName)}SearchSchema,
  component: ${componentName},
})
`
}

// ==================== 主函数 ====================

async function generateForTable(connection, tableName) {
  const featureName = tableName

  console.log(`\n📊 处理表: ${tableName}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const columns = await getTableStructure(connection, tableName)

    if (columns.length === 0) {
      console.log(`⚠️  表 ${tableName} 不存在或没有列，跳过`)
      console.log(`   提示: 检查表名拼写是否正确`)
      return { success: false, tableName, error: '表不存在或无列' }
    }

    console.log(`✅ 找到 ${columns.length} 个字段`)

    // 显示字段注释
    const fieldsWithComments = columns.filter(col => col.columnComment)
    if (fieldsWithComments.length > 0) {
      console.log(`📝 发现 ${fieldsWithComments.length} 个字段有注释，将用作表单标签`)
    }

    // 创建目录结构
    const featurePath = path.join(__dirname, '..', 'src', 'features', featureName)
    const routePath = path.join(__dirname, '..', 'src', 'routes', '_authenticated', featureName)

    await fs.mkdir(path.join(featurePath, 'data'), { recursive: true })
    await fs.mkdir(path.join(featurePath, 'components'), { recursive: true })
    await fs.mkdir(routePath, { recursive: true })

    // 生成文件
    const files = [
      { path: path.join(featurePath, 'data', 'schema.ts'), content: generateSchema(columns, featureName, tableName), name: 'Schema' },
      { path: path.join(featurePath, 'data', 'data.ts'), content: generateDataConstants(featureName), name: 'Constants' },
      { path: path.join(featurePath, 'components', `${toKebabCase(featureName)}-columns.tsx`), content: generateColumns(columns, featureName), name: 'Columns' },
      { path: path.join(featurePath, 'components', `${toKebabCase(featureName)}-table.tsx`), content: generateTable(featureName), name: 'Table' },
      { path: path.join(featurePath, 'components', 'data-table-row-actions.tsx'), content: generateRowActions(featureName), name: 'Row Actions' },
      { path: path.join(featurePath, 'index.tsx'), content: generateMainComponent(featureName), name: 'Main' },
      { path: path.join(routePath, 'index.tsx'), content: generateRoute(featureName), name: 'Route' },
    ]

    for (const file of files) {
      await fs.writeFile(file.path, file.content, 'utf-8')
      console.log(`  ✅ ${file.name}`)
    }

    return { success: true, tableName, filesGenerated: files.length }
  } catch (error) {
    console.error(`❌ 处理表 ${tableName} 时出错:`)
    console.error(`   ${error.message}`)
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   提示: 数据库 '${DB_CONFIG.database}' 不存在`)
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`   提示: 数据库访问被拒绝，检查用户名和密码`)
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`   提示: 无法连接到数据库服务器，检查地址和端口`)
    }
    return { success: false, tableName, error: error.message }
  }
}

async function main() {
  console.log('🚀 修复和增强版代码生成器启动\n')
  console.log('✨ 新特性:')
  console.log('  - ✅ 修复 DataTable 导入错误')
  console.log('  - ✅ 支持批量生成多表')
  console.log('  - ✅ 使用字段注释作为标签')
  console.log('  - ✅ 生成正确的 Table 实现\n')

  // 验证表名配置
  if (!Array.isArray(TABLE_NAMES)) {
    console.error('❌ 错误: TABLE_NAMES 必须是数组')
    console.error('   正确格式: const TABLE_NAMES = [\'products\', \'categories\']')
    process.exit(1)
  }

  if (TABLE_NAMES.length === 0) {
    console.error('❌ 错误: TABLE_NAMES 数组为空，请添加要生成的表名')
    process.exit(1)
  }

  // 检查表名是否包含逗号（常见错误）
  const invalidTables = TABLE_NAMES.filter(name => typeof name !== 'string' || name.includes(','))
  if (invalidTables.length > 0) {
    console.error('❌ 错误: 表名格式不正确')
    console.error('   错误的表名:', invalidTables)
    console.error('\n   正确格式:')
    console.error('   const TABLE_NAMES = [')
    console.error('     \'products\',    // ✅ 每个表名单独一个字符串')
    console.error('     \'categories\',  // ✅ 用逗号分隔')
    console.error('   ]')
    console.error('\n   错误格式:')
    console.error('   const TABLE_NAMES = [\'products, categories\']  // ❌ 不要把多个表名放在一个字符串中')
    process.exit(1)
  }

  console.log('📋 准备生成以下表的代码:')
  TABLE_NAMES.forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}`)
  })
  console.log('')

  let connection
  try {
    console.log('📡 连接数据库...')
    connection = await mysql.createConnection(DB_CONFIG)
    console.log('✅ 数据库连接成功\n')

    const results = []

    for (const tableName of TABLE_NAMES) {
      const result = await generateForTable(connection, tableName)
      results.push(result)
    }

    // 统计
    console.log('\n' + '='.repeat(60))
    console.log('📊 生成统计')
    console.log('='.repeat(60))

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`\n✅ 成功: ${successful.length} 个表`)
    successful.forEach(r => {
      console.log(`   - ${r.tableName} (${r.filesGenerated} 个文件)`)
    })

    if (failed.length > 0) {
      console.log(`\n❌ 失败: ${failed.length} 个表`)
      failed.forEach(r => {
        console.log(`   - ${r.tableName}`)
      })
    }

    console.log('\n💡 后续步骤:')
    console.log('   1. 在 src/components/layout/data/sidebar-data.ts 中添加菜单项')
    console.log('   2. 根据需要调整生成的代码')
    console.log('   3. 替换模拟数据为真实 API 调用')
    console.log('')

  } catch (error) {
    console.error('❌ 错误:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

main()

