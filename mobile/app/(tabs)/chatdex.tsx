import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Cat3DAvatar } from '../../components/Cat3DAvatar';
import { api } from '../../services/api';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import type { Cat, CatModelId } from '@catdex/shared';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  modelId?: CatModelId;
  catId?: string;
}

export default function ChatDexScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', type: 'bot', text: 'Hey explorer! 🐾 Ask me about your cat collection or tap a cat below to view their profile.' },
  ]);
  const [input, setInput] = useState('');
  const [recentCats, setRecentCats] = useState<Cat[]>([]);

  useEffect(() => {
    api.getChatDex().then((data) => {
      setRecentCats(data.recentCats ?? []);
      if (data.recentCats?.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'welcome-cats',
            type: 'bot',
            text: `You've encountered ${data.totalSeen} cats! Here are your recent sightings:`,
          },
        ]);
      }
    }).catch(console.warn);
  }, []);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), type: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const lower = input.toLowerCase();
    let reply = "I'm ChatDex, your feline guide! Try asking about your collection, badges, or missions.";

    if (lower.includes('how many') || lower.includes('collection')) {
      reply = `You've spotted ${recentCats.length} cats recently. Keep exploring to grow your CatDex!`;
    } else if (lower.includes('badge')) {
      reply = 'Earn badges by exploring, photographing, and collecting cats. Check your Profile for progress!';
    } else if (lower.includes('mission')) {
      reply = 'Complete daily and weekly missions for bonus XP. Head to the Missions tab!';
    } else if (lower.includes('rare') || lower.includes('popular')) {
      reply = 'Popular cats have a golden aura on the map. They\'ve been observed by many explorers!';
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: reply }]);
    }, 500);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.type === 'user' ? styles.userBubble : styles.botBubble]}>
            {item.modelId && <Cat3DAvatar modelId={item.modelId} size={60} />}
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        ListFooterComponent={
          recentCats.length > 0 ? (
            <View style={styles.catRow}>
              {recentCats.slice(0, 6).map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.catChip} onPress={() => router.push(`/cat/${cat.id}`)}>
                  <Cat3DAvatar modelId={cat.modelId} size={48} autoRotate={false} />
                  <Text style={styles.catChipName} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask ChatDex..."
          placeholderTextColor={Colors.textSecondary}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messageList: { padding: Spacing.md, paddingBottom: Spacing.lg },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: Spacing.md, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  botBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surface },
  bubbleText: { color: Colors.text, fontSize: FontSize.md, lineHeight: 22 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  catChip: { alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.sm, width: 72 },
  catChipName: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  sendText: { color: Colors.text, fontWeight: '700' },
});
