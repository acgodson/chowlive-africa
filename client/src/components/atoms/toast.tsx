import { cn } from '@/util/index';
import * as React from 'react';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, title, description, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg',
          variant === 'destructive' &&
            'border-destructive bg-destructive text-destructive-foreground',
          className
        )}
        {...props}
      >
        {title && <div className='mb-1 font-medium'>{title}</div>}
        {description && <div className='text-sm opacity-90'>{description}</div>}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

interface ToastContextValue {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className='fixed bottom-0 right-0 z-50 m-4 flex flex-col items-end space-y-4'>
        {toasts.map((toastProps, index) => (
          <Toast key={index} {...toastProps} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
