import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, RADIUS } from '../theme';
import { Animated, useFadeInUp, useSuccessFlash } from '../components/useAnimations';
import {
  PrimaryButton,
  GhostButton,
  Card,
  hapticSelection,
  hapticMedium,
  hapticSuccess,
  hapticError,
} from '../components/shared';
import { MOCK_RECEIPT_ITEMS } from '../data';
import { ANTHROPIC_API_KEY, ANTHROPIC_URL, MODEL } from '../config';

const { width } = Dimensions.get('window');

export default function ScanScreen({ navigation, setFridgeItems, addActivity }) {
  const [mode, setMode] = useState('receipt');
  const [permission, requestPermission] = useCameraPermissions();

  // Barcode state
  const [scanned, setScanned] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState(null);

  // Receipt state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reviewItems, setReviewItems] = useState(null);

  const successFlash = useSuccessFlash();
  const headerAnim = useFadeInUp();

  // Progress animation for receipt scanning
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.05 + Math.random() * 0.08, 0.92));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleBarcodeScan = ({ data, type }) => {
    if (scanned) return;
    setScanned(true);
    hapticSuccess();
    successFlash.flash();
    setBarcodeResult({
      type,
      data,
      name: 'Scanned Item',
      emoji: '📦',
    });
  };

  const addBarcodeItem = () => {
    hapticSuccess();
    setFridgeItems((prev) => [
      ...prev,
      {
        id: 'f' + Date.now(),
        name: barcodeResult.name,
        qty: 1,
        unit: 'pcs',
        location: 'Fridge',
        category: 'Other',
        expiryDays: 7,
        emoji: barcodeResult.emoji,
        threshold: 1,
      },
    ]);
    addActivity(`Scanned & added ${barcodeResult.name}`, '📱');
    navigation.goBack();
  };

  const scanReceipt = async () => {
    hapticMedium();
    setLoading(true);
    setProgress(0);

    if (ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      // Demo mode
      await new Promise((r) => setTimeout(r, 1800));
      setProgress(1);
      hapticSuccess();
      setReviewItems(MOCK_RECEIPT_ITEMS.map((i) => ({ ...i })));
      setLoading(false);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });
      if (result.canceled) {
        setLoading(false);
        return;
      }

      const resp = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: result.assets[0].base64,
                },
              },
              {
                type: 'text',
                text: 'Extract items from this grocery receipt. Return JSON: {store, date, total, items: [{name, qty, unit, expiryDays, emoji, category, selected: true}]}. Return ONLY the JSON.',
              },
            ],
          }],
        }),
      });

      const data = await resp.json();
      const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      setProgress(1);
      hapticSuccess();
      setReviewItems(parsed.items);
    } catch (e) {
      hapticError();
      setReviewItems(MOCK_RECEIPT_ITEMS.map((i) => ({ ...i })));
    }
    setLoading(false);
  };

  const toggleItem = (index) => {
    hapticSelection();
    setReviewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const addReviewItems = () => {
    const selected = reviewItems.filter((i) => i.selected);
    hapticSuccess();
    const newItems = selected.map((item, i) => ({
      id: 'f' + Date.now() + i,
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      location: 'Fridge',
      category: item.category,
      expiryDays: item.expiryDays,
      emoji: item.emoji,
      threshold: 1,
    }));
    setFridgeItems((prev) => [...prev, ...newItems]);
    addActivity(`Added ${selected.length} items from receipt`, '🧾');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim]}>
        <TouchableOpacity onPress={() => { hapticSelection(); navigation.goBack(); }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan</Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      {/* Mode Toggle */}
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'barcode' && styles.modeTabActive]}
          onPress={() => { hapticSelection(); setMode('barcode'); setScanned(false); setBarcodeResult(null); }}
        >
          <Text style={[styles.modeText, mode === 'barcode' && styles.modeTextActive]}>Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'receipt' && styles.modeTabActive]}
          onPress={() => { hapticSelection(); setMode('receipt'); setReviewItems(null); }}
        >
          <Text style={[styles.modeText, mode === 'receipt' && styles.modeTextActive]}>Receipt</Text>
        </TouchableOpacity>
      </View>

      {/* Barcode Mode */}
      {mode === 'barcode' && (
        <View style={{ flex: 1 }}>
          {!permission?.granted ? (
            <View style={styles.permissionWrap}>
              <Text style={styles.permissionText}>Camera access needed to scan barcodes</Text>
              <PrimaryButton label="Grant Permission" onPress={requestPermission} />
            </View>
          ) : barcodeResult ? (
            <View style={styles.resultWrap}>
              <Card style={styles.resultCard}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>{barcodeResult.emoji}</Text>
                <Text style={styles.resultName}>{barcodeResult.name}</Text>
                <Text style={styles.resultCode}>{barcodeResult.data}</Text>
              </Card>
              <View style={{ gap: 12, width: '100%', paddingHorizontal: 24 }}>
                <PrimaryButton label="Add to Kitchen" onPress={addBarcodeItem} icon="➕" />
                <GhostButton label="Scan Again" onPress={() => { setScanned(false); setBarcodeResult(null); }} />
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] }}
              />
              {/* Finder overlay */}
              <View style={styles.finderOverlay}>
                <View style={styles.finderCorner} />
              </View>
              <Animated.View style={[styles.successFlash, successFlash.style]} />
            </View>
          )}
        </View>
      )}

      {/* Receipt Mode */}
      {mode === 'receipt' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.receiptContent}>
          {!reviewItems && !loading && (
            <Card style={styles.receiptStart}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>📷</Text>
              <Text style={styles.receiptTitle}>Scan a Receipt</Text>
              <Text style={styles.receiptSub}>Take a photo or use the demo scanner</Text>
              <View style={{ width: '100%', marginTop: 20, gap: 12 }}>
                <PrimaryButton label="Scan Receipt" onPress={scanReceipt} icon="📷" />
              </View>
            </Card>
          )}

          {loading && (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Scanning receipt...</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </Card>
          )}

          {reviewItems && !loading && (
            <>
              <Text style={styles.reviewTitle}>Review Items</Text>
              <Text style={styles.reviewSub}>
                {reviewItems.filter((i) => i.selected).length} of {reviewItems.length} selected
              </Text>
              <View style={styles.reviewList}>
                {reviewItems.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.reviewRow, !item.selected && { opacity: 0.4 }]}
                    onPress={() => toggleItem(i)}
                  >
                    <View style={[styles.reviewCheck, item.selected && styles.reviewCheckActive]}>
                      {item.selected && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                    </View>
                    <Text style={{ fontSize: 22, marginRight: 10 }}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{item.name}</Text>
                      <Text style={styles.reviewQty}>{item.qty} {item.unit} · {item.expiryDays}d</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ gap: 12, marginTop: 16 }}>
                <PrimaryButton
                  label={`Add ${reviewItems.filter((i) => i.selected).length} Items to Kitchen`}
                  onPress={addReviewItems}
                  icon="➕"
                />
                <GhostButton label="Cancel" onPress={() => navigation.goBack()} color={COLORS.textMuted} />
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  closeBtn: {
    fontSize: 22,
    color: COLORS.textSub,
    width: 32,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  modeBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMed,
    color: COLORS.textMuted,
  },
  modeTextActive: {
    color: '#fff',
  },
  camera: {
    flex: 1,
    borderRadius: RADIUS.xl,
    marginHorizontal: 24,
    overflow: 'hidden',
  },
  finderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  finderCorner: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    opacity: 0.6,
  },
  successFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.success,
    opacity: 0,
    marginHorizontal: 24,
    borderRadius: RADIUS.xl,
  },
  permissionWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  resultWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  resultCard: {
    alignItems: 'center',
    marginHorizontal: 24,
    width: width - 48,
  },
  resultName: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  resultCode: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  receiptContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  receiptStart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  receiptTitle: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  receiptSub: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  progressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  reviewTitle: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  reviewSub: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  reviewList: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  reviewCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewCheckActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reviewName: {
    fontSize: 15,
    fontFamily: FONTS.bodyMed,
    color: COLORS.text,
  },
  reviewQty: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
