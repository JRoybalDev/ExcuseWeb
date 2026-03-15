"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { toast } from "sonner";

export function UserNav() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (isPending) {
    return <div className="h-8 w-8 rounded-full bg-[#e3d5ca] animate-pulse border border-[#c9ada7]" />;
  }

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border-2 border-[#c9ada7] hover:border-[#4a331f] transition-all p-0 overflow-hidden shadow-sm"
        >
          {/* Avatar / Initial */}
          <div className="flex h-full w-full items-center justify-center bg-[#4a331f] text-[#fdfaf7] font-bold">
            {session.user?.name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-[#fdfaf7] border border-[#c9ada7] shadow-2xl rounded-xl p-2 animate-in zoom-in-95 duration-200"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal px-2 py-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#c9ada7]/20 text-[#4a331f]">
                <Shield className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-bold leading-none text-[#4a331f]">
                {session.user?.name || "Player"}
              </p>
            </div>
            <p className="text-xs leading-none text-[#8d7a6d] pl-8">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#c9ada7]/30 my-1" />

        <div className="py-1">
          <DropdownMenuItem className="flex items-center px-3 py-2 text-sm text-[#4a331f] cursor-pointer hover:bg-[#f5ebe0] rounded-lg transition-colors group">
            <User className="mr-3 h-4 w-4 text-[#8d7a6d] group-hover:text-[#4a331f]" />
            <span>Profile Status</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center px-3 py-2 text-sm text-[#4a331f] cursor-pointer hover:bg-[#f5ebe0] rounded-lg transition-colors group">
            <Settings className="mr-3 h-4 w-4 text-[#8d7a6d] group-hover:text-[#4a331f]" />
            <span>Settings</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-[#c9ada7]/30 my-1" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center px-3 py-2 text-sm text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
