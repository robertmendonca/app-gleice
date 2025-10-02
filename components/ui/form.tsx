'use client';

import { createContext, useContext } from 'react';
import { type UseFormReturn } from 'react-hook-form';

const FormContext = createContext<UseFormReturn | null>(null);

export const FormProvider = ({ children, form }: { children: React.ReactNode; form: UseFormReturn }) => (
  <FormContext.Provider value={form}>{children}</FormContext.Provider>
);

export const useFormContextSafe = <T,>() => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContextSafe deve ser usado dentro de um FormProvider');
  }
  return context as UseFormReturn<T>;
};

export const FormField = <T,>({
  name,
  label,
  children,
  description
}: {
  name: string;
  label: string;
  description?: string;
  children: (props: ReturnType<UseFormReturn<T>['register']> & { error?: string }) => React.ReactNode;
}) => {
  const {
    register,
    formState: { errors }
  } = useFormContextSafe<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">{label}</label>
      {children({ ...register(name as any), error })}
      {description && <p className="text-xs text-foreground/50">{description}</p>}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  );
};

export const FormError = ({ message }: { message?: string }) =>
  message ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p> : null;

export const FormSuccess = ({ message }: { message?: string }) =>
  message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null;

export const FormActions = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-3 pt-4 md:flex-row md:justify-between md:items-center">{children}</div>
);
