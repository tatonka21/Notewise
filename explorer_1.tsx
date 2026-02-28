        <IconSymbol name={getIcon()} size={16} color={getIconColor()} />
        <Text style={[styles.treeItemText, { color: colors.foreground }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.pinned && (
          <IconSymbol name="pin.fill" size={10} color={(colors as Record<string, string>).accent ?? colors.primary} />
        )}
        {item.type === "folder" && children.length > 0 && (
          <Text style={[styles.childCount, { color: colors.muted }]}>{children.length}</Text>
        )}
      </Pressable>
      {item.type === "folder" && isExpanded && children.map((child) => (
        <FileTreeItem
          key={child.id}
          item={child}
          depth={depth + 1}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          onLongPress={onLongPress}
        />
      ))}
    </>
  );
}

export default function ExplorerScreen() {
  const colors = useColors();
  const { items, createItem, deleteItem, updateItem, getChildren } = useNotesStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextItem, setContextItem] = useState<NoteItem | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [newItemParent, setNewItemParent] = useState<string | null>(null);

  const rootItems = getChildren(null).sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.title.localeCompare(b.title);
  });

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLongPress = (item: NoteItem) => {
    setContextItem(item);
  };

  const handleRename = () => {
    if (!contextItem) return;
    setRenaming(contextItem.id);
    setRenameText(contextItem.title);
    setContextItem(null);
  };

  const handleDelete = () => {
    if (!contextItem) return;
    Alert.alert(
      "Delete",
      `Delete "${contextItem.title}"${contextItem.type === "folder" ? " and all its contents" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItem(contextItem.id);
            setContextItem(null);
          },
        },
      ]
    );
  };

  const handleNewChild = (type: "note" | "code" | "folder") => {
    const parentId = contextItem?.type === "folder" ? contextItem.id : (contextItem?.parentId ?? null);
    createItem({ title: type === "folder" ? "New Folder" : type === "code" ? "Untitled Code" : "Untitled Note", type, parentId });
    if (parentId) {
      setExpandedFolders((prev) => new Set([...prev, parentId]));
    }
    setContextItem(null);
    setShowNewMenu(false);
  };

  const handleNewRoot = (type: "note" | "code" | "folder") => {
    createItem({ title: type === "folder" ? "New Folder" : type === "code" ? "Untitled Code" : "Untitled Note", type, parentId: null });
    setShowNewMenu(false);
  };

  const totalItems = items.length;
  const folderCount = items.filter((i) => i.type === "folder").length;
  const noteCount = items.filter((i) => i.type !== "folder").length;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explorer</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {folderCount} folders · {noteCount} files
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowNewMenu((v) => !v)}
        >
          <IconSymbol name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* New item menu */}
      {showNewMenu && (
        <View style={[styles.newMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>