# TODO: Fix Chat Functionality for Existing Chats

## Tasks
- [x] Modify `handleSendMessage` in `src/pages/Chat.jsx` to include `chat_id` in the API request body when `selectedChatId` is set.
- [x] After a successful API response, if `selectedChatId` is null (new chat), update `selectedChatId` to the returned `chat_id` from the response.
- [x] Fix AI message text alignment and spacing by adding sender name and improving CSS styling.
- [x] Increase avatar size to 50px for better visibility.
- [x] Add message actions (Copy and Regenerate buttons) that appear on hover.
- [ ] Test the chat functionality to ensure messages append to existing chats and new chats are properly selected.

## Notes
- Voice messages are not handled in this fix as the backend code provided doesn't support `chat_id` for voice-to-voice API.
- Ensure the sidebar chat selection and history loading work correctly.
