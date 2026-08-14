import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type TextInput as RNTextInputType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { recordAnalysisFeedback } from '@/lib/analysisFeedback';
import { CAT_LIFESTYLE_OPTIONS } from '@/lib/catLifestyle';
import { formatDexNumber } from '@/lib/constants';
import {
  catDexRarityLabel,
  resolveRevealRarity,
  rarityTokens,
} from '@/lib/catTheme';
import { genderSymbol } from '@/lib/catTraits';
import { useTheme } from '@/theme/ThemeProvider';
import type { AnalysisFieldCorrection, CatAnalysis, CatLifestyle } from '@/types/cat';

export type CaptureRevealResult = {
  name: string;
  analysis: CatAnalysis;
  lifestyle: CatLifestyle;
  corrections: AnalysisFieldCorrection[];
};

type Props = {
  name: string;
  number: number;
  photoUri: string;
  analysis: CatAnalysis;
  onAdd: (result: CaptureRevealResult) => void;
  onRetake: () => void;
};

type FieldKey =
  | 'name'
  | 'color'
  | 'breed'
  | 'coat'
  | 'pattern'
  | 'tag'
  | 'description';

function EditableRow({
  label,
  value,
  placeholder,
  editing,
  multiline = false,
  autoCapitalize = 'sentences',
  onStartEdit,
  onChangeText,
  onEndEdit,
}: {
  label: string;
  value: string;
  placeholder: string;
  editing: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onStartEdit: () => void;
  onChangeText: (text: string) => void;
  onEndEdit: () => void;
}) {
  const { colors, fonts, spacing, radius, typography } = useTheme();
  const inputRef = useRef<RNTextInputType>(null);

  useEffect(() => {
    if (!editing) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(timer);
  }, [editing]);

  return (
    <View style={{ gap: spacing[4] }}>
      <Text variant="bodySmall" weight="semibold" color="textBody">
        {label}
      </Text>
      {editing ? (
        <View
          style={{
            minHeight: multiline ? spacing[96] : spacing[48],
            borderRadius: radius.md,
            borderWidth: 2,
            borderColor: colors.focusRing,
            backgroundColor: colors.surfaceElevated,
            paddingHorizontal: spacing[16],
            paddingVertical: multiline ? spacing[16] : 0,
            justifyContent: multiline ? 'flex-start' : 'center' }}
        >
          <RNTextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onBlur={onEndEdit}
            onSubmitEditing={multiline ? undefined : onEndEdit}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            returnKeyType={multiline ? 'default' : 'done'}
            accessibilityLabel={`${label} — modification`}
            style={{
              padding: 0,
              margin: 0,
              minHeight: multiline ? spacing[64] : undefined,
              color: colors.text,
              fontFamily: fonts.body,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight }}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Modifier ${label}`}
          onPress={onStartEdit}
          style={({ pressed }) => ({
            minHeight: multiline ? spacing[80] : spacing[48],
            justifyContent: multiline ? 'flex-start' : 'center',
            paddingHorizontal: spacing[16],
            paddingVertical: multiline ? spacing[16] : 0,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceElevated,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <Text
            variant="body"
            color={value.trim() ? 'text' : 'textMuted'}
            numberOfLines={multiline ? 4 : 1}
          >
            {value.trim() || placeholder}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function collectCorrections(args: {
  predicted: {
    type: string;
    color: string;
    coat: string;
    pattern: string;
    name: string;
    description: string;
    trait: string;
  };
  current: {
    type: string;
    color: string;
    coat: string;
    pattern: string;
    name: string;
    description: string;
    trait: string;
  };
}): AnalysisFieldCorrection[] {
  const fields: Array<{
    field: AnalysisFieldCorrection['field'];
    predicted: string;
    corrected: string;
  }> = [
    { field: 'type', predicted: args.predicted.type, corrected: args.current.type },
    { field: 'color', predicted: args.predicted.color, corrected: args.current.color },
    { field: 'coat', predicted: args.predicted.coat, corrected: args.current.coat },
    { field: 'pattern', predicted: args.predicted.pattern, corrected: args.current.pattern },
    { field: 'name', predicted: args.predicted.name, corrected: args.current.name },
    {
      field: 'description',
      predicted: args.predicted.description,
      corrected: args.current.description,
    },
    { field: 'trait', predicted: args.predicted.trait, corrected: args.current.trait },
  ];

  return fields
    .filter((f) => f.predicted.trim() !== f.corrected.trim())
    .map((f) => ({
      field: f.field,
      predicted: f.predicted.trim(),
      corrected: f.corrected.trim(),
    }));
}

/**
 * « Nouveau chat découvert » — verify / correct AI fields before CatDex add.
 */
export function CaptureReveal({
  name: initialName,
  number,
  photoUri,
  analysis: rawAnalysis,
  onAdd,
  onRetake,
}: Props) {
  const { colors, fonts, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  // Vision data only — never invent / enrich fields for the form.
  const vision = useMemo(() => rawAnalysis, [rawAnalysis]);
  const aiName = (vision.suggestedName || '').trim();

  const predicted = useMemo(
    () => ({
      type: vision.breed || '',
      color: vision.color || '',
      coat: vision.coat || '',
      pattern: vision.coatPattern || '',
      name: aiName,
      description: vision.description || '',
      trait: vision.tags?.[0] ?? '',
    }),
    [vision, aiName],
  );

  useEffect(() => {
    console.log('[CATDEX ANALYSIS] Form mapped values:', {
      name: aiName,
      breed: vision.breed,
      color: vision.color,
      coat: vision.coat,
      particularite:
        vision.distinctiveFeatures?.slice(0, 3).join(', ') || vision.coatPattern,
      trait: vision.tags?.[0],
      description: vision.description?.slice(0, 120),
      confidence: vision.confidence,
      // Clarify which fields are empty vs. filled
      emptyFields: {
        name: !aiName,
        breed: !vision.breed,
        color: !vision.color,
        coat: !vision.coat,
        particularite: !(vision.distinctiveFeatures?.length || vision.coatPattern),
        trait: !vision.tags?.[0],
        description: !vision.description,
      },
    });
  }, [vision, aiName]);

  const [name, setName] = useState(aiName);
  const [tag, setTag] = useState(vision.tags?.[0] ?? '');
  const [coat, setCoat] = useState(vision.coat || '');
  const [breed, setBreed] = useState(vision.breed || '');
  const [color, setColor] = useState(vision.color || '');
  const [pattern, setPattern] = useState(
    vision.distinctiveFeatures && vision.distinctiveFeatures.length > 0
      ? vision.distinctiveFeatures.slice(0, 3).join(', ')
      : vision.coatPattern || '',
  );
  const [description, setDescription] = useState(vision.description || '');
  const [lifestyle, setLifestyle] = useState<CatLifestyle>('sauvage');
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const dexLabel = formatDexNumber(number);
  const rarityId = resolveRevealRarity(
    { ...vision, color, breed, coat },
    number,
  );
  const rarity = rarityTokens[rarityId];
  const symbol = genderSymbol(vision.gender);
  const keyboardOpen = keyboardHeight > 0;
  const footerPadBottom = keyboardOpen
    ? spacing[16]
    : Math.max(insets.bottom, spacing[16]);

  const handleColorChange = (nextColor: string) => {
    setColor(nextColor);
  };

  const handleNameChange = (next: string) => {
    setName(next);
  };

  const buildResult = (): CaptureRevealResult => {
    const trimmedName = name.trim() || aiName || initialName || 'Sans nom';
    const nextTags = [tag.trim(), ...(vision.tags ?? []).slice(1)].filter(Boolean);
    const nextColor = color.trim();
    const nextBreed = breed.trim();
    const nextCoat = coat.trim();
    const nextPattern = pattern.trim();
    const nextDescription = description.trim();

    console.log('[CaptureReveal] submit mapping', {
      name: trimmedName,
      breed: nextBreed,
      color: nextColor,
      coat: nextCoat,
      particularite: nextPattern,
      trait: tag.trim(),
      description: nextDescription.slice(0, 120),
    });

    const corrections = collectCorrections({
      predicted,
      current: {
        type: nextBreed,
        color: nextColor,
        coat: nextCoat,
        pattern: nextPattern || '',
        name: trimmedName,
        description: nextDescription,
        trait: tag.trim(),
      },
    });

    return {
      name: trimmedName,
      lifestyle,
      corrections,
      analysis: {
        ...vision,
        color: nextColor,
        breed: nextBreed,
        coat: nextCoat,
        coatPattern: nextPattern || undefined,
        distinctiveFeatures: nextPattern
          ? nextPattern.split(',').map((s) => s.trim()).filter(Boolean)
          : vision.distinctiveFeatures,
        description: nextDescription,
        suggestedName: trimmedName,
        tags: nextTags,
        habitat: lifestyle === 'domestique' ? 'Domestique' : 'Sauvage',
      },
    };
  };

  const handleValidate = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = buildResult();
    try {
      await recordAnalysisFeedback({
        predicted: {
          type: predicted.type,
          color: predicted.color,
          coat: predicted.coat,
          pattern: predicted.pattern,
        },
        corrections: result.corrections,
        confirmed: true,
      });
    } catch {
      // Non-blocking — still add the cat.
    }
    onAdd(result);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={{
          paddingTop: insets.top + spacing[8],
          paddingHorizontal: spacing[24],
          paddingBottom: spacing[8],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.background }}
      >
        <AuthBackButton onPress={onRetake} />
        <Text variant="bodySmall" weight="semibold" color="textBrand">
          {dexLabel}
        </Text>
        <View style={{ width: spacing[40], height: spacing[40] }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing[24],
          paddingTop: spacing[8],
          paddingBottom: spacing[24],
          gap: spacing[24],
          alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View
          style={[
            {
              width: '100%',
              borderRadius: radius.cta,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            },
            shadow.medium,
          ]}
        >
          <View
            style={{
              paddingHorizontal: spacing[16],
              paddingTop: spacing[16],
              paddingBottom: spacing[8],
              gap: spacing[4] }}
          >
            <Text
              variant="headline"
              color="textBrand"
            >
              {name.trim() || aiName || 'Nouveau chat'}
              {symbol ? ` ${symbol}` : ''}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing[8],
                alignItems: 'center' }}
            >
              <Badge
                label={catDexRarityLabel(rarityId)}
                color={rarity.foreground}
                backgroundColor={rarity.background}
              />
              <Text variant="bodySmall" weight="semibold" color="textBrand">
                {dexLabel}
              </Text>
            </View>
          </View>

          <Image
            source={{ uri: photoUri }}
            resizeMode="cover"
            style={{ width: '100%', aspectRatio: 1 }}
            accessibilityLabel={`Photo de ${name || aiName || 'chat'}`}
          />

          {vision.requiresUserConfirmation ? (
            <Text
              variant="bodySmall"
              color="warning"
              align="center"
              style={{ padding: spacing[16] }}
            >
              Confiance limitée — vérifie les infos ci-dessous.
            </Text>
          ) : (
            <Text
              variant="caption"
              color="textMuted"
              align="center"
              style={{ padding: spacing[16] }}
            >
              Tape une ligne pour corriger
            </Text>
          )}
        </View>

        <View style={{ width: '100%', gap: spacing[16] }}>
          <Text variant="title" color="text">
            Modifier les informations
          </Text>

          <View style={{ gap: spacing[8] }}>
            <Text variant="bodySmall" weight="semibold" color="textBody">
              Type
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choisir domestique ou sauvage"
              accessibilityState={{ expanded: lifestyleOpen }}
              onPress={() => {
                setEditingField(null);
                setLifestyleOpen((open) => !open);
              }}
              style={({ pressed }) => ({
                minHeight: spacing[48],
                justifyContent: 'center',
                paddingHorizontal: spacing[16],
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: lifestyleOpen ? colors.focusRing : colors.border,
                backgroundColor: colors.surfaceElevated,
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <Text variant="body" color="text">
                {CAT_LIFESTYLE_OPTIONS.find((option) => option.value === lifestyle)?.label ??
                  'Sauvage'}
              </Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: spacing[4] }}>
                {CAT_LIFESTYLE_OPTIONS.find((option) => option.value === lifestyle)?.hint}
              </Text>
            </Pressable>
            {lifestyleOpen ? (
              <View
                style={{
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                  overflow: 'hidden',
                }}
              >
                {CAT_LIFESTYLE_OPTIONS.map((option, index) => {
                  const selected = option.value === lifestyle;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setLifestyle(option.value);
                        setLifestyleOpen(false);
                      }}
                      style={({ pressed }) => ({
                        paddingHorizontal: spacing[16],
                        paddingVertical: spacing[16],
                        backgroundColor: selected ? colors.brandSoft : colors.surfaceElevated,
                        borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                        borderTopColor: colors.border,
                        opacity: pressed ? 0.92 : 1,
                      })}
                    >
                      <Text
                        variant="body"
                        weight={selected ? 'semibold' : undefined}
                        color={selected ? 'textBrand' : 'text'}
                      >
                        {option.label}
                      </Text>
                      <Text variant="caption" color="textMuted" style={{ marginTop: spacing[4] }}>
                        {option.hint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <EditableRow
            label="Nom"
            value={name}
            placeholder="(Tape un nom)"
            editing={editingField === 'name'}
            autoCapitalize="words"
            onStartEdit={() => setEditingField('name')}
            onChangeText={handleNameChange}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Race"
            value={breed}
            placeholder="(Indique la race si connue)"
            editing={editingField === 'breed'}
            onStartEdit={() => setEditingField('breed')}
            onChangeText={setBreed}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Couleur"
            value={color}
            placeholder="(Indique la couleur)"
            editing={editingField === 'color'}
            onStartEdit={() => setEditingField('color')}
            onChangeText={handleColorChange}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Pelage"
            value={coat}
            placeholder="(Décris le pelage)"
            editing={editingField === 'coat'}
            onStartEdit={() => setEditingField('coat')}
            onChangeText={setCoat}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Particularité"
            value={pattern}
            placeholder="(Marques visibles: ex. poitrine blanche)"
            editing={editingField === 'pattern'}
            onStartEdit={() => setEditingField('pattern')}
            onChangeText={setPattern}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Trait"
            value={tag}
            placeholder="(Un trait de caractère)"
            editing={editingField === 'tag'}
            onStartEdit={() => setEditingField('tag')}
            onChangeText={setTag}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Description"
            value={description}
            placeholder="(Décris ce que tu vois sur la photo)"
            editing={editingField === 'description'}
            multiline
            onStartEdit={() => setEditingField('description')}
            onChangeText={setDescription}
            onEndEdit={() => setEditingField(null)}
          />
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing[24],
          paddingTop: spacing[16],
          paddingBottom: footerPadBottom,
          marginBottom: keyboardHeight,
          backgroundColor: colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          gap: spacing[8] }}
      >
        <Button
          title="Ajouter à mon CatDex"
          onPress={() => {
            void handleValidate();
          }}
          disabled={submitting}
        />
        {!keyboardOpen ? (
          <Button title="Réessayer avec une autre photo" variant="secondary" onPress={onRetake} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
