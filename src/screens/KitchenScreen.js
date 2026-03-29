import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { FONTS, RADIUS } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useFABScroll } from '../context/FABContext';
import { Animated, useFadeInUp, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  ExpiryBadge,
  PrimaryButton,
  SectionTitle,
  GroupedCard,
  hapticSelection,
  hapticMedium,
  hapticSuccess,
  hapticDestructive,
} from '../components/shared';
import { LOCATIONS } from '../data';

export default function KitchenScreen({ fridgeItems, setFridgeItems, shoppingList, setShoppingList, addActivity }) {
  const { colors: COLORS } = useTheme();
  const onFABScroll = useFABScroll();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 24, paddingTop: 60, paddingBottom: 110 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontFamily: FONTS.display,
      color: COLORS.text,
    },
    addPill: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.full,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    addPillText: {
      fontSize: 14,
      fontFamily: FONTS.bodyBold,
      color: '#fff',
    },
    addForm: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      padding: 16,
      marginBottom: 16,
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
    locationChips: {
      flexDirection: 'row',
      gap: 8,
    },
    locChip: {
      backgroundColor: COLORS.cardAlt,
      borderRadius: RADIUS.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    locChipActive: {
      backgroundColor: COLORS.primary + '33',
    },
    locChipText: {
      fontSize: 13,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textMuted,
    },
    locChipTextActive: {
      color: COLORS.primary,
    },
    searchInput: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.xl,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: FONTS.body,
      color: COLORS.text,
      marginBottom: 12,
    },
    filterChip: {
      backgroundColor: COLORS.card,
      borderRadius: RADIUS.full,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    filterChipActive: {
      backgroundColor: COLORS.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontFamily: FONTS.bodyMed,
      color: COLORS.textMuted,
    },
    filterChipTextActive: {
      color: '#fff',
    },
    countText: {
      fontSize: 13,
      fontFamily: FONTS.body,
      color: COLORS.textDim,
      marginBottom: 16,
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
    itemEmoji: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: COLORS.cardAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemName: {
      fontSize: 15,
      fontFamily: FONTS.bodyMed,
      color: COLORS.text,
    },
    itemSub: {
      fontSize: 12,
      fontFamily: FONTS.body,
      color: COLORS.textMuted,
      marginTop: 2,
    },
    addCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: COLORS.cardAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    addCircleText: {
      fontSize: 18,
      color: COLORS.primary,
      fontWeight: '600',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: COLORS.border,
      marginLeft: 64,
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

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [newItem, setNewItem] = useState({ name: '', emoji: '🍎', qty: '1', unit: 'pcs', expiryDays: '7', location: 'Fridge' });

  const headerAnim = useFadeInUp();

  const filters = ['All', ...LOCATIONS];
  const filtered = useMemo(() => {
    let items = fridgeItems;
    if (filter !== 'All') items = items.filter((i) => i.location === filter);
    if (search) items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [fridgeItems, filter, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    hapticSuccess();
    const item = {
      id: 'f' + Date.now(),
      name: newItem.name.trim(),
      emoji: newItem.emoji || '🍎',
      qty: parseInt(newItem.qty) || 1,
      unit: newItem.unit || 'pcs',
      expiryDays: parseInt(newItem.expiryDays) || 7,
      location: newItem.location,
      category: 'Other',
      threshold: 1,
    };
    setFridgeItems((prev) => [...prev, item]);
    addActivity(`Added ${item.name} to ${item.location}`, '➕');
    setNewItem({ name: '', emoji: '🍎', qty: '1', unit: 'pcs', expiryDays: '7', location: 'Fridge' });
    setShowAdd(false);
  };

  const handleRemove = (item) => {
    hapticDestructive();
    Alert.alert('Remove Item', `Remove ${item.name} from kitchen?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setFridgeItems((prev) => prev.filter((i) => i.id !== item.id));
          addActivity(`Removed ${item.name}`, '🗑️');
        },
      },
    ]);
  };

  const addToShoppingList = (item) => {
    hapticSuccess();
    const exists = shoppingList.find((s) => s.name === item.name);
    if (!exists) {
      setShoppingList((prev) => [...prev, {
        id: 's' + Date.now(),
        name: item.name,
        qty: 1,
        unit: item.unit,
        category: item.category,
        checked: false,
        source: 'manual',
        sourceLabel: null,
      }]);
      addActivity(`Added ${item.name} to shopping list`, '🛒');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={onFABScroll} scrollEventThrottle={16}>
      {/* Header */}
      <Animated.View style={[styles.headerRow, headerAnim]}>
        <Text style={styles.title}>Kitchen</Text>
        <TouchableOpacity
          style={styles.addPill}
          onPress={() => { hapticMedium(); setShowAdd(!showAdd); }}
        >
          <Text style={styles.addPillText}>{showAdd ? '✕ Close' : '+ Add'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Add Form */}
      {showAdd && (
        <View style={styles.addForm}>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Item name"
              placeholderTextColor={COLORS.textDim}
              value={newItem.name}
              onChangeText={(t) => setNewItem({ ...newItem, name: t })}
            />
            <TextInput
              style={[styles.input, { width: 50, textAlign: 'center' }]}
              placeholder="🍎"
              value={newItem.emoji}
              onChangeText={(t) => setNewItem({ ...newItem, emoji: t })}
            />
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { width: 60 }]}
              placeholder="Qty"
              placeholderTextColor={COLORS.textDim}
              value={newItem.qty}
              onChangeText={(t) => setNewItem({ ...newItem, qty: t })}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { width: 70 }]}
              placeholder="Unit"
              placeholderTextColor={COLORS.textDim}
              value={newItem.unit}
              onChangeText={(t) => setNewItem({ ...newItem, unit: t })}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Expiry days"
              placeholderTextColor={COLORS.textDim}
              value={newItem.expiryDays}
              onChangeText={(t) => setNewItem({ ...newItem, expiryDays: t })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.locationChips}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[styles.locChip, newItem.location === loc && styles.locChipActive]}
                onPress={() => { hapticSelection(); setNewItem({ ...newItem, location: loc }); }}
              >
                <Text style={[styles.locChipText, newItem.location === loc && styles.locChipTextActive]}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton label="Add to Kitchen" onPress={handleAdd} icon="➕" />
        </View>
      )}

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        placeholderTextColor={COLORS.textDim}
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => { hapticSelection(); setFilter(f); }}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Item Count */}
      <Text style={styles.countText}>{filtered.length} items</Text>

      {/* Grouped Items */}
      {grouped.map(([category, items], gi) => {
        const catAnim = useStaggeredItem(gi);
        return (
          <Animated.View key={category} style={[{ marginBottom: 20 }, catAnim]}>
            <Text style={styles.categoryLabel}>{category.toUpperCase()}</Text>
            <GroupedCard>
              {items.map((item, i) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.itemRow}
                    onLongPress={() => handleRemove(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemEmoji}>
                      <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemSub}>{item.qty} {item.unit} · {item.location}</Text>
                    </View>
                    <ExpiryBadge days={item.expiryDays} />
                    <TouchableOpacity
                      style={styles.addCircle}
                      onPress={() => addToShoppingList(item)}
                    >
                      <Text style={styles.addCircleText}>+</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {i < items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </GroupedCard>
          </Animated.View>
        );
      })}

      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
          <Text style={styles.emptyText}>No items found</Text>
        </View>
      )}
    </ScrollView>
  );
}
