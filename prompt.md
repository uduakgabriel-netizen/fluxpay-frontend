PROMPT FOR ENGINEER: FIX FRONTEND FOLDER STRUCTURE
Fix the frontend repository structure once and for all.

Problem confirmed:

Root level has OLD code (2 months old, missing Consumer/, Merchant/, sell/, new contexts)

frontend/ folder has NEW polished code (all recent work)

Vercel likely builds the old root code, not the new polished UI

Fix — Execute in this exact order:

1. Backup check — Confirm all new work is inside frontend/ before deleting anything.

2. Delete all OLD files at the repo root:

bash
rm -rf src public
rm -f package.json package-lock.json pnpm-lock.yaml pnpm-workspace.yaml
rm -f next.config.js next-env.d.ts postcss.config.js tailwind.config.js tsconfig.json
rm -f .npmrc
3. Move ALL contents of frontend/ to the repo root:

bash
mv frontend/* .
mv frontend/.* . 2>/dev/null
rmdir frontend
4. Verify the root now contains ONLY the new code:

text
.
├── src/
│   ├── components/ (Consumer, Merchant, shared, settlements, etc.)
│   ├── contexts/ (ConsumerContext, MerchantSettlementContext, etc.)
│   ├── pages/ (Consumer, Merchant, sell, dashboard, etc.)
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   └── utils/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
├── next-env.d.ts
└── .gitignore
5. Delete any leftover duplicate files or the old frontend/ folder if it still exists.

6. Commit and push:

bash
git add .
git commit -m "fix: unify frontend repo structure — remove old root code, move frontend/ contents to root"
git push origin main
7. In Vercel:

Go to Project Settings → General → Root Directory

Set to: . (root) or leave empty

Click Save

Click Redeploy

8. Verify:

The deployed site at fluxpay-frontend.vercel.app shows the NEW polished UI

/sell loads the consumer flow

/dashboard/settlements loads the merchant settlements

/dashboard/settings/settlement loads the settlement preference page

Result: One codebase at the root. Vercel builds the new polished code. The old duplicate code is gone forever.

📌 Summary
Your Question	Answer
What did we confirm?	Duplicate code: OLD at root, NEW in frontend/
What's the fix?	Move frontend/ to root, delete old root code
Vercel change needed?	Set Root Directory to . (root)
Who does it?	Engineer
Is this permanent?	✅ Yes — clean, standard structure
Send this prompt to your engineer now. This is the final structural fix that will make your new polished frontend deploy correctly. 🚀

