'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useEffect, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  const [internal, setInternal] = useState(value)
  const debounced = useDebounce(internal, 300)

  useEffect(() => { onChange(debounced) }, [debounced, onChange])



  return (
    <div className={`relative ${className ?? ''}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className="pl-8 h-9"
      />
    </div>
  )
}
