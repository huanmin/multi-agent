use serde::Serialize;

/// Dashboard stats
#[derive(Debug, Serialize)]
pub struct DashboardStats {
    pub tasks_completed: i32,
    pub time_saved: f64,
    pub avg_response_time: f64,
    pub tokens_input: i64,
    pub tokens_output: i64,
    pub total_cost: f64,
}

/// Activity data point
#[derive(Debug, Serialize)]
pub struct ActivityPoint {
    pub timestamp: String,
    pub value: i32,
}

/// Get dashboard statistics
#[tauri::command]
pub async fn get_stats() -> Result<DashboardStats, String> {
    // TODO: Query database for real stats
    Ok(DashboardStats {
        tasks_completed: 127,
        time_saved: 24.5,
        avg_response_time: 1.2,
        tokens_input: 125000,
        tokens_output: 89000,
        total_cost: 1.24,
    })
}

/// Get activity timeline
#[tauri::command]
pub async fn get_activity_timeline(
    days: i32,
) -> Result<Vec<ActivityPoint>, String> {
    // TODO: Query database for real data
    let mut points = vec![];
    for i in 0..days {
        points.push(ActivityPoint {
            timestamp: format!("2026-03-{}", i + 1),
            value: (i + 1) * 5,
        });
    }
    Ok(points)
}
