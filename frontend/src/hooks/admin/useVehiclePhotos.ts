import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  uploadVehiclePhotos,
  setPrimaryPhoto,
  deleteVehiclePhoto,
} from '@/services/admin/vehiclePhotos'

function useInvalidate(vehicleId: number) {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] })
    qc.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
  }
}

export function useUploadPhotos(vehicleId: number) {
  const invalidate = useInvalidate(vehicleId)
  return useMutation({
    mutationFn: (files: File[]) => uploadVehiclePhotos(vehicleId, files),
    onSuccess: invalidate,
  })
}

export function useSetPrimaryPhoto(vehicleId: number) {
  const invalidate = useInvalidate(vehicleId)
  return useMutation({
    mutationFn: (photoId: number) => setPrimaryPhoto(vehicleId, photoId),
    onSuccess: invalidate,
  })
}

export function useDeletePhoto(vehicleId: number) {
  const invalidate = useInvalidate(vehicleId)
  return useMutation({
    mutationFn: (photoId: number) => deleteVehiclePhoto(vehicleId, photoId),
    onSuccess: invalidate,
  })
}
