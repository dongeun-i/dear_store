import { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export default function Input({ label, hint, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-[#594046] uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full bg-[#ece7e9] rounded-lg px-4 py-2.5 text-sm text-[#1d1b1d] placeholder:text-[#594046]/50 border-0 outline-none focus:ring-2 focus:ring-[#00677f] focus:bg-white transition-all duration-200 ${className}`}
        {...props}
      />
      {hint && <p className="text-[11px] text-[#594046]/60">{hint}</p>}
    </div>
  )
}
