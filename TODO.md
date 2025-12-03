# TODO: Disable user input while AI is responding

## Steps:
1. [ ] Add `disabled={isLoading}` prop to Input component in Chat.jsx
2. [ ] Update `handleKeyPress` to check `isLoading` before sending
3. [ ] Verify changes and test

## Notes:
- Ensure no regression in other functionalities (audio recording, regenerate, etc.)
- The `isLoading` state is already used for send button and audio handler.
