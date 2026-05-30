import next from "eslint-config-next";

const eslintConfig = [
  // Global ignores (must be its own object with only `ignores`)
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "**/*.bak.tsx",
      "convex/_generated/**",
    ],
  },
  ...next,
  {
    rules: {
      // react-hooks v7 flags any synchronous setState in an effect. We use it
      // for two legitimate, idiomatic patterns: the SSR "mounted" hydration
      // guard and a prefers-reduced-motion early return. Keep it visible as a
      // warning rather than a hard error so CI isn't blocked by accepted code.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
