import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/**
 * Configuration ESLint.
 *
 * Reprend les règles recommandées de Next.js (règles des hooks React,
 * accessibilité JSX, bonnes pratiques du cadre applicatif) et interdit
 * explicitement le type `any`, qui ferait perdre l'intérêt du typage strict.
 */
export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "public/**",
      "prisma/dev.db*",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Les apostrophes sont omniprésentes en français et parfaitement valides
      // dans du texte JSX : la règle ne produirait que du bruit.
      "react/no-unescaped-entities": "off",
      // La configuration ESLint elle-même s'exporte anonymement par convention.
      "import/no-anonymous-default-export": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
