use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Expert status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ExpertStatus {
    Active,
    Inactive,
}

impl Default for ExpertStatus {
    fn default() -> Self {
        ExpertStatus::Active
    }
}

/// Expert role
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpertRole {
    pub code: String,
    pub name: String,
    pub description: String,
}

impl ExpertRole {
    pub fn new(code: &str, name: &str, description: &str) -> Self {
        Self {
            code: code.to_string(),
            name: name.to_string(),
            description: description.to_string(),
        }
    }

    pub fn architect() -> Self {
        Self::new("ARCHITECT", "架构师", "负责系统架构设计")
    }

    pub fn frontend() -> Self {
        Self::new("FRONTEND", "前端专家", "负责前端开发")
    }

    pub fn backend() -> Self {
        Self::new("BACKEND", "后端专家", "负责后端开发")
    }

    pub fn security() -> Self {
        Self::new("SECURITY", "安全专家", "负责安全审查")
    }

    pub fn code_reviewer() -> Self {
        Self::new("CODE_REVIEWER", "代码审查专家", "负责代码质量")
    }

    pub fn qa() -> Self {
        Self::new("QA", "测试专家", "负责质量保证")
    }

    pub fn custom() -> Self {
        Self::new("CUSTOM", "自定义专家", "用户自定义专家")
    }
}

/// Expert entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Expert {
    pub id: String,
    pub name: String,
    pub role: ExpertRole,
    pub system_prompt: String,
    pub avatar: String,
    pub tags: Vec<String>,
    pub status: ExpertStatus,
    pub is_builtin: bool,
    pub temperature: f32,
    pub max_tokens: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Expert {
    pub fn create(
        name: &str,
        role: ExpertRole,
        system_prompt: &str,
        tags: Vec<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            role,
            system_prompt: system_prompt.to_string(),
            avatar: "default.png".to_string(),
            tags,
            status: ExpertStatus::Active,
            is_builtin: false,
            temperature: 0.7,
            max_tokens: 4096,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn create_builtin(name: &str, role: ExpertRole, system_prompt: &str) -> Self {
        let mut expert = Self::create(name, role, system_prompt, vec![]);
        expert.is_builtin = true;
        expert
    }

    pub fn update_prompt(&mut self, prompt: &str) {
        self.system_prompt = prompt.to_string();
        self.updated_at = Utc::now();
    }

    pub fn update_name(&mut self, name: &str) {
        self.name = name.to_string();
        self.updated_at = Utc::now();
    }

    pub fn clone_expert(&self) -> Self {
        let mut cloned = Self::create(
            &format!("{} 副本", self.name),
            self.role.clone(),
            &self.system_prompt,
            self.tags.clone(),
        );
        cloned.avatar = self.avatar.clone();
        cloned.temperature = self.temperature;
        cloned.max_tokens = self.max_tokens;
        cloned
    }

    pub fn add_tag(&mut self, tag: &str) {
        if !self.tags.contains(&tag.to_string()) {
            self.tags.push(tag.to_string());
            self.updated_at = Utc::now();
        }
    }

    pub fn remove_tag(&mut self, tag: &str) {
        self.tags.retain(|t| t != tag);
        self.updated_at = Utc::now();
    }

    pub fn deactivate(&mut self) {
        self.status = ExpertStatus::Inactive;
        self.updated_at = Utc::now();
    }

    pub fn activate(&mut self) {
        self.status = ExpertStatus::Active;
        self.updated_at = Utc::now();
    }

    pub fn is_active(&self) -> bool {
        self.status == ExpertStatus::Active
    }
}

/// Create expert request
#[derive(Debug, Deserialize)]
pub struct CreateExpertRequest {
    pub name: String,
    pub role_code: String,
    pub system_prompt: String,
    pub avatar: Option<String>,
    pub tags: Option<Vec<String>>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<i32>,
}

/// Update expert request
#[derive(Debug, Deserialize)]
pub struct UpdateExpertRequest {
    pub name: Option<String>,
    pub system_prompt: Option<String>,
    pub tags: Option<Vec<String>>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<i32>,
}
