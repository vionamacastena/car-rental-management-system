import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/services/auth'
import { useAuthStore } from '@/store/auth'

export function useLogout() {
  const navigate = useNavigate()
  const clear = useAuthStore((s) => s.clear)

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clear()
      navigate('/admin/login', { replace: true })
    },
  })
}
