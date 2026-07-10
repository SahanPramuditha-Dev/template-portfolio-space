import re
import os

filepath = r"c:\D\Projects\Websites\Portfolios\Templates\template-portfolio-space\src\pages\admin\components\CollectionEditor.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { CMS_DOCS, useCmsDoc, saveCmsDoc, uploadCmsAsset } from '../../../lib/cms';",
    "import { CMS_DOCS, useCmsDoc, useCmsCollection, saveCmsDoc, saveCmsItem, softRemoveCmsItem, softRemoveMultipleCmsItems, reorderCmsCollection, uploadCmsAsset } from '../../../lib/cms';"
)

# 2. Hook and States
content = content.replace(
    "  const { data, loading } = useCmsDoc(docId, { [collectionKey]: [] });",
    "  const { data, loading } = useCmsCollection(docId, []);"
)

content = content.replace(
    "const nextItems = Array.isArray(data?.[collectionKey]) ? data[collectionKey] : [];",
    "const nextItems = Array.isArray(data) ? data : [];"
)

# 3. removeItem
old_remove = """  const removeItem = async (index) => {
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    setSelectedIndex(nextItems.length === 0 ? -1 : Math.min(index, nextItems.length - 1));
    setDraft(
      nextItems.length === 0
        ? formFromItem(section.initialItem, fields, section.initialItem)
        : formFromItem(nextItems[Math.min(index, nextItems.length - 1)], fields, section.initialItem)
    );
    await saveCmsDoc(docId, { [collectionKey]: nextItems });
    setStatus('Item deleted.');
  };"""

new_remove = """  const removeItem = async (index) => {
    const itemToRemove = items[index];
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    setSelectedIndex(nextItems.length === 0 ? -1 : Math.min(index, nextItems.length - 1));
    setDraft(
      nextItems.length === 0
        ? formFromItem(section.initialItem, fields, section.initialItem)
        : formFromItem(nextItems[Math.min(index, nextItems.length - 1)], fields, section.initialItem)
    );
    if (itemToRemove && itemToRemove.id) {
        await softRemoveCmsItem(docId, itemToRemove.id);
    }
    setStatus('Item deleted.');
  };"""

content = content.replace(old_remove, new_remove)

# 4. saveItem
old_save = """  const saveItem = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const normalized = itemFromForm(draft, fields);
      const validationErrors = collectMediaValidationErrors(normalized, fields);
      if (validationErrors.length > 0) {
        setStatus(`Please fix media before publishing: ${validationErrors.slice(0, 3).join(' ')}`);
        return;
      }
      const nextItems =
        selectedIndex === -1
          ? [normalized, ...items]
          : items.map((item, index) => (index === selectedIndex ? normalized : item));
      setItems(nextItems);
      await saveCmsDoc(docId, { [collectionKey]: nextItems });
      setSelectedIndex(selectedIndex === -1 ? 0 : selectedIndex);
      setStatus('Changes saved.');
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };"""

new_save = """  const saveItem = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const normalized = itemFromForm(draft, fields);
      const validationErrors = collectMediaValidationErrors(normalized, fields);
      if (validationErrors.length > 0) {
        setStatus(`Please fix media before publishing: ${validationErrors.slice(0, 3).join(' ')}`);
        return;
      }
      
      const itemId = (selectedIndex === -1 || !items[selectedIndex]?.id) 
        ? `${docId}-${Date.now()}` 
        : items[selectedIndex].id;
      
      const itemToSave = { ...normalized, id: itemId };
      itemToSave.order = selectedIndex === -1 ? 0 : (items[selectedIndex]?.order ?? 0);
      
      const nextItems =
        selectedIndex === -1
          ? [itemToSave, ...items]
          : items.map((item, index) => (index === selectedIndex ? itemToSave : item));
      
      setItems(nextItems);
      await saveCmsItem(docId, itemId, itemToSave);
      setSelectedIndex(selectedIndex === -1 ? 0 : selectedIndex);
      setStatus('Changes saved.');
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };"""

content = content.replace(old_save, new_save)

# 5. removeMultipleItems
old_remove_multiple = """  const removeMultipleItems = async () => {
    if (selectedIndices.size === 0) return;
    if (!window.confirm(`Delete ${selectedIndices.size} selected items?`)) return;
    setBusy(true);
    try {
      const indicesToRemove = Array.from(selectedIndices);
      const nextItems = items.filter((_, i) => !indicesToRemove.includes(i));
      setItems(nextItems);
      setSelectedIndices(new Set());
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
      await saveCmsDoc(docId, { [collectionKey]: nextItems });
      setStatus(`${indicesToRemove.length} items deleted.`);
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };"""

new_remove_multiple = """  const removeMultipleItems = async () => {
    if (selectedIndices.size === 0) return;
    if (!window.confirm(`Delete ${selectedIndices.size} selected items?`)) return;
    setBusy(true);
    try {
      const indicesToRemove = Array.from(selectedIndices);
      const idsToRemove = indicesToRemove.map(i => items[i].id).filter(id => id);
      const nextItems = items.filter((_, i) => !indicesToRemove.includes(i));
      setItems(nextItems);
      setSelectedIndices(new Set());
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
      if (idsToRemove.length > 0) {
        await softRemoveMultipleCmsItems(docId, idsToRemove);
      }
      setStatus(`${indicesToRemove.length} items deleted.`);
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };"""

content = content.replace(old_remove_multiple, new_remove_multiple)

# 6. handleDragEnd
old_drag = """  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id, 10);
      const newIndex = parseInt(over.id, 10);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      // Keep selection logically attached to the same item if possible
      if (selectedIndex === oldIndex) {
        setSelectedIndex(newIndex);
      } else if (selectedIndex === newIndex) {
        setSelectedIndex(oldIndex);
      }
      
      setBusy(true);
      try {
        await saveCmsDoc(docId, { [collectionKey]: newItems });
        setStatus('Order saved.');
      } catch {
        setStatus('Failed to save order.');
      } finally {
        setBusy(false);
      }
    }
  };"""

new_drag = """  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id, 10);
      const newIndex = parseInt(over.id, 10);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      // Keep selection logically attached to the same item if possible
      if (selectedIndex === oldIndex) {
        setSelectedIndex(newIndex);
      } else if (selectedIndex === newIndex) {
        setSelectedIndex(oldIndex);
      }
      
      setBusy(true);
      try {
        await reorderCmsCollection(docId, newItems);
        setStatus('Order saved.');
      } catch {
        setStatus('Failed to save order.');
      } finally {
        setBusy(false);
      }
    }
  };"""

content = content.replace(old_drag, new_drag)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CollectionEditor.jsx")
