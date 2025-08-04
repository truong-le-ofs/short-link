"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, ExternalLink, Shield, Clock, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type Link } from "@/types"

// Use the frontend API proxy instead of calling backend directly

export default function LinkResolutionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [link, setLink] = useState<Link | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const shortCode = params.code as string

  // Load link information
  const loadLink = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/links/resolve/${encodeURIComponent(shortCode)}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError("Link not found or has expired")
        } else if (response.status === 403) {
          setNeedsPassword(true)
          setLink(data.data || null) // Link info might still be provided for display
        } else {
          setError(data.error || "Failed to load link")
        }
        return
      }

      if (data.data) {
        setLink(data.data)
        
        // Check if link is expired or reached max clicks
        const linkData = data.data as Link
        if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
          setError("This link has expired")
          return
        }
        
        if (linkData.max_clicks && linkData.click_count >= linkData.max_clicks) {
          setError("This link has reached its maximum number of clicks")
          return
        }

        // If no password needed, redirect immediately
        if (!linkData.password) {
          handleRedirect(linkData.original_url)
        } else {
          setNeedsPassword(true)
        }
      }
    } catch (error) {
      console.error("Failed to load link:", error)
      setError("Failed to load link")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      toast.error("Password required", "Please enter the password for this link")
      return
    }

    setIsSubmittingPassword(true)
    try {
      const response = await fetch(`/api/links/resolve/${encodeURIComponent(shortCode)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Incorrect password", "The password you entered is incorrect")
        } else {
          toast.error("Error", data.error || "Failed to verify password")
        }
        return
      }

      if (data.data?.original_url) {
        handleRedirect(data.data.original_url)
      }
    } catch (error) {
      console.error("Failed to submit password:", error)
      toast.error("Error", "Failed to verify password")
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  // Handle redirect to original URL
  const handleRedirect = (originalUrl: string) => {
    setIsRedirecting(true)
    
    // Show redirect message
    toast.success("Redirecting...", "Taking you to the destination")
    
    // Add https:// if no protocol is specified
    let redirectUrl = originalUrl
    if (!redirectUrl.match(/^https?:\/\//)) {
      redirectUrl = `https://${redirectUrl}`
    }

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = redirectUrl
    }, 1500)
  }

  // Load link on mount
  useEffect(() => {
    if (shortCode) {
      loadLink()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortCode])

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-16">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div>
            <h2 className="text-xl font-semibold">Loading link...</h2>
            <p className="text-muted-foreground">Please wait while we retrieve the link information</p>
          </div>
        </div>
      </Container>
    )
  }

  // Error state
  if (error) {
    return (
      <Container className="py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Link Not Available</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push("/")} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Redirecting state
  if (isRedirecting) {
    return (
      <Container className="py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12 space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Redirecting...</h3>
              <p className="text-muted-foreground">Taking you to your destination</p>
              {link && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm break-all">{link.original_url}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Password required state
  if (needsPassword) {
    return (
      <Container className="py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Password Protected Link</CardTitle>
            <CardDescription>
              This link is password protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {link && (
              <div className="space-y-4 mb-6">
                {link.title && (
                  <div>
                    <h3 className="font-medium">{link.title}</h3>
                  </div>
                )}
                {link.description && (
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{link.click_count} clicks</span>
                  </div>
                  {link.expires_at && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Expires {new Date(link.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isSubmittingPassword}
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmittingPassword || !password.trim()}
              >
                {isSubmittingPassword ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continue to Link
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return null
}