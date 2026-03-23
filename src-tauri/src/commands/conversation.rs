use tauri::State;
use std::sync::{Arc, Mutex};
use crate::database::Database;
use crate::models::{Conversation, ConversationType, Message, CreateConversationRequest, SendMessageRequest};

/// Get all conversations
#[tauri::command]
pub async fn get_conversations(
    _db: State<'_, Arc<Mutex<Database>>>,
) -> Result<Vec<Conversation>, String> {
    // TODO: Implement conversation queries
    Ok(vec![])
}

/// Create new conversation
#[tauri::command]
pub async fn create_conversation(
    _db: State<'_, Arc<Mutex<Database>>>,
    request: CreateConversationRequest,
) -> Result<Conversation, String> {
    let name = request.name.unwrap_or_else(|| {
        if request.expert_ids.len() == 1 {
            "新对话".to_string()
        } else {
            "群聊".to_string()
        }
    });

    let conversation = Conversation::new(&name, request.conversation_type, request.expert_ids);
    // TODO: Save to database

    Ok(conversation)
}

/// Delete conversation
#[tauri::command]
pub async fn delete_conversation(
    _db: State<'_, Arc<Mutex<Database>>>,
    _id: String,
) -> Result<(), String> {
    // TODO: Implement delete
    Ok(())
}

/// Rename conversation
#[tauri::command]
pub async fn rename_conversation(
    _db: State<'_, Arc<Mutex<Database>>>,
    _id: String,
    _name: String,
) -> Result<Conversation, String> {
    // TODO: Implement rename
    Err("Not implemented".to_string())
}

/// Get messages for conversation
#[tauri::command]
pub async fn get_messages(
    _db: State<'_, Arc<Mutex<Database>>>,
    _conversation_id: String,
) -> Result<Vec<Message>, String> {
    // TODO: Implement message queries
    Ok(vec![])
}

/// Send message
#[tauri::command]
pub async fn send_message(
    _db: State<'_, Arc<Mutex<Database>>>,
    conversation_id: String,
    request: SendMessageRequest,
) -> Result<Message, String> {
    let message = Message::user_message(&conversation_id, &request.content);
    // TODO: Save to database and trigger LLM
    Ok(message)
}
