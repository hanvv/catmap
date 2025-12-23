import { CatBadgesTable } from './components/cat-badges-table'

export function CatBadges() {
  return (
    <div className='flex h-full flex-1 flex-col space-y-2 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Cat Badges</h2>
          <p className='text-muted-foreground'>
            管理你的cat_badges数据
          </p>
        </div>
      </div>
      <CatBadgesTable />
    </div>
  )
}
