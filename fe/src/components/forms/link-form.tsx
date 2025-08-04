"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { linkFormSchema, type LinkFormInput } from "@/lib/validations"
import { Copy, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Link, type ApiResponse } from "@/types"

interface LinkFormProps {
  onSuccess?: (link: Link) => void
  editingLink?: Link
  className?: string
}

export function LinkForm({ onSuccess, editingLink, className }: LinkFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [codeAvailability, setCodeAvailability] = useState<{ available: boolean } | null>(null)
  
  const { toast } = useToast()
  const { apiCall } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LinkFormInput>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      original_url: editingLink?.original_url || "",
      short_code: editingLink?.short_code || "",
      title: editingLink?.title || "",
      description: editingLink?.description || "",
      password: "",
      confirmPassword: "",
      expires_at: editingLink?.expires_at || "",
      max_clicks: editingLink?.max_clicks || undefined,
    },
  })

  const shortCode = watch("short_code")
  const password = watch("password")

  // Check if custom code is available
  const checkCodeAvailability = async (code: string) => {
    if (!code || code.length < 3) {
      setCodeAvailability(null)
      return
    }

    // Skip checking if editing the same link's code
    if (editingLink && editingLink.short_code === code) {
      setCodeAvailability({ available: true })
      clearErrors("short_code")
      return
    }

    setIsCheckingCode(true)
    try {
      const response = await apiCall<ApiResponse<{ available: boolean }>>(`/api/links/check/${encodeURIComponent(code)}`)
      
      setCodeAvailability(response.data || null)
      if (!response.data?.available) {
        setError("short_code", {
          type: "manual",
          message: "This custom code is already taken"
        })
      } else {
        clearErrors("short_code")
      }
    } catch (error) {
      console.error("Failed to check code availability:", error)
      setCodeAvailability(null)
      // Don't show error to user for API failures, just remove validation
      clearErrors("short_code")
    } finally {
      setIsCheckingCode(false)
    }
  }

  const onSubmit = async (data: LinkFormInput) => {
    setIsSubmitting(true)
    try {
      // Remove confirmPassword from the data sent to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...linkData } = data
      
      // Convert empty strings to undefined
      const processedData = Object.fromEntries(
        Object.entries(linkData).map(([key, value]) => [
          key,
          value === "" ? undefined : value
        ])
      ) as typeof linkData

      const endpoint = editingLink ? `/api/links/${editingLink.id}` : "/api/links"
      const method = editingLink ? "PUT" : "POST"

      const response = await apiCall<ApiResponse<Link>>(endpoint, {
        method,
        body: JSON.stringify(processedData),
      })

      if (response.data) {
        const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${response.data.short_code}`
        setGeneratedLink(shortUrl)
        
        toast.success(
          editingLink ? "Link updated!" : "Link created successfully!",  
          editingLink ? "Your link has been updated." : "Your shortened link is ready."
        )
        
        // Reset form for next use (only for new links)
        if (!editingLink) {
          reset()
          setGeneratedLink(null)
          setCodeAvailability(null)
        }
        
        onSuccess?.(response.data)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create link"
      toast.error("Error", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  const isShortCodeAvailable = codeAvailability?.available

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{editingLink ? "Edit Link" : "Create Short Link"}</CardTitle>
        <CardDescription>
          {editingLink ? "Update your link settings" : "Enter a long URL to create a shortened version"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="original_url" className="text-sm font-medium">
            Original URL *
          </Label>
          <Input
            id="original_url"
            type="url"
            placeholder="https://example.com/very-long-url"
            {...register("original_url")}
            disabled={isSubmitting}
            aria-invalid={errors.original_url ? "true" : "false"}
          />
          {errors.original_url && (
            <p className="text-sm text-red-500" role="alert">
              {errors.original_url.message}
            </p>
          )}
        </div>

        {/* Custom Short Code */}
        <div className="space-y-2">
          <Label htmlFor="short_code" className="text-sm font-medium">
            Custom Short Code (Optional)
          </Label>
          <div className="relative">
            <Input
              id="short_code"
              placeholder="my-custom-code"
              {...register("short_code")}
              disabled={isSubmitting}
              onBlur={(e) => {
                if (e.target.value && e.target.value.length >= 3) {
                  checkCodeAvailability(e.target.value)
                }
              }}
              className={cn(
                shortCode && shortCode.length >= 3 && (
                  isShortCodeAvailable === false ? "border-red-500 focus-visible:ring-red-500" :
                  isShortCodeAvailable === true ? "border-green-500 focus-visible:ring-green-500" : ""
                )
              )}
            />
            {shortCode && shortCode.length >= 3 && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isCheckingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isShortCodeAvailable === true ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : isShortCodeAvailable === false ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
          {errors.short_code && (
            <p className="text-sm text-red-500" role="alert">
              {errors.short_code.message}
            </p>
          )}
          {shortCode && shortCode.length >= 3 && isShortCodeAvailable === false && (
            <p className="text-sm text-red-500">
              This short code is already taken. Please choose another one.
            </p>
          )}
          {shortCode && shortCode.length >= 3 && isShortCodeAvailable === true && (
            <p className="text-sm text-green-600">
              This short code is available!
            </p>
          )}
        </div>

        <Separator />

        {/* Advanced Options Toggle */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" type="button" className="w-full justify-between p-0">
              <span className="text-sm font-medium">Advanced Options</span>
              <span className="text-xs text-muted-foreground">
                {showAdvanced ? "Hide" : "Show"}
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6 pt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title (Optional)
              </Label>
              <Input
                id="title"
                placeholder="My Important Link"
                {...register("title")}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="A brief description of this link"
                rows={3}
                {...register("description")}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Password Protection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="password-protection"
                  checked={!!password}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      // Clear password fields when toggling off using react-hook-form
                      reset({
                        ...watch(),
                        password: "",
                        confirmPassword: "",
                      })
                    }
                  }}
                />
                <Label htmlFor="password-protection">Password Protection</Label>
              </div>

              {password && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...register("password")}
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        {...register("confirmPassword")}
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500" role="alert">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expires_at" className="text-sm font-medium">
                Expiration Date (Optional)
              </Label>
              <Input
                id="expires_at"
                type="datetime-local"
                {...register("expires_at")}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Link will automatically become inactive after this date
              </p>
              {errors.expires_at && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.expires_at.message}
                </p>
              )}
            </div>

            {/* Max Clicks */}
            <div className="space-y-2">
              <Label htmlFor="max_clicks" className="text-sm font-medium">
                Maximum Clicks (Optional)
              </Label>
              <Input
                id="max_clicks"
                type="number"
                min="1"
                max="1000000"
                placeholder="e.g., 100"
                {...register("max_clicks", { 
                  setValueAs: (value) => value === "" ? undefined : parseInt(value) 
                })}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Link will become inactive after this many clicks
              </p>
              {errors.max_clicks && (
                <p className="text-sm text-red-500" role="alert">
                  {errors.max_clicks.message}
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={
            isSubmitting || 
            (!!shortCode && shortCode.length >= 3 && isShortCodeAvailable === false)
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editingLink ? "Updating..." : "Creating Link..."}
            </>
          ) : (
            editingLink ? "Update Link" : "Create Shortened Link"
          )}
        </Button>
      </form>

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="mt-6">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {editingLink ? "Link Updated!" : "Link Created Successfully!"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your shortened link is ready to use. You can copy it to share with others.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </CardContent>
    </Card>
  )
}