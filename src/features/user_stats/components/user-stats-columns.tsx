import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type UserStat } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const userStatsColumns: ColumnDef<UserStat>[] = [
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
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('userId')}</div>,
  },
  {
    accessorKey: 'stamps',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='盖章数' />
    ),
    cell: ({ row }) => <div>{row.getValue('stamps')}</div>,
  },
  {
    accessorKey: 'photos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='照片数' />
    ),
    cell: ({ row }) => <div>{row.getValue('photos')}</div>,
  },
  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='等级称号' />
    ),
    cell: ({ row }) => <div>{row.getValue('level')}</div>,
  },
  {
    accessorKey: 'streakDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='连续天数' />
    ),
    cell: ({ row }) => <div>{row.getValue('streakDays')}</div>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
