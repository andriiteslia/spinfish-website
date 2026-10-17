# spinfish.app — сайт гри SPIN FISH

Окремо від гри (гра — репо `andriiteslia/spinfish-app`, spinfish.netlify.app).

- Сторінки: `site-src/pages/<сторінка>.<uk|en>.html` (лише вміст), стилі — `site-src/site.css`.
- Збірка: `node tools/build-site.js` → папка `site/` (її й публікує Netlify, кнопки збірки там немає).
- Картинки, шрифти, іконки — `site/assets/` (копії з гри).
- Netlify: сайт з цього репо, `netlify.toml` → publish `site`, build command — порожньо.
  Форма підтримки — Netlify Forms (увімкнути Form detection, сповіщення на spinfishapp@gmail.com).
- Сторінки: `/`, `/privacy/`, `/terms/`, `/delete-account/`, `/support/` (+ `/support/thanks/`); англійські — під `/en/`.
- Змінили умови чи політику — онови дату «Чинна з …» в обох мовах.
