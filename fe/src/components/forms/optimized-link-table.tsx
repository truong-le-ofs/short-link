"use client"

import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Copy, 
  ExternalLink, 
  MoreHorizontal, 
  Trash2, 
  Edit,
  Search,
  Shield,
  Calendar,
  Users,
  Link as LinkIcon,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import { type Link } from "@/types"
import { useLinks, useDeleteLink, usePrefetchLink } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedLinkTableProps {
  searchQuery?: string
  onCreateLink?: () => void
  onEditLink?: (link: Link) => void
  pageSize?: number
}

function LinkTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LinkRow({ link, onEdit, onDelete, onPrefetch }: {
  link: Link
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
  onPrefetch: (id: string) => void
}) {
  const { toast } = useToast()
  const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${link.short_code}`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied!", "Short URL copied to clipboard")
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard")
    }
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      onDelete(link.id)
    }
  }

  return (
    <TableRow 
      className="hover:bg-muted/50 cursor-pointer"
      onMouseEnter={() => onPrefetch(link.id)}
    >
      <TableCell>
        <div className="flex items-center space-x-2">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate max-w-[200px]" title={link.title || link.original_url}>
              {link.title || "Untitled"}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={link.original_url}>
              {link.original_url}
            </span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <button 
          onClick={() => copyToClipboard(shortUrl)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-mono text-sm hover:underline"
          title="Click to copy"
        >
          <span className="truncate max-w-[150px]">{shortUrl}</span>
          <Copy className="h-3 w-3 flex-shrink-0" />
        </button>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{link.click_count.toLocaleString()}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(link.created_at), "MMM dd, yyyy")}</span>
          </div>
          {link.expires_at && (
            <div className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3 w-3" />
              <span>Expires {format(new Date(link.expires_at), "MMM dd")}</span>
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-2">
          {link.password && (
            <div title="Password protected">
              <Shield className="h-4 w-4 text-amber-500" />
            </div>
          )}
          {!link.is_active && (
            <div title="Inactive">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          <div 
            className={`w-2 h-2 rounded-full ${link.is_active ? 'bg-green-500' : 'bg-red-500'}`} 
            title={link.is_active ? 'Active' : 'Inactive'} 
          />
        </div>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => copyToClipboard(shortUrl)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => window.open(shortUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(link)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function OptimizedLinkTable({ 
  searchQuery = "", 
  onCreateLink, 
  onEditLink,
  pageSize = 10 
}: OptimizedLinkTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data: links = [], isLoading, error, refetch } = useLinks()
  const deleteLink = useDeleteLink()
  const prefetchLink = usePrefetchLink()
  const { toast } = useToast()

  // Filter and paginate links
  const filteredLinks = useMemo(() => {
    if (!localSearchQuery.trim()) return links
    
    const query = localSearchQuery.toLowerCase()
    return links.filter(link => 
      link.original_url.toLowerCase().includes(query) ||
      link.short_code.toLowerCase().includes(query) ||
      link.title?.toLowerCase().includes(query) ||
      link.description?.toLowerCase().includes(query)
    )
  }, [links, localSearchQuery])

  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredLinks.slice(startIndex, startIndex + pageSize)
  }, [filteredLinks, currentPage, pageSize])

  const totalPages = Math.ceil(filteredLinks.length / pageSize)

  const handleDelete = async (id: string) => {
    try {
      await deleteLink.mutateAsync(id)
      toast.success("Link deleted", "The link has been deleted successfully")
    } catch {
      toast.error("Delete failed", "Could not delete the link")
    }
  }

  if (isLoading) {
    return <LinkTableSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load links</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={localSearchQuery}
            onChange={(e) => {
              setLocalSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        {onCreateLink && (
          <Button onClick={onCreateLink}>
            Create New Link
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
          <CardDescription>
            {filteredLinks.length === 0 
              ? "No links found" 
              : `Showing ${paginatedLinks.length} of ${filteredLinks.length} links`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {localSearchQuery ? "No matching links found" : "No links yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {localSearchQuery 
                  ? "Try adjusting your search terms" 
                  : "Create your first shortened link to get started"
                }
              </p>
              {!localSearchQuery && onCreateLink && (
                <Button onClick={onCreateLink}>
                  Create Your First Link
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLinks.map((link) => (
                    <LinkRow
                      key={link.id}
                      link={link}
                      onEdit={onEditLink || (() => {})}
                      onDelete={handleDelete}
                      onPrefetch={prefetchLink}
                    />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}