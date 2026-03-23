use serde::{Deserialize, Serialize};

/// LLM Provider info
#[derive(Debug, Clone, Serialize)]
pub struct ProviderInfo {
    pub id: String,
    pub name: String,
    pub configured: bool,
}

/// Chat request
#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub expert_id: String,
    pub message: String,
    pub conversation_id: String,
}

/// Chat response
#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub message_id: String,
    pub content: String,
}

/// Stream event
#[derive(Debug, Clone, Serialize)]
pub struct StreamEvent {
    pub event_type: String,
    pub expert_id: String,
    pub content: Option<String>,
    pub done: bool,
}

/// Get available LLM providers
#[tauri::command]
pub async fn get_providers() -> Result<Vec<ProviderInfo>, String> {
    Ok(vec![
        ProviderInfo {
            id: "anthropic".to_string(),
            name: "Anthropic Claude".to_string(),
            configured: false,
        },
        ProviderInfo {
            id: "openai".to_string(),
            name: "OpenAI".to_string(),
            configured: false,
        },
    ])
}

/// Set API key for provider
#[tauri::command]
pub async fn set_api_key(
    provider: String,
    api_key: String,
) -> Result<bool, String> {
    // TODO: Securely store API key using keyring
    tracing::info!("Setting API key for provider: {}", provider);
    Ok(true)
}

/// Send chat message (non-streaming)
#[tauri::command]
pub async fn chat(
    request: ChatRequest,
) -> Result<ChatResponse, String> {
    // TODO: Implement LLM chat
    Ok(ChatResponse {
        message_id: "temp-id".to_string(),
        content: "This is a placeholder response".to_string(),
    })
}

/// Send chat message (streaming)
#[tauri::command]
pub async fn chat_stream(
    request: ChatRequest,
) -> Result<(), String> {
    // TODO: Implement streaming chat
    Ok(())
}
