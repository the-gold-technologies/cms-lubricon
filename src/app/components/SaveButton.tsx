import React from 'react';
import { Save, Check, Loader2 } from 'lucide-react';

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  saved?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  label = 'Save Changes',
  icon,
  className = '',
  disabled,
  loading = false,
  saved = false,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`bg-[#C86218] cursor-pointer text-white px-8 py-3 rounded-full font-semibold tracking-wide hover:bg-[#0C356A] transition-all duration-300 border border-transparent hover:border-[#C86218] hover:shadow-[0_0_25px_rgba(200,98,24,0.35)] flex items-center justify-center gap-2.5 group ${
        isDisabled ? 'opacity-75 cursor-not-allowed' : ''
      } ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <Check className="w-4 h-4" />
      ) : icon ? (
        icon
      ) : (
        <Save className="w-4 h-4" />
      )}
      <span>{loading ? 'Saving...' : saved ? 'Saved!' : label}</span>
    </button>
  );
};
