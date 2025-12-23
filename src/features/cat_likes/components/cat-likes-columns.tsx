import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type CatLike } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const catLikesColumns: ColumnDef<CatLike>[] = [
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
    accessorKey: 'catId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='猫ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('catId')}</div>,
  },
  {
    accessorKey: 'liked',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='是否点赞(1是0否)' />
    ),
    cell: ({ row }) => <div>{row.getValue('liked')}</div>,
  },
  {
    accessorKey: 'createUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建人' />
    ),
    cell: ({ row }) => <div>{row.getValue('createUser')}</div>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
