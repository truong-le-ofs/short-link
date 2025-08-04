"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LinkForm } from "@/components/forms/link-form"
import { SimpleLinkTable } from "@/components/forms/simple-link-table"
import { Container } from "@/components/ui/container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Link } from "@/types"

export default function LinksPage() {
  const [activeTab, setActiveTab] = useState("manage")
  const [editingLink, setEditingLink] = useState<Link | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLinkSuccess = () => {
    // Switch to manage tab after creating/updating
    setActiveTab("manage")
    setEditingLink(undefined)
    // Force refresh of the table
    setRefreshKey(prev => prev + 1)
  }

  const handleEditLink = (link: Link) => {
    setEditingLink(link)
    setActiveTab("create")
  }

  const handleCreateNewLink = () => {
    setEditingLink(undefined)
    setActiveTab("create")
  }

  return (
    <ProtectedRoute>
      <Container className="py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Link Management</h1>
            <p className="text-muted-foreground">
              Create, manage, and monitor your shortened links
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage Links</TabsTrigger>
              <TabsTrigger value="create">
                {editingLink ? "Edit Link" : "Create Link"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage" className="space-y-6">
              <SimpleLinkTable 
                onCreateLink={handleCreateNewLink}
                onEditLink={handleEditLink}
                key={refreshKey} // Force re-render when refreshKey changes
              />
            </TabsContent>
            
            <TabsContent value="create" className="space-y-6">
              <LinkForm 
                onSuccess={handleLinkSuccess}
                editingLink={editingLink}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </ProtectedRoute>
  )
}