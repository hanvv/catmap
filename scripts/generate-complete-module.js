/**
 * 完整功能模块生成器 - 从 MySQL 表结构生成完整的 CRUD 模块
 * 包括: Provider, Dialogs, Forms, Table, Bulk Actions 等
 * 
 * 用法: node scripts/generate-complete-module.js
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

const TABLE_NAME = 'products'  // 修改为你的表名
const FEATURE_NAME = TABLE_NAME // 功能模块名称

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
function generateSchema(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const schemaFields = columns.map(col => {
    const fieldName = toCamelCase(col.columnName)
    const zodType = mysqlToZodType(col.columnType, col.isNullable)
    return `  ${fieldName}: ${zodType},`
  }).join('\n')

  return `import { z } from 'zod'

// 基于表 ${TABLE_NAME} 自动生成

const ${toCamelCase(typeName)}Schema = z.object({
${schemaFields}
})

export type ${typeName} = z.infer<typeof ${toCamelCase(typeName)}Schema>

export const ${toCamelCase(typeName)}ListSchema = z.array(${toCamelCase(typeName)}Schema)
`
}

/**
 * 生成 Provider
 */
function generateProvider(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)

  return `import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type ${typeName} } from '../data/schema'

type ${componentName}DialogType = 'add' | 'edit' | 'delete'

type ${componentName}ContextType = {
  open: ${componentName}DialogType | null
  setOpen: (str: ${componentName}DialogType | null) => void
  currentRow: ${typeName} | null
  setCurrentRow: React.Dispatch<React.SetStateAction<${typeName} | null>>
}

const ${componentName}Context = React.createContext<${componentName}ContextType | null>(null)

export function ${componentName}Provider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<${componentName}DialogType>(null)
  const [currentRow, setCurrentRow] = useState<${typeName} | null>(null)

  return (
    <${componentName}Context.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </${componentName}Context.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const use${componentName} = () => {
  const context = React.useContext(${componentName}Context)

  if (!context) {
    throw new Error('use${componentName} has to be used within <${componentName}Context>')
  }

  return context
}
`
}

/**
 * 生成 Primary Buttons
 */
function generatePrimaryButtons(featureName) {
  const componentName = toPascalCase(featureName)
  const entityName = toTitle(featureName.replace(/s$/, ''))

  return `import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { use${componentName} } from './${toKebabCase(featureName)}-provider'

export function ${componentName}PrimaryButtons() {
  const { setOpen } = use${componentName}()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>添加${entityName}</span> <Plus size={18} />
      </Button>
    </div>
  )
}
`
}

/**
 * 生成 Dialogs 集合
 */
function generateDialogs(featureName) {
  const componentName = toPascalCase(featureName)

  return `import { ${componentName}ActionDialog } from './${toKebabCase(featureName)}-action-dialog'
import { ${componentName}DeleteDialog } from './${toKebabCase(featureName)}-delete-dialog'
import { use${componentName} } from './${toKebabCase(featureName)}-provider'

export function ${componentName}Dialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = use${componentName}()
  
  return (
    <>
      <${componentName}ActionDialog
        key='${featureName}-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <${componentName}ActionDialog
            key={\`${featureName}-edit-\${currentRow.id}\`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <${componentName}DeleteDialog
            key={\`${featureName}-delete-\${currentRow.id}\`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
`
}

/**
 * 生成 Action Dialog (添加/编辑表单)
 */
