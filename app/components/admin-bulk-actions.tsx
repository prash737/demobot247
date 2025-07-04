"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminIcon } from "./admin-icons"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BulkAction {
  id: string
  label: string
  icon: string
  variant?: "default" | "destructive" | "outline"
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

interface AdminBulkActionsProps {
  selectedItems: string[]
  onSelectAll: (selected: boolean) => void
  onSelectItem: (id: string, selected: boolean) => void
  totalItems: number
  actions: BulkAction[]
  onExecuteAction: (actionId: string, selectedIds: string[]) => Promise<void>
  isAllSelected: boolean
  className?: string
}

export function AdminBulkActions({
  selectedItems,
  onSelectAll,
  onSelectItem,
  totalItems,
  actions,
  onExecuteAction,
  isAllSelected,
  className,
}: AdminBulkActionsProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean
    action: BulkAction | null
    message: string
  }>({
    open: false,
    action: null,
    message: "",
  })

  const handleActionClick = (action: BulkAction) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to perform this action.",
        variant: "destructive",
      })
      return
    }

    if (action.requiresConfirmation) {
      setConfirmationDialog({
        open: true,
        action,
        message:
          action.confirmationMessage ||
          `Are you sure you want to ${action.label.toLowerCase()} ${selectedItems.length} item(s)?`,
      })
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: BulkAction) => {
    setIsExecuting(true)
    try {
      await onExecuteAction(action.id, selectedItems)
      toast({
        title: "Action completed",
        description: `Successfully ${action.label.toLowerCase()} ${selectedItems.length} item(s).`,
      })
    } catch (error) {
      console.error("Bulk action error:", error)
      toast({
        title: "Action failed",
        description: `Failed to ${action.label.toLowerCase()} selected items. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
      setConfirmationDialog({ open: false, action: null, message: "" })
    }
  }

  const handleConfirmAction = () => {
    if (confirmationDialog.action) {
      executeAction(confirmationDialog.action)
    }
  }

  return (
    <>
      <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all items"
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <span className="text-sm font-medium">
              {selectedItems.length > 0
                ? `${selectedItems.length} of ${totalItems} selected`
                : `Select all ${totalItems} items`}
            </span>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Bulk Actions:</span>
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  disabled={isExecuting}
                  className="flex items-center space-x-1"
                >
                  <AdminIcon name={action.icon} size="sm" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {selectedItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectAll(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <AdminIcon name="x" size="sm" className="mr-1" />
            Clear Selection
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialog.open}
        onOpenChange={(open) => !open && setConfirmationDialog({ open: false, action: null, message: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <Alert>
            <AdminIcon name="alertTriangle" className="h-4 w-4" />
            <AlertDescription>{confirmationDialog.message}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmationDialog({ open: false, action: null, message: "" })}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button
              variant={confirmationDialog.action?.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirmAction}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <AdminIcon name="loader" className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${confirmationDialog.action?.label}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Checkbox component for table rows
interface BulkSelectCheckboxProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function BulkSelectCheckbox({ id, checked, onCheckedChange }: BulkSelectCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={`Select item ${id}`}
      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      onClick={(e) => e.stopPropagation()}
    />
  )
}
