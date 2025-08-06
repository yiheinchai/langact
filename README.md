# 🚀 Langact - AI-Powered Action Registry

**Langact** is a revolutionary React framework that exposes all UI actions as an API, making every button and interaction natively available to AI systems. Think of it as "UI as an API" - enabling natural language commands to control your application.

## ✨ Features

- 🤖 **AI Command Interface**: Control your app with natural language
- 📋 **Automatic Action Registry**: Every UI action is automatically discovered
- 🎯 **Type-Safe**: Full TypeScript support
- ⚡ **Modern UI**: Raycast-inspired dark theme
- 🔍 **Real-time Search**: Find and execute actions instantly

## 🎨 Live Demo

Visit the live demo: [https://yiheinchai.github.io/langact](https://yiheinchai.github.io/langact)

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/yiheinchai/langact.git
cd langact

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 💡 How It Works

1. **Action Registration**: Components use the `useAiAction` hook to register their actions
2. **Command Processing**: The CommandBar matches natural language to registered actions
3. **Execution**: Actions are executed automatically based on user commands

### Example Usage

```tsx
const MyButton = () => {
  const action = useAiAction({
    id: 'user.save',
    description: 'Save the current user profile',
    handler: () => saveUser(),
  });

  return <button {...action.props}>Save Profile</button>;
};
```

## 🎯 Try These Commands

- `"delete groceries"` - Removes the groceries task
- `"delete dog"` - Removes the walk the dog task  
- `"add"` - Adds whatever is in the input field
- `"add task"` - Same as above

## 🏗️ Framework Core

### `useAiAction` Hook
Registers UI actions in the global registry:

```tsx
const action = useAiAction({
  id: 'unique.action.id',
  description: 'What this action does',
  handler: () => { /* action logic */ },
});
```

### `LangactProvider`
Provides the action registry context to your app:

```tsx
<LangactProvider>
  <YourApp />
</LangactProvider>
```

### `CommandBar`
The AI interface that matches commands to actions:

```tsx
<CommandBar />
```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to `main` triggers a new deployment.

## 🔧 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and developer experience
- **Vite** - Lightning fast build tool
- **GitHub Pages** - Free hosting and deployment

## 📄 License

MIT License - feel free to use this in your own projects!

---

Built with ❤️ by [yiheinchai](https://github.com/yiheinchai)

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