function generateActionDialog(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)
  const entityName = toTitle(featureName.replace(/s$/, ''))

  // 过滤掉自动生成的字段
  const editableFields = columns.filter(col =>
    !['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(col.columnName.toLowerCase())
  ).slice(0, 6) // 限制字段数量

  const formFields = editableFields.map(col => {
    const fieldName = toCamelCase(col.columnName)
    const label = toTitle(col.columnName)
    const isRequired = col.isNullable === 'NO'

    return `              <FormField
                control={form.control}
                name='${fieldName}'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      ${label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='${label}'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />`
  }).join('\n')

  const schemaFields = editableFields.map(col => {
    const fieldName = toCamelCase(col.columnName)
    const isRequired = col.isNullable === 'NO'

    if (col.columnType.toLowerCase().includes('varchar') || col.columnType.toLowerCase().includes('text')) {
      return `    ${fieldName}: z.string()${isRequired ? ".min(1, '" + toTitle(col.columnName) + " is required.')" : '.optional()'},`
    } else if (col.columnType.toLowerCase().includes('int')) {
      return `    ${fieldName}: z.number()${isRequired ? '' : '.optional()'},`
    } else {
      return `    ${fieldName}: z.string()${isRequired ? '' : '.optional()'},`
    }
  }).join('\n')

  const defaultValues = editableFields.map(col => {
    const fieldName = toCamelCase(col.columnName)
    return `          ${fieldName}: '',`
  }).join('\n')

  return `'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type ${typeName} } from '../data/schema'

const formSchema = z.object({
${schemaFields}
})

type ${typeName}Form = z.infer<typeof formSchema>

type ${componentName}ActionDialogProps = {
  currentRow?: ${typeName}
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ${componentName}ActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ${componentName}ActionDialogProps) {
  const isEdit = !!currentRow
  
  const form = useForm<${typeName}Form>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? currentRow
      : {
${defaultValues}
        },
  })

  const onSubmit = (values: ${typeName}Form) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑${entityName}' : '添加${entityName}'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新${entityName}信息' : '创建新${entityName}'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[60vh] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='${featureName}-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
${formFields}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='${featureName}-form'>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
`
}

/**
 * 生成 Delete Dialog
 */
function generateDeleteDialog(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)
  const entityName = toTitle(featureName.replace(/s$/, ''))

  return `'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ${typeName} } from '../data/schema'

type ${componentName}DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ${typeName}
}

export function ${componentName}DeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ${componentName}DeleteDialogProps) {
  const [value, setValue] = useState('')
  const itemName = String(currentRow.id) // 使用 ID 作为确认字段

  const handleDelete = () => {
    if (value.trim() !== itemName) return

    onOpenChange(false)
    showSubmittedData(currentRow, '已删除以下${entityName}:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== itemName}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除${entityName}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定要删除这个${entityName}吗？
            <br />
            此操作无法撤销。
          </p>

          <Label className='my-2'>
            请输入 <span className='font-bold'>{itemName}</span> 确认删除：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='输入 ID 确认删除'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告!</AlertTitle>
            <AlertDescription>
              此操作无法撤销，请谨慎操作。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
`
}

/**
 * 生成 Multi Delete Dialog
 */
function generateMultiDeleteDialog(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)
  const entityName = toTitle(featureName.replace(/s$/, ''))

  return `'use client'

import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ${typeName} } from '../data/schema'

type ${componentName}MultiDeleteDialogProps = {
  table: Table<${typeName}>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ${componentName}MultiDeleteDialog({
  table,
  open,
  onOpenChange,
}: ${componentName}MultiDeleteDialogProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    const items = selectedRows.map((row) => row.original)
    showSubmittedData(items, '已删除以下${entityName}:')
    table.resetRowSelection()
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          批量删除${entityName}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            确定要删除 <span className='font-bold'>{selectedRows.length}</span> 个${entityName}吗？
          </p>

          <Alert variant='destructive'>
            <AlertTitle>警告!</AlertTitle>
            <AlertDescription>
              此操作无法撤销，将永久删除选中的所有${entityName}。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='批量删除'
      destructive
    />
  )
}
`
}

/**
 * 生成 Bulk Actions
 */
function generateBulkActions(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)

  return `import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type ${typeName} } from '../data/schema'
import { ${componentName}MultiDeleteDialog } from './${toKebabCase(featureName)}-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='${featureName.replace(/s$/, '')}'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除选中项'
              title='删除选中项'
            >
              <Trash2 />
              <span className='sr-only'>删除选中项</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除选中项</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <${componentName}MultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
`
}

/**
 * 生成 Row Actions
 */
function generateRowActions(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)

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
import { use${componentName} } from './${toKebabCase(featureName)}-provider'

interface DataTableRowActionsProps {
  row: Row<${typeName}>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = use${componentName}()

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
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('edit')
          }}
        >
          <Pen className='me-2 size-3.5 text-muted-foreground/70' />
          编辑
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
        >
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
 * 生成列定义
 */
