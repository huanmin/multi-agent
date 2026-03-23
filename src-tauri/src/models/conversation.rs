use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Conversation type
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ConversationType {
    Single,
    Group,
}

/// Message role
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    User,
    Assistant,
    System,
}

/// Message entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub conversation_id: String,
    pub role: MessageRole,
    pub content: String,
    pub expert_id: Option<String>,
    pub mentions: Vec<String>,
    pub input_tokens: i32,
    pub output_tokens: i32,
    pub latency_ms: i32,
    pub created_at: DateTime<Utc>,
}

impl Message {
    pub fn new(
        conversation_id: &str,
        role: MessageRole,
        content: &str,
        expert_id: Option<&str>,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            conversation_id: conversation_id.to_string(),
            role,
            content: content.to_string(),
            expert_id: expert_id.map(|s| s.to_string()),
            mentions: vec![],
            input_tokens: 0,
            output_tokens: 0,
            latency_ms: 0,
            created_at: Utc::now(),
        }
    }

    pub fn user_message(conversation_id: &str, content: &str) -> Self {
        Self::new(conversation_id, MessageRole::User, content, None)
    }

    pub fn expert_response(conversation_id: &str, expert_id: &str, content: &str) -> Self {
        Self::new(conversation_id, MessageRole::Assistant, content, Some(expert_id))
    }

    pub fn append_content(&mut self, delta: &str) {
        self.content.push_str(delta);
    }

    pub fn add_mention(&mut self, expert_id: &str) {
        if !self.mentions.contains(&expert_id.to_string()) {
            self.mentions.push(expert_id.to_string());
        }
    }

    pub fn set_tokens(&mut self, input: i32, output: i32) {
        self.input_tokens = input;
        self.output_tokens = output;
    }
}

/// Conversation entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub name: String,
    pub conversation_type: ConversationType,
    pub expert_ids: Vec<String>,
    pub is_pinned: bool,
    pub unread_count: i32,
    pub last_read_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Conversation {
    pub fn new(name: &str, conversation_type: ConversationType, expert_ids: Vec<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            conversation_type,
            expert_ids,
            is_pinned: false,
            unread_count: 0,
            last_read_at: now,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn single_chat(expert_id: &str, expert_name: &str) -> Self {
        Self::new(
            &format!("与 {} 的对话", expert_name),
            ConversationType::Single,
            vec![expert_id.to_string()],
        )
    }

    pub fn group_chat(name: &str, expert_ids: Vec<String>) -> Self {
        Self::new(name, ConversationType::Group, expert_ids)
    }

    pub fn rename(&mut self, name: &str) {
        self.name = name.to_string();
        self.updated_at = Utc::now();
    }

    pub fn pin(&mut self) {
        self.is_pinned = true;
        self.updated_at = Utc::now();
    }

    pub fn unpin(&mut self) {
        self.is_pinned = false;
        self.updated_at = Utc::now();
    }

    pub fn mark_as_read(&mut self) {
        self.unread_count = 0;
        self.last_read_at = Utc::now();
    }

    pub fn increment_unread(&mut self) {
        self.unread_count += 1;
    }
}

/// Create conversation request
#[derive(Debug, Deserialize)]
pub struct CreateConversationRequest {
    pub name: Option<String>,
    pub conversation_type: ConversationType,
    pub expert_ids: Vec<String>,
}

/// Send message request
#[derive(Debug, Deserialize)]
pub struct SendMessageRequest {
    pub content: String,
    pub mentions: Option<Vec<String>>,
}
