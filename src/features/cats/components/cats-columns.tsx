import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Cat } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const catsColumns: ColumnDef<Cat>[] = [
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
      <DataTableColumnHeader column={column} title='猫ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='猫名' />
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'avatar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='头像URL' />
    ),
    cell: ({ row }) => <div>{row.getValue('avatar')}</div>,
  },
  {
    accessorKey: 'coverImage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='封面图URL' />
    ),
    cell: ({ row }) => <div>{row.getValue('coverImage')}</div>,
  },
  {
    accessorKey: 'lat',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='纬度' />
    ),
    cell: ({ row }) => <div>{row.getValue('lat')}</div>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
