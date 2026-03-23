use tauri::State;
use std::sync::{Arc, Mutex};
use crate::database::Database;
use crate::models::{Expert, ExpertRole, CreateExpertRequest, UpdateExpertRequest};

/// Get all experts
#[tauri::command]
pub async fn get_experts(
    db: State<'_, Arc<Mutex<Database>>>,
) -> Result<Vec<Expert>, String> {
    let db = db.lock().map_err(|e| format!("Lock error: {}", e))?;
    db.get_all_experts()
        .map_err(|e| format!("Failed to get experts: {}", e))
}

/// Create new expert
#[tauri::command]
pub async fn create_expert(
    db: State<'_, Arc<Mutex<Database>>>,
    request: CreateExpertRequest,
) -> Result<Expert, String> {
    let role = match request.role_code.as_str() {
        "ARCHITECT" => ExpertRole::architect(),
        "FRONTEND" => ExpertRole::frontend(),
        "BACKEND" => ExpertRole::backend(),
        "SECURITY" => ExpertRole::security(),
        "CODE_REVIEWER" => ExpertRole::code_reviewer(),
        "QA" => ExpertRole::qa(),
        _ => ExpertRole::custom(),
    };

    let mut expert = Expert::create(
        &request.name,
        role,
        &request.system_prompt,
        request.tags.unwrap_or_default(),
    );

    if let Some(avatar) = request.avatar {
        expert.avatar = avatar;
    }
    if let Some(temp) = request.temperature {
        expert.temperature = temp;
    }
    if let Some(max_tokens) = request.max_tokens {
        expert.max_tokens = max_tokens;
    }

    let db = db.lock().map_err(|e| format!("Lock error: {}", e))?;
    db.save_expert(&expert)
        .map_err(|e| format!("Failed to save expert: {}", e))?;

    Ok(expert)
}

/// Update expert
#[tauri::command]
pub async fn update_expert(
    db: State<'_, Arc<Mutex<Database>>>,
    id: String,
    request: UpdateExpertRequest,
) -> Result<Expert, String> {
    let db = db.lock().map_err(|e| format!("Lock error: {}", e))?;

    let mut expert = db.get_expert(&id)
        .map_err(|e| format!("Database error: {}", e))?
        .ok_or_else(|| "Expert not found".to_string())?;

    if let Some(name) = request.name {
        expert.update_name(&name);
    }
    if let Some(prompt) = request.system_prompt {
        expert.update_prompt(&prompt);
    }
    if let Some(tags) = request.tags {
        expert.tags = tags;
    }
    if let Some(temp) = request.temperature {
        expert.temperature = temp;
    }
    if let Some(max_tokens) = request.max_tokens {
        expert.max_tokens = max_tokens;
    }

    db.save_expert(&expert)
        .map_err(|e| format!("Failed to update expert: {}", e))?;

    Ok(expert)
}

/// Delete expert
#[tauri::command]
pub async fn delete_expert(
    db: State<'_, Arc<Mutex<Database>>>,
    id: String,
) -> Result<(), String> {
    let db = db.lock().map_err(|e| format!("Lock error: {}", e))?;
    db.delete_expert(&id)
        .map_err(|e| format!("Failed to delete expert: {}", e))
}

/// Clone expert
#[tauri::command]
pub async fn clone_expert(
    db: State<'_, Arc<Mutex<Database>>>,
    id: String,
) -> Result<Expert, String> {
    let db = db.lock().map_err(|e| format!("Lock error: {}", e))?;

    let expert = db.get_expert(&id)
        .map_err(|e| format!("Database error: {}", e))?
        .ok_or_else(|| "Expert not found".to_string())?;

    let cloned = expert.clone_expert();
    db.save_expert(&cloned)
        .map_err(|e| format!("Failed to save cloned expert: {}", e))?;

    Ok(cloned)
}

/// Search experts
#[tauri::command]
pub async fn search_experts(
    db: State<'_, Arc<Mutex<Database>>>,
    keyword: String,
) -> Result<Vec<Expert>, String> {
    let db = db.lock().map_err(|e| format!("Lock error: {}", e))?;
    db.search_experts(&keyword)
        .map_err(|e| format!("Failed to search experts: {}", e))
}