function generateColumns(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))

  const displayFields = columns
    .filter(col => !['created_at', 'updated_at'].includes(col.columnName.toLowerCase()))
    .slice(0, 5)

  const columnDefs = displayFields.map(col => {
    const fieldName = toCamelCase(col.columnName)
    const label = toTitle(col.columnName)

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
 * 生成 Table 组件
 */
function generateTable(featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))
  const componentName = toPascalCase(featureName)

  return `'use client'

import { useMemo } from 'react'
import { type NavigateOptions } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { DataTable, useTableUrlState } from '@/components/data-table'
import { ${toCamelCase(featureName)}Columns } from './${toKebabCase(featureName)}-columns'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { type ${typeName} } from '../data/schema'

type ${componentName}TableProps = {
  data: ${typeName}[]
  search: any
  navigate: (options: NavigateOptions) => void
}

export function ${componentName}Table({ data, search, navigate }: ${componentName}TableProps) {
  const { pagination, sorting, onPaginationChange, onSortingChange } =
    useTableUrlState({ search, navigate })

  const table = useReactTable({
    data,
    columns: ${toCamelCase(featureName)}Columns,
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
    manualSorting: false,
  })

  return (
    <div className='space-y-4'>
      <DataTable 
        table={table} 
        bulkActions={<DataTableBulkActions table={table} />}
      />
    </div>
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

  return `import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ${componentName}Dialogs } from './components/${toKebabCase(featureName)}-dialogs'
import { ${componentName}PrimaryButtons } from './components/${toKebabCase(featureName)}-primary-buttons'
import { ${componentName}Provider } from './components/${toKebabCase(featureName)}-provider'
import { ${componentName}Table } from './components/${toKebabCase(featureName)}-table'
import { ${toCamelCase(featureName)} } from './data/${toKebabCase(featureName)}'

const route = getRouteApi('/_authenticated/${featureName}/')

export function ${componentName}() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <${componentName}Provider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>${entityTitle}</h2>
            <p className='text-muted-foreground'>
              管理你的${entityTitle}数据
            </p>
          </div>
          <${componentName}PrimaryButtons />
        </div>
        <${componentName}Table data={${toCamelCase(featureName)}} search={search} navigate={navigate} />
      </Main>

      <${componentName}Dialogs />
    </${componentName}Provider>
  )
}
`
}

/**
 * 生成模拟数据
 */
function generateMockData(columns, featureName) {
  const typeName = toPascalCase(featureName.replace(/s$/, ''))

  const fieldGenerators = columns.map(col => {
    const fieldName = toCamelCase(col.columnName)
    const type = col.columnType.toLowerCase()

    if (fieldName === 'id') {
      return `    id: faker.string.uuid(),`
    } else if (type.includes('varchar') || type.includes('text')) {
      if (fieldName.includes('name')) {
        return `    ${fieldName}: faker.person.fullName(),`
      } else if (fieldName.includes('email')) {
        return `    ${fieldName}: faker.internet.email(),`
      } else if (fieldName.includes('phone')) {
        return `    ${fieldName}: faker.phone.number(),`
      } else {
        return `    ${fieldName}: faker.lorem.word(),`
      }
    } else if (type.includes('int')) {
      return `    ${fieldName}: faker.number.int({ min: 1, max: 1000 }),`
    } else if (type.includes('decimal') || type.includes('float')) {
      return `    ${fieldName}: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),`
    } else if (type.includes('date') || type.includes('timestamp')) {
      if (fieldName.includes('created')) {
        return `    ${fieldName}: faker.date.past(),`
      } else {
        return `    ${fieldName}: faker.date.recent(),`
      }
    } else if (type.includes('boolean')) {
      return `    ${fieldName}: faker.datatype.boolean(),`
    } else if (type.includes('enum')) {
      const enumMatch = col.columnType.match(/enum\((.*)\)/i)
      if (enumMatch) {
        const values = enumMatch[1].split(',').map(v => v.trim().replace(/'/g, ''))
        return `    ${fieldName}: faker.helpers.arrayElement([${values.map(v => `'${v}'`).join(', ')}]),`
      }
    }
    return `    ${fieldName}: faker.lorem.word(),`
  }).join('\n')

  return `import { faker } from '@faker-js/faker'

// 设置固定种子以生成一致的数据
faker.seed(12345)

