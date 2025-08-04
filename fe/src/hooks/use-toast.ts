import { toast } from "sonner"

export const useToast = () => {
  return {
    toast: {
      success: (title: string, description?: string) => {
        toast.success(title, { description })
      },
      error: (title: string, description?: string) => {
        toast.error(title, { description })
      },
      info: (title: string, description?: string) => {
        toast.info(title, { description })
      },
      warning: (title: string, description?: string) => {
        toast.warning(title, { description })
      },
      loading: (title: string, description?: string) => {
        return toast.loading(title, { description })
      },
      promise: <T>(
        promise: Promise<T>,
        msgs: {
          loading: string
          success: string | ((data: T) => string)
          error: string | ((error: unknown) => string)
        }
      ) => {
        return toast.promise(promise, msgs)
      },
      dismiss: (id?: string | number) => {
        toast.dismiss(id)
      }
    }
  }
}