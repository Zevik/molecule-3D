# Molecule Studio

אפליקציה לויזואליזציה תלת-ממדית של מולקולות כימיות עם תמיכה דו-לשונית (עברית/אנגלית).

## תכונות

- **קלט דו-לשוני**: מקבל שמות מולקולות בעברית ואנגלית
- **אינטגרציה עם PubChem**: משיג נתוני מולקולות מבסיס הנתונים הכימי של NCBI
- **רינדור 3D**: ייצוג תלת-ממדי עם Three.js
- **צביעת CPK**: כל יסוד בצבע הסטנדרטי שלו
- **בקרות אינטראקטיביות**: גרירה לסיבוב, גלילה לזום
- **תרגום אוטומטי**: משתמש ב-Google Translate API עבור קלט עברי
- **מצב Debug**: אפשרות להכניס JSON גולמי של מבנים מולקולריים

## התקנה והרצה מקומית

```bash
# התקנת תלותות
npm install

# הרצה מקומית
npm run dev

# בנייה לפריסה
npm run build
```

## פריסה בנטליפיי

1. **דרך Netlify CLI:**
```bash
# התקנת netlify cli
npm install -g netlify-cli

# התחברות לנטליפיי
netlify login

# פריסה
netlify deploy --prod --dir=dist
```

2. **דרך הממשק של נטליפיי:**
   - כנס ל-[netlify.com](https://netlify.com)
   - גרור את תיקיית `dist` למקום הפריסה
   - או חבר את הרפו מ-GitHub

3. **הגדרות נטליפיי (אוטומטי):**
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Node Version:** 18 (מוגדר ב-`netlify.toml`)

## קבצי קונפיגורציה

- `netlify.toml` - הגדרות פריסה לנטליפיי
- `vite.config.ts` - קונפיגורציית Vite
- `tailwind.config.js` - הגדרות Tailwind CSS
- `tsconfig.json` - הגדרות TypeScript

## מולקולות לדוגמה

- מים / water
- קפאין / caffeine
- גלוקוז / glucose
- מתאן / methane
- אמוניה / ammonia 