export const ${toCamelCase(featureName)} = Array.from({ length: 100 }, () => ({
${fieldGenerators}
}))
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

async function main() {
  console.log('🚀 开始生成完整功能模块...\n')

  let connection
  try {
    console.log('📡 连接数据库...')
    connection = await mysql.createConnection(DB_CONFIG)
    console.log('✅ 数据库连接成功\n')

    console.log(`📊 读取表 ${TABLE_NAME} 的结构...`)
    const columns = await getTableStructure(connection, TABLE_NAME)

    if (columns.length === 0) {
      throw new Error(`表 ${TABLE_NAME} 不存在或没有列`)
    }

    console.log(`✅ 找到 ${columns.length} 个字段\n`)

    // 创建目录结构
    const featurePath = path.join(__dirname, '..', 'src', 'features', FEATURE_NAME)
    const routePath = path.join(__dirname, '..', 'src', 'routes', '_authenticated', FEATURE_NAME)

    console.log('📁 创建目录结构...')
    await fs.mkdir(path.join(featurePath, 'data'), { recursive: true })
    await fs.mkdir(path.join(featurePath, 'components'), { recursive: true })
    await fs.mkdir(routePath, { recursive: true })

    // 生成所有文件
    console.log('📝 生成代码文件...\n')

    const files = [
      // Data
      { path: path.join(featurePath, 'data', 'schema.ts'), content: generateSchema(columns, FEATURE_NAME), name: 'Schema' },
      { path: path.join(featurePath, 'data', 'data.ts'), content: generateDataConstants(FEATURE_NAME), name: 'Data Constants' },
      { path: path.join(featurePath, 'data', `${toKebabCase(FEATURE_NAME)}.ts`), content: generateMockData(columns, FEATURE_NAME), name: 'Mock Data' },

      // Components
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-provider.tsx`), content: generateProvider(FEATURE_NAME), name: 'Provider' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-primary-buttons.tsx`), content: generatePrimaryButtons(FEATURE_NAME), name: 'Primary Buttons' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-dialogs.tsx`), content: generateDialogs(FEATURE_NAME), name: 'Dialogs' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-action-dialog.tsx`), content: generateActionDialog(columns, FEATURE_NAME), name: 'Action Dialog' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-delete-dialog.tsx`), content: generateDeleteDialog(FEATURE_NAME), name: 'Delete Dialog' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-multi-delete-dialog.tsx`), content: generateMultiDeleteDialog(FEATURE_NAME), name: 'Multi Delete Dialog' },
      { path: path.join(featurePath, 'components', 'data-table-bulk-actions.tsx'), content: generateBulkActions(FEATURE_NAME), name: 'Bulk Actions' },
      { path: path.join(featurePath, 'components', 'data-table-row-actions.tsx'), content: generateRowActions(FEATURE_NAME), name: 'Row Actions' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-columns.tsx`), content: generateColumns(columns, FEATURE_NAME), name: 'Table Columns' },
      { path: path.join(featurePath, 'components', `${toKebabCase(FEATURE_NAME)}-table.tsx`), content: generateTable(FEATURE_NAME), name: 'Table Component' },

      // Main
      { path: path.join(featurePath, 'index.tsx'), content: generateMainComponent(FEATURE_NAME), name: 'Main Component' },

      // Route
      { path: path.join(routePath, 'index.tsx'), content: generateRoute(FEATURE_NAME), name: 'Route File' },
    ]

    for (const file of files) {
      await fs.writeFile(file.path, file.content, 'utf-8')
      console.log(`  ✅ ${file.name}`)
    }

    console.log('\n🎉 完整功能模块生成完成！\n')
    console.log('📋 生成的文件统计:')
    console.log(`   - Data: 3 个文件`)
    console.log(`   - Components: 11 个文件`)
    console.log(`   - Main: 1 个文件`)
    console.log(`   - Route: 1 个文件`)
    console.log(`   总计: ${files.length} 个文件\n`)

    console.log('💡 后续步骤:')
    console.log('   1. 在侧边栏中添加导航: src/components/layout/data/sidebar-data.ts')
    console.log('   2. 根据需要调整表单字段和验证规则')
    console.log('   3. 替换模拟数据为真实 API 调用')
    console.log('   4. 自定义表格列和样式')
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

