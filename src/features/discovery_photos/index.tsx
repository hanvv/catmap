import { DiscoveryPhotosTable } from './components/discovery-photos-table'

export function DiscoveryPhotos() {
  return (
    <div className='flex h-full flex-1 flex-col space-y-2 p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Discovery Photos</h2>
          <p className='text-muted-foreground'>
            管理你的discovery_photos数据
          </p>
        </div>
      </div>
      <DiscoveryPhotosTable />
    </div>
  )
}
