import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type UserBadge } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const userBadgesColumns: ColumnDef<UserBadge>[] = [
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
      <DataTableColumnHeader column={column} title='主键ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('userId')}</div>,
  },
  {
    accessorKey: 'badge',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='徽章名称' />
    ),
    cell: ({ row }) => <div>{row.getValue('badge')}</div>,
  },
  {
    accessorKey: 'createUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建人' />
    ),
    cell: ({ row }) => <div>{row.getValue('createUser')}</div>,
  },
  {
    accessorKey: 'modifyUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='修改人' />
    ),
    cell: ({ row }) => <div>{row.getValue('modifyUser')}</div>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
