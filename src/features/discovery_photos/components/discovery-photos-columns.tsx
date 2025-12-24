import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type DiscoveryPhoto } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const discoveryPhotosColumns: ColumnDef<DiscoveryPhoto>[] = [
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
    accessorKey: 'discoveryId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='探索ID' />
    ),
    cell: ({ row }) => <div>{row.getValue('discoveryId')}</div>,
  },
  {
    accessorKey: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='照片URL' />
    ),
    cell: ({ row }) => <div>{row.getValue('url')}</div>,
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
