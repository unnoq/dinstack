import { MutationStatusIcon } from '../mutation-status-icon'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/components/ui/alert-dialog'
import { Button } from '@ui/components/ui/button'
import { api } from '@web/lib/api'
import { useRef } from 'react'

type Props = React.ComponentPropsWithoutRef<typeof AlertDialog> & {
  onSuccess?: () => void
}

export function LogoutOtherDevicesAlertDialog({ children, onSuccess, ...props }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const mutation = api.auth.logoutOtherDevices.useMutation({
    onSuccess() {
      cancelRef.current?.click()
      onSuccess?.()
    },
  })

  return (
    <AlertDialog {...props}>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All other devices will be logged out (except this one).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
          <Button
            variant={'destructive'}
            className="gap-2"
            disabled={mutation.isLoading}
            onClick={() => mutation.mutate()}
          >
            Continue <MutationStatusIcon status={mutation.status} />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
