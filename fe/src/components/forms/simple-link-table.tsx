"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
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
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { type Link, type ApiResponse } from "@/types"

interface SimpleLinkTableProps {
  searchQuery?: string
  onCreateLink?: () => void
  onEditLink?: (link: Link) => void
}

export function SimpleLinkTable({ searchQuery = "", onCreateLink, onEditLink }: SimpleLinkTableProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const { apiCall } = useAuth()
  const { toast } = useToast()

  // Load links
  const loadLinks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiCall<ApiResponse<Link[]>>("/shortlinks")
      if (response.data) {
        setLinks(response.data)
      } else {
        setLinks([])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load links"
      setError(errorMessage)
      setLinks([]) // Reset links on error
      console.error("Failed to load links:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load links on mount
  useEffect(() => {
    loadLinks()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter links based on search query
  const filteredLinks = links.filter(link => {
    const query = (localSearchQuery || searchQuery).toLowerCase()
    if (!query) return true
    
    return (
      link.title?.toLowerCase().includes(query) ||
      link.description?.toLowerCase().includes(query) ||
      link.default_url.toLowerCase().includes(query) ||
      link.short_code.toLowerCase().includes(query)
    )
  })

  // Copy short URL to clipboard
  const handleCopyShortUrl = async (shortCode: string) => {
    try {
      const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${shortCode}`
      await navigator.clipboard.writeText(shortUrl)
      toast.success("Copied!", "Short URL copied to clipboard")
    } catch {
      toast.error("Failed to copy", "Could not copy URL to clipboard")
    }
  }

  // Delete link
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
      return
    }

    try {
      await apiCall(`/shortlinks/${linkId}`, { method: "DELETE" })
      toast.success("Link deleted", "The link has been permanently deleted")
      await loadLinks() // Reload links
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete link"
      toast.error("Delete failed", errorMessage)
    }
  }

  // Check if link is expired
  const isLinkExpired = (link: Link): boolean => {
    if (!link.expires_at) return false
    return new Date(link.expires_at) < new Date()
  }

  // Check if link reached max clicks
  const isLinkAtMaxClicks = (link: Link): boolean => {
    if (!link.max_clicks) return false
    return link.click_count >= link.max_clicks
  }

  // Get link status
  const getLinkStatus = (link: Link) => {
    if (!link.is_active) return { label: 'Inactive', color: 'text-gray-500' }
    if (isLinkExpired(link)) return { label: 'Expired', color: 'text-red-500' }
    if (isLinkAtMaxClicks(link)) return { label: 'Max Clicks', color: 'text-red-500' }
    return { label: 'Active', color: 'text-green-500' }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Error loading links</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadLinks}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center md:justify-between">
          <div>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>
              Manage and monitor your shortened links
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {onCreateLink && (
              <Button onClick={onCreateLink}>
                Create Link
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {links.length === 0 ? "No links yet" : "No links found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {links.length === 0
                  ? "Create your first shortened link to get started"
                  : "Try adjusting your search criteria"
                }
              </p>
              {links.length === 0 && onCreateLink && (
                <Button onClick={onCreateLink} variant="outline">
                  Create Link
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => {
                  const status = getLinkStatus(link)
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 font-mono text-blue-600 hover:text-blue-800"
                              onClick={() => handleCopyShortUrl(link.short_code)}
                            >
                              /{link.short_code}
                              <Copy className="ml-1 h-3 w-3" />
                            </Button>
                            {link.password && (
                              <Shield className="h-3 w-3 text-yellow-600" />
                            )}
                          </div>
                          {link.title && (
                            <div className="font-medium text-sm">
                              {link.title}
                            </div>
                          )}
                          {link.description && (
                            <div className="text-xs text-muted-foreground">
                              {link.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <a
                            href={link.default_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all inline-flex items-center"
                          >
                            {link.default_url}
                            <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{link.click_count}</span>
                          {link.max_clicks && (
                            <span className="text-xs text-muted-foreground">
                              / {link.max_clicks}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {link.expires_at && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Expires {format(new Date(link.expires_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(link.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(link.created_at), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyShortUrl(link.short_code)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            {onEditLink && (
                              <DropdownMenuItem onClick={() => onEditLink(link)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLink(link.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}