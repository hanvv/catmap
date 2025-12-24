import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Discoverie } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const discoveriesColumns: ColumnDef<Discoverie>[] = [
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
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发现ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='提交用户ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('userId')}</div>,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类型:新猫/状态更新' />
    ),
    cell: ({ row }) => <div>{row.getValue('type')}</div>,
  },
  {
    accessorKey: 'lat',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='纬度' />
    ),
    cell: ({ row }) => <div>{row.getValue('lat')}</div>,
  },
  {
    accessorKey: 'lng',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='经度' />
    ),
    cell: ({ row }) => <div>{row.getValue('lng')}</div>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
