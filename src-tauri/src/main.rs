// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::Manager;
use tracing::info;

use multi_agent_app::{commands, database};

fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("info,multi_agent=debug")
        .init();

    info!("Starting Multi-Agent application");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            info!("Application setup started");

            // Initialize database
            let app_handle = app.handle();
            let db_path = app_handle
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir")
                .join("multi-agent.db");

            info!("Database path: {:?}", db_path);

            let db = database::Database::new(db_path)?;
            db.init()?;

            // Store database in app state (wrapped in Mutex for thread safety)
            app.manage(Arc::new(Mutex::new(db)));

            info!("Application setup completed");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::expert::get_experts,
            commands::expert::create_expert,
            commands::expert::update_expert,
            commands::expert::delete_expert,
            commands::expert::clone_expert,
            commands::expert::search_experts,
            commands::conversation::get_conversations,
            commands::conversation::create_conversation,
            commands::conversation::delete_conversation,
            commands::conversation::rename_conversation,
            commands::conversation::get_messages,
            commands::conversation::send_message,
            commands::dashboard::get_stats,
            commands::dashboard::get_activity_timeline,
            commands::llm::chat,
            commands::llm::chat_stream,
            commands::llm::get_providers,
            commands::llm::set_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
