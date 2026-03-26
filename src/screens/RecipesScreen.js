import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { Animated, useFadeInUp, usePressScale, useStaggeredItem } from '../components/useAnimations';
import {
  IngredientMatchBar,
  GroupedCard,
  hapticSelection,
  hapticMedium,
  hapticSuccess,
} from '../components/shared';
import { MOCK_RECIPES } from '../data';
import { ANTHROPIC_API_KEY, ANTHROPIC_URL, MODEL } from '../config';

function RecipeRow({ recipe, onPress, index }) {
  const press = usePressScale(0.98);
  const anim = useStaggeredItem(index);
  const have = recipe.ingredients.filter((i) => i.fromFridge).length;
  const total = recipe.ingredients.length;

  return (
    <Animated.View style={[press.style, anim]}>
      <TouchableOpacity
        style={styles.recipeRow}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        activeOpacity={1}
      >
        <View style={styles.recipeEmojiWrap}>
          <Text style={{ fontSize: 28 }}>{recipe.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            {recipe.usesExpiring && <View style={styles.urgentDot} />}
          </View>
          <Text style={styles.recipeMeta}>
            {recipe.time} · {recipe.difficulty} · {recipe.cuisineType}
          </Text>
          <IngredientMatchBar have={have} total={total} />
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RecipesScreen({ navigation, fridgeItems, savedRecipes, setSavedRecipes, addActivity }) {
  const [tab, setTab] = useState('forYou');
  const [recipes, setRecipes] = useState(MOCK_RECIPES);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const headerAnim = useFadeInUp();

  const showToast = useCallback((text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const generateRecipes = async () => {
    hapticMedium();
    setGenerating(true);

    if (ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      // Demo mode
      await new Promise((r) => setTimeout(r, 1700));
      hapticSuccess();
      setRecipes(MOCK_RECIPES);
      showToast('Generated 3 recipes from your kitchen! ✨');
      addActivity('Generated 3 recipes from kitchen', '✨');
    } else {
      try {
        const inv = fridgeItems.map((i) => `${i.name}(${i.qty} ${i.unit}, ${i.expiryDays}d)`).join(', ');
        const resp = await fetch(ANTHROPIC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: `Given these kitchen items: ${inv}\n\nGenerate a JSON array of 3 recipes. Each recipe: {id, name, emoji, time, difficulty, servings, description, usesExpiring (bool if uses items expiring in <3 days), cuisineType, ingredients: [{name, qty, fromFridge (bool)}], steps: [{instruction, timerSeconds (number or null)}], nutrition: {calories, protein, carbs, fat}}. Return ONLY the JSON array.`,
            }],
          }),
        });
        const data = await resp.json();
        const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        setRecipes(parsed);
        hapticSuccess();
        showToast(`Generated ${parsed.length} recipes! ✨`);
        addActivity(`Generated ${parsed.length} recipes from kitchen`, '✨');
      } catch (e) {
        showToast('Failed to generate recipes', 'error');
      }
    }
    setGenerating(false);
  };

  const displayRecipes = tab === 'saved' ? savedRecipes : recipes;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={headerAnim}>
        <Text style={styles.title}>Recipes</Text>
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'forYou' && styles.tabActive]}
          onPress={() => { hapticSelection(); setTab('forYou'); }}
        >
          <Text style={[styles.tabText, tab === 'forYou' && styles.tabTextActive]}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'saved' && styles.tabActive]}
          onPress={() => { hapticSelection(); setTab('saved'); }}
        >
          <Text style={[styles.tabText, tab === 'saved' && styles.tabTextActive]}>
            Saved ({savedRecipes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      {toast && (
        <View style={[styles.toast, toast.type === 'error' && { backgroundColor: COLORS.dangerLight }]}>
          <Text style={[styles.toastText, toast.type === 'error' && { color: COLORS.danger }]}>
            {toast.text}
          </Text>
        </View>
      )}

      {/* Generate Button */}
      {tab === 'forYou' && (
        <TouchableOpacity style={styles.generateRow} onPress={generateRecipes} disabled={generating}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.generateTitle}>Generate from my kitchen</Text>
            <Text style={styles.generateSub}>AI-powered recipes from what you have</Text>
          </View>
          {generating ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.chevron}>›</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Recipe List */}
      <GroupedCard>
        {displayRecipes.map((recipe, i) => (
          <React.Fragment key={recipe.id}>
            <RecipeRow
              recipe={recipe}
              index={i}
              onPress={() => {
                hapticMedium();
                navigation.navigate('RecipeDetail', { recipe });
              }}
            />
            {i < displayRecipes.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </GroupedCard>

      {displayRecipes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {tab === 'saved' ? '🔖' : '👨‍🍳'}
          </Text>
          <Text style={styles.emptyText}>
            {tab === 'saved' ? 'No saved recipes yet' : 'Generate recipes from your kitchen!'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 60, paddingBottom: 110, gap: 16 },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display,
    color: COLORS.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  toast: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.xl,
    padding: 14,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.success,
  },
  generateRow: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateTitle: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  generateSub: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  recipeEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  urgentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  recipeMeta: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 74,
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
