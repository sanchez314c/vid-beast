// ESLint v9 flat config — VidBeast (Electron, vanilla JS, no TS at runtime)
// Lints: src/main.js (main process, Node + Electron globals)
//        src/renderer/{preload,renderer}.js (mixed: Node via nodeIntegration:true + browser)
// Skips: src/sources/ (vendored C# project), node_modules/, archive/, legacy/, dist/

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "archive/**",
      "legacy/**",
      "dist/**",
      "build/**",
      "build-temp/**",
      "src/sources/**",
      "**/*.backup.*",
    ],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Node.js globals
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        global: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        // Browser globals (renderer process — nodeIntegration:true gives Node too)
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        FormData: "readonly",
        // Custom global from preload
        electronAPI: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-redeclare": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "warn",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-constant-condition": ["warn", { checkLoops: false }],
    },
  },
];
