export default {
  // Base rules from Conventional Commits
  extends: ["@commitlint/config-conventional"],

  // Custom rules for Jira + Conventional Commit format
  rules: {
    // Limit header length to 75 characters
    "header-max-length": [2, "always", 75],

    // Custom rule : pattern Jira [KAN-XXX]
    "jira-pattern": [2, "always"],

    // Only allow specific commit types
    "type-enum": [2, "always", ["FEAT", "FIX", "REFACTOR", "TEST", "BUILD", "DOCS"]],
    "type-case": [2, "always", "upper-case"],

    "subject-case": [0],
    // Disallow empty subjects
    "subject-empty": [2, "never"],

    // No final dot at the end of the subject
    "subject-full-stop": [2, "never", "."],

    // Disallow commits containing "WIP"
    "no-wip": [2, "always"],

    "body-leading-blank": [2, "always"], // inserts a blank line after the header
    "body-empty": [0], // allows a commit without a body
    "body-max-line-length": [1, "always", 120], // warning if a line is too long
  },

  // Custom plugin to block "WIP" commits
  plugins: [
    {
      rules: {
        "no-wip": ({ raw }) => {
          return [
            !raw.toUpperCase().includes("WIP"),
            '❌ Commits containing "WIP" are not allowed.',
          ];
        },

        // Verify Jira pattern
        "jira-pattern": ({ raw }) => {
          const pattern = /^\[(KAN-\d+)\]\s(FEAT|FIX|REFACTOR|TEST|BUILD|DOCS)(!?):\s(.+)/;

          const match = raw.match(pattern);
          if (!match) {
            return [
              false,
              `
❌ Invalid format for commit message!
🧩 Expected format: [KAN-123] FEAT: short description
                `,
            ];
          }

          return [
            true,
            `
✅ Valid format for commit message!
                `,
          ];
        },
      },
    },
  ],

  // Parser configuration for matching groups in your pattern
  // Commit message must follow: [KAN-123] FEAT: description
  // This pattern checks for:
  // - [KAN-<number>] at the beginning (Jira ticket)
  // - A valid type (FEAT, FIX, REFACTOR, TEST, BUILD, DOCS)
  // - A ! after the type, if it's a BREAKING CHANGE
  // - A colon and a short description after a space
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(KAN-\d+)\]\s(FEAT|FIX|REFACTOR|TEST|BUILD|DOCS)(!?):\s(.+)/,
      headerCorrespondence: ["ticket", "type", "breaking", "subject"],
    },
  },
};
