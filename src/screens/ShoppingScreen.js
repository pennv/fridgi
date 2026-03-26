import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { Animated, useFadeInUp, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  PrimaryButton,
  Card,
  GroupedCard,
  Tag,
  hapticSelection,
  hapticMedium,
  hapticSuccess,
} from '../components/shared';

export default function ShoppingScreen({ shoppingList, setShoppingList, fridgeItems, addActivity }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('pcs');

  const headerAnim = useFadeInUp();

  const unchecked = shoppingList.filter((i) => !i.checked);
  const checked = shoppingList.filter((i) => i.checked);

  const grouped = useMemo(() => {
    const map = {};
    unchecked.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [unchecked]);

  const expiringNotOnList = fridgeItems.filter(
    (fi) => fi.expiryDays <= 3 && !shoppingList.some((s) => s.name === fi.name)
  );

  const toggleCheck = (id) => {
    hapticSelection();
    setShoppingList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    hapticSuccess();
    setShoppingList((prev) => [
      ...prev,
      {
        id: 's' + Date.now(),
        name: newName.trim(),
        qty: parseInt(newQty) || 1,
        unit: newUnit || 'pcs',
        category: 'Other',
        checked: false,
        source: 'manual',
        sourceLabel: null,
      },
    ]);
    addActivity(`Added ${newName.trim()} to shopping list`, '🛒');
    setNewName('');
    setNewQty('1');
    setShowAdd(false);
  };

  const clearDone = () => {
    hapticSelection();
    setShoppingList((prev) => prev.filter((i) => !i.checked));
  };

  const addSuggestion = (item) => {
    hapticSuccess();
    setShoppingList((prev) => [
      ...prev,
      {
        id: 's' + Date.now(),
        name: item.name,
        qty: 1,
        unit: item.unit,
        category: item.category,
        checked: false,
        source: 'expiry',
        sourceLabel: 'Expiring',
      },
    ]);
    addActivity(`Added ${item.name} to shopping list (expiring)`, '🛒');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={[styles.headerRow, headerAnim]}>
        <View>
          <Text style={styles.title}>Shopping</Text>
          <Text style={styles.subtitle}>{unchecked.length} items to buy</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {checked.length > 0 && (
            <TouchableOpacity
              style={styles.clearPill}
              onPress={clearDone}
            >
              <Text style={styles.clearPillText}>Clear done</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addPill}
            onPress={() => { hapticMedium(); setShowAdd(!showAdd); }}
          >
            <Text style={styles.addPillText}>{showAdd ? '✕' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Add Form */}
      {showAdd && (
        <View style={styles.addForm}>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Item name"
              placeholderTextColor={COLORS.textDim}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { width: 55 }]}
              placeholder="Qty"
              placeholderTextColor={COLORS.textDim}
              value={newQty}
              onChangeText={setNewQty}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { width: 65 }]}
              placeholder="Unit"
              placeholderTextColor={COLORS.textDim}
              value={newUnit}
              onChangeText={setNewUnit}
            />
          </View>
          <PrimaryButton label="Add to List" onPress={handleAdd} icon="➕" />
        </View>
      )}

      {/* Smart Suggestions */}
      {expiringNotOnList.length > 0 && (
        <Card style={styles.suggestionsCard}>
          <Text style={styles.suggestionsTitle}>💡 Smart Suggestions</Text>
          <Text style={styles.suggestionsSub}>These items are expiring — restock?</Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {expiringNotOnList.map((item) => (
              <View key={item.id} style={styles.suggestionRow}>
                <Text style={{ fontSize: 18, marginRight: 10 }}>{item.emoji}</Text>
                <Text style={styles.suggestionName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.suggestionAdd}
                  onPress={() => addSuggestion(item)}
                >
                  <Text style={styles.suggestionAddText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Shopping Items */}
      {grouped.map(([category, items], gi) => {
        const catAnim = useStaggeredItem(gi);
        return (
          <Animated.View key={category} style={catAnim}>
            <Text style={styles.categoryLabel}>{category.toUpperCase()}</Text>
            <GroupedCard>
              {items.map((item, i) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => toggleCheck(item.id)}
                  >
                    <View style={styles.checkbox}>
                      {item.checked && <View style={styles.checkboxFill} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
                    </View>
                    {item.sourceLabel && (
                      <Tag label={item.sourceLabel} color={
                        item.source === 'recipe' ? COLORS.primary :
                        item.source === 'expiry' ? COLORS.warning :
                        item.source === 'lowstock' ? COLORS.info : COLORS.textMuted
                      } />
                    )}
                  </TouchableOpacity>
                  {i < items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </GroupedCard>
          </Animated.View>
        );
      })}

      {/* Done Section */}
      {checked.length > 0 && (
        <View style={{ opacity: 0.5, marginTop: 8 }}>
          <Text style={styles.categoryLabel}>DONE</Text>
          <GroupedCard>
            {checked.map((item, i) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => toggleCheck(item.id)}
                >
                  <View style={[styles.checkbox, styles.checkboxChecked]}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                  </View>
                  <Text style={styles.itemNameDone}>{item.name}</Text>
                </TouchableOpacity>
                {i < checked.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </GroupedCard>
        </View>
      )}

      {unchecked.length === 0 && checked.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
          <Text style={styles.emptyText}>Your shopping list is empty</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60, paddingBottom: 110, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  addPill: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addPillText: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    color: '#fff',
  },
  clearPill: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearPillText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMed,
    color: COLORS.textMuted,
  },
  addForm: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    gap: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  suggestionsCard: {
    borderWidth: 1,
    borderColor: COLORS.warningLight,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  suggestionsSub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionName: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  suggestionAdd: {
    backgroundColor: COLORS.primary + '22',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionAddText: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    color: COLORS.primary,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  itemName: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  itemNameDone: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    flex: 1,
    marginLeft: 12,
  },
  itemQty: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 50,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
