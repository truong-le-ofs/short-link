"use client"

import { useState } from "react"
import { Link } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Copy, Edit, Trash2, ExternalLink, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LinkActionsProps {
  link: Link
  onEdit?: (link: Link) => void
  onDelete?: (linkId: string) => void
  onToggleStatus?: (linkId: string) => void
}

export function LinkActions({ link, onEdit, onDelete, onToggleStatus }: LinkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const handleCopyToClipboard = async () => {
    try {
      const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE || 'http://localhost:3000'}/${link.short_code}`
      await navigator.clipboard.writeText(shortUrl)
      toast.success("Copied to clipboard", "Short URL has been copied to clipboard")
    } catch {
      toast.error("Failed to copy", "Could not copy URL to clipboard")
    }
  }

  const handleViewOriginal = () => {
    window.open(link.default_url, '_blank', 'noopener,noreferrer')
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(link)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(link.id)
      setShowDeleteDialog(false)
      toast.success("Link deleted", "The link has been permanently deleted")
    }
  }

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(link.id)
      toast.success(
        link.is_active ? "Link deactivated" : "Link activated",
        link.is_active ? "Link is now inactive" : "Link is now active"
      )
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy short URL
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewOriginal}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View original
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            <Eye className="mr-2 h-4 w-4" />
            {link.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
              <br />
              <br />
              <span className="font-medium text-foreground">
                {link.title || link.default_url}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}