"use client"

import { useState, useCallback } from "react"

export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const toggleAll = useCallback((ids: string[]) => {
    if (selectedIds.size === ids.length) {
      deselectAll()
    } else {
      selectAll(ids)
    }
  }, [selectedIds.size, selectAll, deselectAll])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleAll,
    isSelected,
  }
}
