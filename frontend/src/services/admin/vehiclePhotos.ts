import { api } from '@/services/api'
import type { SingleResponse } from '@/types/api'
import type { VehiclePhoto } from '@/types/vehicle'

export async function uploadVehiclePhotos(
  vehicleId: number,
  files: File[],
): Promise<VehiclePhoto[]> {
  const formData = new FormData()
  files.forEach((f) => formData.append('photos[]', f))

  const { data } = await api.post<{ data: VehiclePhoto[] }>(
    `/admin/vehicles/${vehicleId}/photos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

export async function setPrimaryPhoto(vehicleId: number, photoId: number): Promise<VehiclePhoto> {
  const { data } = await api.patch<SingleResponse<VehiclePhoto>>(
    `/admin/vehicles/${vehicleId}/photos/${photoId}/primary`,
  )
  return data.data
}

export async function deleteVehiclePhoto(vehicleId: number, photoId: number): Promise<void> {
  await api.delete(`/admin/vehicles/${vehicleId}/photos/${photoId}`)
}

export async function reorderVehiclePhotos(vehicleId: number, order: number[]): Promise<void> {
  await api.patch(`/admin/vehicles/${vehicleId}/photos/reorder`, { order })
}
