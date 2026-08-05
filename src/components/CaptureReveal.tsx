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
import Svg, { Path } from 'react-native-svg';

import { AuthBackButton } from '@/components/Auth/AuthChrome';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formatDexNumber } from '@/lib/constants';
import {
  catDexRarityLabel,
  resolveRevealRarity,
  rarityTokens,
  themeFromColorLabel,
  themeSoft,
} from '@/lib/catTheme';
import { enrichAnalysis, genderSymbol } from '@/lib/catTraits';
import { suggestNameForAppearance } from '@/lib/mockAnalysis';
import { useTheme } from '@/theme/ThemeProvider';
import type { CatAnalysis } from '@/types/cat';

export type CaptureRevealResult = {
  name: string;
  analysis: CatAnalysis;
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
  | 'size'
  | 'tag'
  | 'description';

function EditIcon({ color }: { color: string }) {
  const { iconStroke } = useTheme();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 7.5 16.5 11.5"
        stroke={color}
        strokeWidth={iconStroke.regular}
        strokeLinecap="round"
      />
    </Svg>
  );
}

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
    <View style={{ gap: spacing[8] }}>
      <Text variant="label" color="textSecondary">
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
            justifyContent: multiline ? 'flex-start' : 'center',
          }}
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
              lineHeight: typography.body.lineHeight,
            }}
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Modifier ${label}`}
          onPress={onStartEdit}
          style={({ pressed }) => ({
            minHeight: multiline ? spacing[80] : spacing[48],
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            gap: spacing[16],
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
            style={{ flex: 1, fontFamily: fonts.body }}
            numberOfLines={multiline ? 4 : 1}
          >
            {value.trim() || placeholder}
          </Text>
          <View
            style={{
              width: spacing[32],
              height: spacing[32],
              borderRadius: radius.full,
              backgroundColor: colors.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: multiline ? 0 : undefined,
            }}
          >
            <EditIcon color={colors.brand} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Post-capture reveal — AI proposal shown as rows with edit icons.
 * Tap the pencil to open the keyboard and correct a field.
 */
export function CaptureReveal({
  name: initialName,
  number,
  photoUri,
  analysis: rawAnalysis,
  onAdd,
  onRetake,
}: Props) {
  const { colors, fonts, spacing, radius, scheme, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const seeded = useMemo(() => enrichAnalysis(rawAnalysis, number), [rawAnalysis, number]);
  const aiName = (seeded.suggestedName || initialName).trim();

  const [name, setName] = useState(aiName || initialName);
  const [nameTouched, setNameTouched] = useState(false);
  const [tag, setTag] = useState(seeded.tags?.[0] ?? '');
  const [coat, setCoat] = useState(seeded.coat || '');
  const [breed, setBreed] = useState(
    seeded.breed && seeded.breed !== 'Indéterminée' ? seeded.breed : '',
  );
  const [color, setColor] = useState(seeded.color || '');
  const [size, setSize] = useState(seeded.size || '');
  const [description, setDescription] = useState(seeded.description || '');
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const theme = themeFromColorLabel(color || seeded.color, number);
  const soft = themeSoft(theme, scheme);
  const dexLabel = formatDexNumber(number);
  const rarityId = resolveRevealRarity({ ...seeded, color, breed, coat }, number);
  const rarity = rarityTokens[rarityId];
  const symbol = genderSymbol(seeded.gender);
  const keyboardOpen = keyboardHeight > 0;
  const footerPadBottom = keyboardOpen
    ? spacing[16]
    : Math.max(insets.bottom, spacing[16]);

  const handleColorChange = (nextColor: string) => {
    setColor(nextColor);
    if (!nameTouched) {
      setName(suggestNameForAppearance(nextColor, breed, `${number}:${nextColor}`));
    }
  };

  const handleNameChange = (next: string) => {
    setNameTouched(true);
    setName(next);
  };

  const buildResult = (): CaptureRevealResult => {
    const trimmedName =
      name.trim() ||
      suggestNameForAppearance(color || seeded.color, breed, String(number));
    const nextTags = [tag.trim(), ...(seeded.tags ?? []).slice(1)].filter(Boolean);
    const nextColor = color.trim() || seeded.color;
    const nextBreed = breed.trim() || seeded.breed;
    const nextCoat = coat.trim() || seeded.coat;
    return {
      name: trimmedName,
      analysis: {
        ...seeded,
        color: nextColor,
        breed: nextBreed,
        coat: nextCoat,
        size: size.trim() || seeded.size,
        description:
          description.trim() ||
          seeded.description ||
          `Un chat ${nextColor.toLowerCase()} prêt à rejoindre ton CatDex.`,
        suggestedName: trimmedName,
        tags: nextTags.length > 0 ? nextTags : seeded.tags,
      },
    };
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
          backgroundColor: colors.background,
        }}
      >
        <AuthBackButton onPress={onRetake} />
        <Text variant="bodySmall" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
          CatDex
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
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text variant="h1" color="text" style={{ fontFamily: fonts.display }}>
          {dexLabel}
        </Text>

        <View
          style={[
            {
              width: '100%',
              aspectRatio: 1,
              borderRadius: radius[8],
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: soft,
              overflow: 'hidden',
            },
            shadow.low,
          ]}
        >
          <Image
            source={{ uri: photoUri }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel={`Photo de ${name || initialName}`}
          />
        </View>

        <View style={{ gap: spacing[8], width: '100%' }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: spacing[8],
            }}
          >
            <Badge
              label="Nouveau"
              color={colors.textBrand}
              backgroundColor={colors.brandSoft}
            />
            <Badge
              label={catDexRarityLabel(rarityId).toUpperCase()}
              color={rarity.foreground}
              backgroundColor={rarity.background}
            />
            {symbol ? (
              <Text variant="body" color="textBrand" style={{ fontFamily: fonts.bodySemi }}>
                {symbol}
              </Text>
            ) : null}
          </View>

          <Text variant="bodySmall" color="textSecondary">
            Proposition de l’IA — appuie sur l’icône pour corriger un champ.
          </Text>
        </View>

        <View style={{ width: '100%', gap: spacing[16] }}>
          <EditableRow
            label="Nom"
            value={name}
            placeholder="Ex. Caramel"
            editing={editingField === 'name'}
            autoCapitalize="words"
            onStartEdit={() => setEditingField('name')}
            onChangeText={handleNameChange}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Couleur"
            value={color}
            placeholder="Ex. Roux"
            editing={editingField === 'color'}
            onStartEdit={() => setEditingField('color')}
            onChangeText={handleColorChange}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Race"
            value={breed}
            placeholder="Ex. Européen"
            editing={editingField === 'breed'}
            onStartEdit={() => setEditingField('breed')}
            onChangeText={setBreed}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Pelage"
            value={coat}
            placeholder="Ex. Court"
            editing={editingField === 'coat'}
            onStartEdit={() => setEditingField('coat')}
            onChangeText={setCoat}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Taille"
            value={size}
            placeholder="Ex. Moyenne"
            editing={editingField === 'size'}
            onStartEdit={() => setEditingField('size')}
            onChangeText={setSize}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Trait"
            value={tag}
            placeholder="Ex. Curieux"
            editing={editingField === 'tag'}
            onStartEdit={() => setEditingField('tag')}
            onChangeText={setTag}
            onEndEdit={() => setEditingField(null)}
          />
          <EditableRow
            label="Description"
            value={description}
            placeholder="Décris ce chat…"
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
          gap: spacing[8],
        }}
      >
        <Button title="Valider et ajouter" onPress={() => onAdd(buildResult())} />
        {!keyboardOpen ? (
          <Button title="Reprendre la photo" variant="secondary" onPress={onRetake} />
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
