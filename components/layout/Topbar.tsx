'use client'

import { useRouter } from 'next/navigation'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

interface TopbarProps {
  userName: string
  userEmail: string
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <header className="h-14 border-b bg-background flex items-center justify-end gap-2 px-4">
      {isDemo && (
        <span className="mr-auto rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/60">
          Demo Mode — Sharma Classes, Bikaner
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-8 w-8 cursor-pointer"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(userName || userEmail)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
            <User size={14} className="mr-2" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut size={14} className="mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
