/**
 * Tauri Service Module
 *
 * 前端与 Tauri 后端通信的服务
 */

export {
  TauriExpertService,
  TauriConversationService,
  tauriExpertService,
  tauriConversationService,
  type Expert,
  type ExpertRequest,
  type UpdateExpertRequest,
  type Conversation,
  type CreateConversationRequest,
  type Message,
  type SendMessageRequest,
} from './tauri.ipc.service';
