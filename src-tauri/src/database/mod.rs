use anyhow::Result;
use rusqlite::{Connection, OptionalExtension, Row};
use std::path::Path;
use tracing::{error, info};

use crate::models::{Expert, Conversation, Message};

/// Database manager
pub struct Database {
    conn: Connection,
}

impl Database {
    /// Create new database connection
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        info!("Database connection established");
        Ok(Self { conn })
    }

    /// Initialize database schema
    pub fn init(&self) -> Result<()> {
        self.create_experts_table()?;
        self.create_conversations_table()?;
        self.create_messages_table()?;
        self.create_stats_table()?;
        self.seed_builtin_experts()?;
        info!("Database initialized");
        Ok(())
    }

    fn create_experts_table(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS experts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role_code TEXT NOT NULL,
                role_name TEXT NOT NULL,
                role_description TEXT,
                system_prompt TEXT NOT NULL,
                avatar TEXT,
                tags TEXT,
                status TEXT NOT NULL,
                is_builtin INTEGER NOT NULL,
                temperature REAL NOT NULL,
                max_tokens INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        Ok(())
    }

    fn create_conversations_table(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                conversation_type TEXT NOT NULL,
                expert_ids TEXT NOT NULL,
                is_pinned INTEGER NOT NULL,
                unread_count INTEGER NOT NULL,
                last_read_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;
        Ok(())
    }

    fn create_messages_table(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                expert_id TEXT,
                mentions TEXT,
                input_tokens INTEGER NOT NULL,
                output_tokens INTEGER NOT NULL,
                latency_ms INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )",
            [],
        )?;
        Ok(())
    }

    fn create_stats_table(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS usage_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE NOT NULL,
                task_count INTEGER DEFAULT 0,
                message_count INTEGER DEFAULT 0,
                tokens_input INTEGER DEFAULT 0,
                tokens_output INTEGER DEFAULT 0,
                estimated_cost REAL DEFAULT 0,
                estimated_time_saved INTEGER DEFAULT 0
            )",
            [],
        )?;
        Ok(())
    }

    fn seed_builtin_experts(&self) -> Result<()> {
        let count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM experts WHERE is_builtin = 1",
            [],
            |row| row.get(0),
        )?;

        if count == 0 {
            info!("Seeding builtin experts");
            let experts = vec![
                Expert::create_builtin("架构师", crate::models::ExpertRole::architect(), "你是系统架构专家，擅长系统设计和架构评审。"),
                Expert::create_builtin("前端专家", crate::models::ExpertRole::frontend(), "你是前端开发专家，擅长 React、Vue 和 UI/UX。"),
                Expert::create_builtin("后端专家", crate::models::ExpertRole::backend(), "你是后端开发专家，擅长 API 设计和数据库。"),
                Expert::create_builtin("安全专家", crate::models::ExpertRole::security(), "你是安全专家，擅长代码安全审查。"),
                Expert::create_builtin("代码审查专家", crate::models::ExpertRole::code_reviewer(), "你是代码质量专家，擅长代码规范和最佳实践。"),
            ];

            for expert in experts {
                self.save_expert(&expert)?;
            }
        }
        Ok(())
    }

    // Expert CRUD operations
    pub fn save_expert(&self, expert: &Expert) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO experts (
                id, name, role_code, role_name, role_description,
                system_prompt, avatar, tags, status, is_builtin,
                temperature, max_tokens, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            [
                &expert.id,
                &expert.name,
                &expert.role.code,
                &expert.role.name,
                &expert.role.description,
                &expert.system_prompt,
                &expert.avatar,
                &expert.tags.join(","),
                &format!("{:?}", expert.status).to_lowercase(),
                &expert.is_builtin.to_string(),
                &expert.temperature.to_string(),
                &expert.max_tokens.to_string(),
                &expert.created_at.to_rfc3339(),
                &expert.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get_expert(&self, id: &str) -> Result<Option<Expert>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM experts WHERE id = ?1"
        )?;

        let expert = stmt.query_row([id], |row| {
            Self::row_to_expert(row)
        }).optional()?;

        Ok(expert)
    }

    pub fn get_all_experts(&self) -> Result<Vec<Expert>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM experts ORDER BY is_builtin DESC, name ASC"
        )?;

        let experts = stmt.query_map([], |row| {
            Self::row_to_expert(row)
        })?.collect::<Result<Vec<_>, _>>()?;

        Ok(experts)
    }

    pub fn search_experts(&self, keyword: &str) -> Result<Vec<Expert>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM experts WHERE name LIKE ?1 OR tags LIKE ?1 ORDER BY name"
        )?;

        let pattern = format!("%{}%", keyword);
        let experts = stmt.query_map([&pattern], |row| {
            Self::row_to_expert(row)
        })?.collect::<Result<Vec<_>, _>>()?;

        Ok(experts)
    }

    pub fn delete_expert(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM experts WHERE id = ?1", [id])?;
        Ok(())
    }

    fn row_to_expert(row: &Row) -> Result<Expert, rusqlite::Error> {
        Ok(Expert {
            id: row.get("id")?,
            name: row.get("name")?,
            role: crate::models::ExpertRole {
                code: row.get("role_code")?,
                name: row.get("role_name")?,
                description: row.get("role_description")?,
            },
            system_prompt: row.get("system_prompt")?,
            avatar: row.get("avatar")?,
            tags: row.get::<_, String>("tags")?.split(',').map(|s| s.to_string()).collect(),
            status: match row.get::<_, String>("status")?.as_str() {
                "active" => crate::models::ExpertStatus::Active,
                _ => crate::models::ExpertStatus::Inactive,
            },
            is_builtin: row.get::<_, i32>("is_builtin")? != 0,
            temperature: row.get("temperature")?,
            max_tokens: row.get("max_tokens")?,
            created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>("created_at")?)
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(
                    0, rusqlite::types::Type::Text, Box::new(e)
                ))?.with_timezone(&chrono::Utc),
            updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>("updated_at")?)
                .map_err(|e| rusqlite::Error::FromSqlConversionFailure(
                    0, rusqlite::types::Type::Text, Box::new(e)
                ))?.with_timezone(&chrono::Utc),
        })
    }
}
