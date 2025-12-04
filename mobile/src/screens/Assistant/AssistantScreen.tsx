import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const AssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your ATM Operations AI Assistant. I can help you with:\n\n• Predictive maintenance alerts\n• Performance analytics\n• Engineer dispatch optimization\n• Parts inventory forecasting\n• Operational insights\n\nWhat would you like to know?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActions = [
    { icon: 'alert-circle', text: 'Critical Alerts', color: '#FF3B30' },
    { icon: 'chart-line', text: 'Performance', color: '#007AFF' },
    { icon: 'wrench-clock', text: 'Maintenance', color: '#FF9500' },
    { icon: 'truck-fast', text: 'Dispatch', color: '#34C759' },
  ];

  const suggestedQueries = [
    "Which ATMs need preventive maintenance?",
    "Show me low cash ATMs",
    "Engineer availability in Lagos",
    "Parts reorder recommendations",
  ];

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      let responseText = '';
      
      if (inputText.toLowerCase().includes('maintenance') || inputText.toLowerCase().includes('preventive')) {
        responseText = "📊 Preventive Maintenance Analysis:\n\n" +
                      "Based on usage patterns and uptime data, these ATMs require attention:\n\n" +
                      "🔴 High Priority:\n" +
                      "• ATM-003 (Abuja) - 85 days since last service\n" +
                      "• ATM-008 (Kaduna) - Card reader showing errors\n\n" +
                      "🟡 Medium Priority:\n" +
                      "• ATM-006 (Lekki) - Due for quarterly check\n" +
                      "• ATM-001 (VI Mall) - Cash dispenser needs calibration\n\n" +
                      "Would you like me to create dispatch tickets?";
      } else if (inputText.toLowerCase().includes('cash') || inputText.toLowerCase().includes('low')) {
        responseText = "💰 Cash Level Alert:\n\n" +
                      "3 ATMs currently below 25% threshold:\n\n" +
                      "🔴 ATM-003 (Abuja City) - 18% remaining\n" +
                      "🟡 ATM-008 (Kaduna Mall) - 15% remaining\n" +
                      "🟡 ATM-002 (Airport) - 42% remaining\n\n" +
                      "Recommendation: Schedule cash replenishment within 24 hours.\n\n" +
                      "Shall I notify the cash logistics team?";
      } else if (inputText.toLowerCase().includes('engineer') || inputText.toLowerCase().includes('dispatch')) {
        responseText = "👷 Engineer Availability:\n\n" +
                      "Lagos Zone (3 available):\n" +
                      "• Chidi Okonkwo - Available now\n" +
                      "• Oluwaseun Adeyemi - Available now\n" +
                      "• Ngozi Eze - Off duty (returns 6 PM)\n\n" +
                      "Abuja Zone (1 available):\n" +
                      "• Yusuf Abdullahi - Available now\n\n" +
                      "Recommend dispatching Chidi to ATM-003 (closest, 15 min ETA).";
      } else if (inputText.toLowerCase().includes('parts') || inputText.toLowerCase().includes('inventory')) {
        responseText = "📦 Inventory Analysis:\n\n" +
                      "Reorder Recommendations:\n\n" +
                      "🔴 Urgent:\n" +
                      "• UPS Battery Pack - Out of stock\n" +
                      "• Thermal Printers - 3 units (below safety stock)\n\n" +
                      "🟡 Soon:\n" +
                      "• Card Readers - 8 units (approaching reorder point)\n" +
                      "• Power Supply 350W - 7 units\n\n" +
                      "Estimated order value: ₦385,000\n" +
                      "Suggested supplier: TechParts Ltd (best rates)\n\n" +
                      "Generate purchase order?";
      } else {
        responseText = "I understand you're asking about ATM operations. Let me help you with that.\n\n" +
                      "Could you please specify:\n" +
                      "• Which ATM location or zone?\n" +
                      "• What specific metric (uptime, cash, maintenance)?\n" +
                      "• Time period for analysis?\n\n" +
                      "Or try one of the suggested queries below!";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="robot" size={28} color="#4A90E2" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionButton}>
                <Icon name={action.icon} size={24} color={action.color} />
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Messages */}
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.sender === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
            ]}
          >
            {message.sender === 'assistant' && (
              <View style={styles.assistantAvatar}>
                <Icon name="robot" size={20} color="#4A90E2" />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {message.sender === 'user' && (
              <View style={styles.userAvatar}>
                <Icon name="account" size={20} color="#FFFFFF" />
              </View>
            )}
          </View>
        ))}

        {/* Suggested Queries */}
        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Try asking:</Text>
            {suggestedQueries.map((query, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => setInputText(query)}
              >
                <Icon name="lightbulb-outline" size={16} color="#4A90E2" />
                <Text style={styles.suggestionText}>{query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about ATM operations..."
            placeholderTextColor="#8E8E93"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1C1C1E',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: '22%',
    flex: 1,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionChip: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2C2C2E',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
});

export default AssistantScreen;
